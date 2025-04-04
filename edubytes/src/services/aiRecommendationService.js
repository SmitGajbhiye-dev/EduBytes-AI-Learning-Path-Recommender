// AI Course Recommendation Service powered by Gemini API (Google AI)
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import YouTubeAPI from './youtubeAPI';

const AI_RECOMMENDATION_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with your actual Gemini API key
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

const AIRecommendationService = (() => {
  // Cache to avoid unnecessary API calls
  let recommendationCache = {};
  
  // Reference to Firestore database
  const db = getFirestore();
  
  // Platforms supported for course recommendations
  const platforms = [
    {
      name: "YouTube",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1024px-YouTube_full-color_icon_%282017%29.svg.png",
      type: "free",
      fetchFunction: async (query, count) => await YouTubeAPI.searchVideos(query, count)
    },
    {
      name: "Udemy",
      logo: "https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg",
      type: "paid",
      fetchFunction: async (query, count) => await simulateUdemySearch(query, count)
    },
    {
      name: "Coursera",
      logo: "https://d3njjcbhbojbot.cloudfront.net/web/images/favicons/android-chrome-512x512.png",
      type: "mixed",
      fetchFunction: async (query, count) => await simulateCourseraSearch(query, count)
    },
    {
      name: "edX",
      logo: "https://www.edx.org/images/logos/edx-logo-elm.svg",
      type: "mixed",
      fetchFunction: async (query, count) => await simulateEdXSearch(query, count)
    },
    {
      name: "Khan Academy",
      logo: "https://cdn.kastatic.org/images/khan-logo-vertical-transparent.png",
      type: "free",
      fetchFunction: async (query, count) => await simulateKhanAcademySearch(query, count)
    }
  ];
  
  // Get recommendations for a user based on their interests, experience level, and search query
  const getRecommendations = async (userId, searchQuery = "", options = {}) => {
    try {
      const {
        platforms: platformFilter = [],
        priceOptions = ["free", "paid"],
        limit = 15,
        experienceLevel = "all"
      } = options;
      
      // Generate cache key based on parameters
      const cacheKey = `${userId}_${searchQuery}_${platformFilter.join('_')}_${priceOptions.join('_')}_${limit}_${experienceLevel}`;
      
      // Check if cached recommendations exist and are still valid
      if (recommendationCache[cacheKey]) {
        const { timestamp, data } = recommendationCache[cacheKey];
        if (Date.now() - timestamp < AI_RECOMMENDATION_CACHE_DURATION) {
          console.log('Using cached AI recommendations');
          return { success: true, data };
        }
      }
      
      // Get user interests from Firestore
      let userInterests = [];
      
      if (userId) {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          userInterests = userDoc.data().interests || [];
        }
      }
      
      // Prepare search context for AI
      let searchContext = {};
      
      if (searchQuery) {
        // Use search query as primary context
        searchContext.query = searchQuery;
      } else if (userInterests.length > 0) {
        // Use user interests if no search query
        searchContext.interests = userInterests;
      } else {
        // Default topics if no query or interests
        searchContext.defaultTopics = ["programming", "data science", "web development", "machine learning"];
      }
      
      // Add experience level to context
      searchContext.experienceLevel = experienceLevel;
      
      // Get AI insights for better course recommendations
      const aiInsights = await getAIInsights(searchContext);
      
      // Filter platforms based on user preferences
      const filteredPlatforms = platforms.filter(platform => {
        // Filter by platform name if specified
        if (platformFilter.length > 0 && !platformFilter.includes(platform.name)) {
          return false;
        }
        
        // Filter by price option
        return priceOptions.includes(platform.type) || 
               (platform.type === "mixed" && (priceOptions.includes("free") || priceOptions.includes("paid")));
      });
      
      // If no platforms match filters, use all platforms
      const platformsToUse = filteredPlatforms.length > 0 ? filteredPlatforms : platforms;
      
      // Calculate how many courses to fetch from each platform
      const coursesPerPlatform = Math.ceil(limit / platformsToUse.length);
      
      // Generate optimized search queries for each platform based on AI insights
      const platformQueries = platformsToUse.map(platform => {
        return {
          platform: platform,
          query: aiInsights.optimizedQueries[platform.name.toLowerCase()] || 
                 aiInsights.optimizedQueries.default ||
                 searchQuery ||
                 (userInterests.length > 0 ? userInterests[0] : "programming")
        };
      });
      
      // Fetch courses from all platforms in parallel
      const platformFetchPromises = platformQueries.map(async ({ platform, query }) => {
        try {
          const courses = await platform.fetchFunction(query, coursesPerPlatform);
          return courses.map(course => ({
            ...course,
            platform: platform.name,
            platformLogo: platform.logo,
            aiRelevanceScore: calculateRelevanceScore(course, aiInsights)
          }));
        } catch (error) {
          console.error(`Error fetching courses from ${platform.name}:`, error);
          return [];
        }
      });
      
      let allCourses = await Promise.all(platformFetchPromises);
      allCourses = allCourses.flat();
      
      // Sort courses by AI relevance score
      allCourses.sort((a, b) => b.aiRelevanceScore - a.aiRelevanceScore);
      
      // Limit results
      const recommendations = allCourses.slice(0, limit);
      
      // Group recommendations by category from AI insights
      const categorizedRecommendations = {
        courses: recommendations,
        categories: {},
        insights: aiInsights
      };
      
      aiInsights.categories.forEach(category => {
        categorizedRecommendations.categories[category] = recommendations.filter(
          course => courseMatchesCategory(course, category, aiInsights)
        ).slice(0, 4); // Limit to 4 courses per category
      });
      
      // Save to cache
      recommendationCache[cacheKey] = {
        timestamp: Date.now(),
        data: categorizedRecommendations
      };
      
      // If user is logged in, save recommendation history
      if (userId) {
        try {
          await saveRecommendationHistory(userId, searchQuery, categorizedRecommendations);
        } catch (error) {
          console.error('Error saving recommendation history:', error);
        }
      }
      
      return { success: true, data: categorizedRecommendations };
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return { success: false, error: 'Failed to generate course recommendations' };
    }
  };
  
  // Get AI-powered insights for better recommendations using Gemini API
  const getAIInsights = async (searchContext) => {
    try {
      // For development/testing - return mock AI insights
      if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
        console.log('Using mock AI insights (Gemini API key not configured)');
        return getMockAIInsights(searchContext);
      }
      
      // Format search context for Gemini API
      const prompt = formatSearchPrompt(searchContext);
      
      // Call Gemini API
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
            topP: 0.8,
            topK: 40
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      // Parse structured response from Gemini
      try {
        // Extract JSON from the response (it may be wrapped in markdown code block)
        const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                         aiResponse.match(/```\n([\s\S]*?)\n```/) || 
                         [null, aiResponse];
        const jsonString = jsonMatch[1];
        return JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback to mock insights
        return getMockAIInsights(searchContext);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Fallback to mock insights
      return getMockAIInsights(searchContext);
    }
  };
  
  // Format prompt for Gemini API based on search context
  const formatSearchPrompt = (searchContext) => {
    let prompt = `Generate educational course recommendations based on the following information:\n\n`;
    
    if (searchContext.query) {
      prompt += `User search query: "${searchContext.query}"\n`;
    }
    
    if (searchContext.interests && searchContext.interests.length > 0) {
      prompt += `User interests: ${searchContext.interests.join(', ')}\n`;
    }
    
    if (searchContext.experienceLevel && searchContext.experienceLevel !== 'all') {
      prompt += `Experience level: ${searchContext.experienceLevel}\n`;
    }
    
    if (searchContext.defaultTopics) {
      prompt += `Default topics to consider: ${searchContext.defaultTopics.join(', ')}\n`;
    }
    
    prompt += `\nReturn a JSON object with the following structure:
{
  "categories": ["Category1", "Category2", "Category3"],
  "keyTopics": ["Topic1", "Topic2", "Topic3", "Topic4", "Topic5"],
  "optimizedQueries": {
    "youtube": "optimized search for YouTube",
    "udemy": "optimized search for Udemy",
    "coursera": "optimized search for Coursera",
    "edx": "optimized search for edX",
    "khanacademy": "optimized search for Khan Academy",
    "default": "general optimized search"
  },
  "skillLevel": "beginner|intermediate|advanced",
  "relevanceTerms": ["term1", "term2", "term3"],
  "learningPath": ["Step 1", "Step 2", "Step 3"]
}`;
    
    return prompt;
  };
  
  // Generate mock AI insights for testing without API
  const getMockAIInsights = (searchContext) => {
    const defaultInsights = {
      categories: ["Essential Fundamentals", "Practical Projects", "Advanced Concepts"],
      keyTopics: ["Syntax Basics", "Data Structures", "Algorithms", "OOP", "System Design"],
      optimizedQueries: {
        youtube: "programming tutorial beginner to advanced",
        udemy: "complete programming course",
        coursera: "computer science programming specialization",
        edx: "introduction to programming cs",
        khanacademy: "programming basics",
        default: "learn programming"
      },
      skillLevel: "beginner",
      relevanceTerms: ["coding", "programming", "developer", "software", "computer science"],
      learningPath: [
        "Learn basic syntax and concepts",
        "Build simple applications",
        "Study data structures and algorithms",
        "Create more complex projects",
        "Specialize in a specific area"
      ]
    };
    
    if (searchContext.query) {
      const query = searchContext.query.toLowerCase();
      
      // Web development
      if (query.includes("web") || query.includes("javascript") || query.includes("html") || query.includes("css")) {
        return {
          categories: ["Frontend Basics", "Backend Development", "Full Stack Projects"],
          keyTopics: ["HTML/CSS", "JavaScript", "React", "Node.js", "Web APIs"],
          optimizedQueries: {
            youtube: "web development tutorial",
            udemy: "full stack web development course",
            coursera: "web development specialization",
            edx: "web programming course",
            khanacademy: "html css javascript",
            default: "web development"
          },
          skillLevel: searchContext.experienceLevel === "advanced" ? "advanced" : "beginner",
          relevanceTerms: ["web", "frontend", "backend", "javascript", "html", "css", "react", "node"],
          learningPath: [
            "Learn HTML and CSS fundamentals",
            "Master JavaScript core concepts",
            "Build interactive frontend with a framework",
            "Study backend development",
            "Create full stack projects"
          ]
        };
      }
      
      // Data science
      if (query.includes("data") || query.includes("python") || query.includes("machine learning") || query.includes("ai")) {
        return {
          categories: ["Python Foundations", "Data Analysis", "Machine Learning"],
          keyTopics: ["Python", "Statistics", "Data Visualization", "ML Algorithms", "Deep Learning"],
          optimizedQueries: {
            youtube: "data science python tutorial",
            udemy: "data science machine learning course",
            coursera: "data science specialization python",
            edx: "introduction to data science",
            khanacademy: "statistics probability",
            default: "data science python"
          },
          skillLevel: searchContext.experienceLevel === "beginner" ? "beginner" : "intermediate",
          relevanceTerms: ["data", "python", "statistics", "machine learning", "analysis", "visualization"],
          learningPath: [
            "Learn Python programming",
            "Study statistics and probability",
            "Master data manipulation and visualization",
            "Understand machine learning algorithms",
            "Build data science projects"
          ]
        };
      }
    }
    
    return defaultInsights;
  };
  
  // Calculate relevance score for a course based on AI insights
  const calculateRelevanceScore = (course, aiInsights) => {
    let score = 50; // Base score
    
    // Check title for relevant terms
    aiInsights.relevanceTerms.forEach(term => {
      if (course.title.toLowerCase().includes(term.toLowerCase())) {
        score += 10;
      }
    });
    
    // Check if course matches skill level
    if (course.level && course.level.toLowerCase() === aiInsights.skillLevel) {
      score += 15;
    }
    
    // Check if course is from a popular channel/instructor
    if (course.channelTitle && isPremiumCreator(course.channelTitle)) {
      score += 10;
    }
    
    // Prioritize courses with higher engagement metrics
    if (course.viewCount) {
      // Approximate view count from formatted string
      let viewCountValue = 0;
      if (typeof course.viewCount === 'string') {
        if (course.viewCount.includes('M')) {
          viewCountValue = parseFloat(course.viewCount) * 1000000;
        } else if (course.viewCount.includes('K')) {
          viewCountValue = parseFloat(course.viewCount) * 1000;
        } else {
          viewCountValue = parseInt(course.viewCount);
        }
      }
      
      if (viewCountValue > 1000000) score += 15;
      else if (viewCountValue > 500000) score += 10;
      else if (viewCountValue > 100000) score += 5;
    }
    
    // Add some randomness for variety (±5 points)
    score += Math.floor(Math.random() * 10) - 5;
    
    // Ensure score stays in reasonable range
    return Math.max(0, Math.min(100, score));
  };
  
  // Check if a course matches a category based on AI insights
  const courseMatchesCategory = (course, category, aiInsights) => {
    const title = course.title.toLowerCase();
    const description = course.description ? course.description.toLowerCase() : '';
    
    // Logic for matching courses to categories based on AI insights
    switch (category) {
      case "Frontend Basics":
      case "Essential Fundamentals":
        return title.includes("basics") || 
               title.includes("fundamental") || 
               title.includes("introduction") || 
               title.includes("beginner");
        
      case "Backend Development":
      case "Advanced Concepts":
        return title.includes("advanced") || 
               title.includes("backend") || 
               title.includes("server") || 
               title.includes("expert");
        
      case "Full Stack Projects":
      case "Practical Projects":
        return title.includes("project") || 
               title.includes("build") || 
               title.includes("create") || 
               title.includes("full stack");
        
      case "Python Foundations":
        return title.includes("python") && 
              (title.includes("basics") || 
               title.includes("fundamental") || 
               title.includes("introduction"));
        
      case "Data Analysis":
        return title.includes("data") && 
              (title.includes("analysis") || 
               title.includes("visualization") || 
               title.includes("pandas"));
        
      case "Machine Learning":
        return title.includes("machine learning") || 
               title.includes("deep learning") || 
               title.includes("neural network") || 
               title.includes("ai");
        
      default:
        // Check if any key topic from AI insights is in the title
        return aiInsights.keyTopics.some(topic => 
          title.includes(topic.toLowerCase()) || description.includes(topic.toLowerCase())
        );
    }
  };
  
  // Check if a channel/instructor is a premium creator
  const isPremiumCreator = (channelTitle) => {
    const premiumCreators = [
      "freeCodeCamp.org", "Traversy Media", "The Net Ninja", "Academind", 
      "Programming with Mosh", "CS50", "Coding Train", "sentdex", "Tech With Tim",
      "Corey Schafer", "Khan Academy", "Fireship", "Clever Programmer", "Web Dev Simplified"
    ];
    
    return premiumCreators.some(creator => 
      channelTitle.toLowerCase().includes(creator.toLowerCase())
    );
  };
  
  // Save recommendation history for personalization
  const saveRecommendationHistory = async (userId, searchQuery, recommendations) => {
    const historyRef = doc(db, "users", userId, "recommendationHistory", Date.now().toString());
    
    await setDoc(historyRef, {
      timestamp: Date.now(),
      query: searchQuery,
      insights: recommendations.insights,
      courseCount: recommendations.courses.length,
      // Only save IDs and minimal info to save space
      courseIds: recommendations.courses.map(course => ({
        id: course.id,
        platform: course.platform,
        title: course.title,
        score: course.aiRelevanceScore
      }))
    });
  };
  
  // Mock functions for other platforms (in production these would be real API calls)
  
  // Simulate Udemy search
  const simulateUdemySearch = async (query, count) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock data
    const udemyCourses = [
      {
        id: "udemy-1",
        title: "Complete Web Development Bootcamp",
        description: "Become a full-stack web developer with just one course. HTML, CSS, Javascript, Node, React, MongoDB, and more!",
        thumbnail: "https://img-c.udemycdn.com/course/480x270/1565838_e54e_16.jpg",
        instructor: "Dr. Angela Yu",
        level: "beginner",
        duration: "65 hours",
        rating: 4.7,
        studentsCount: "684,000+",
        price: 19.99,
        url: "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
        platform: "Udemy"
      },
      {
        id: "udemy-2",
        title: "Python for Data Science and Machine Learning Bootcamp",
        description: "Learn how to use NumPy, Pandas, Seaborn, Matplotlib, Scikit-Learn, and more!",
        thumbnail: "https://img-c.udemycdn.com/course/480x270/903744_8eb2.jpg",
        instructor: "Jose Portilla",
        level: "intermediate",
        duration: "25 hours",
        rating: 4.6,
        studentsCount: "420,000+",
        price: 18.99,
        url: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
        platform: "Udemy"
      },
      {
        id: "udemy-3",
        title: "React - The Complete Guide (incl Hooks, React Router, Redux)",
        description: "Dive in and learn React.js from scratch! Learn Reactjs, Hooks, Redux, React Routing, Animations, Next.js and way more!",
        thumbnail: "https://img-c.udemycdn.com/course/480x270/1362070_b9a1_2.jpg",
        instructor: "Maximilian Schwarzmüller",
        level: "intermediate",
        duration: "48 hours",
        rating: 4.7,
        studentsCount: "569,000+",
        price: 19.99,
        url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
        platform: "Udemy"
      }
    ];
    
    return udemyCourses.slice(0, count);
  };
  
  // Simulate Coursera search
  const simulateCourseraSearch = async (query, count) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock data
    const courseraCourses = [
      {
        id: "coursera-1",
        title: "Machine Learning",
        description: "This course provides a broad introduction to machine learning, datamining, and statistical pattern recognition.",
        thumbnail: "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/08/8c6df0f08c11e8b6e2ff2a449a345a/ML-Logo.png",
        instructor: "Andrew Ng",
        level: "intermediate",
        duration: "60 hours",
        rating: 4.9,
        studentsCount: "4.8M+",
        price: 0,
        isPaid: false,
        url: "https://www.coursera.org/learn/machine-learning",
        platform: "Coursera"
      },
      {
        id: "coursera-2",
        title: "Python for Everybody Specialization",
        description: "Learn to Program and Analyze Data with Python. Develop programs to gather, clean, analyze, and visualize data.",
        thumbnail: "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/59/9461e0d44f11e792f339a73a1e53b0/pythoneveryone_thumbnail_1x1.png",
        instructor: "Charles Russell Severance",
        level: "beginner",
        duration: "85 hours",
        rating: 4.8,
        studentsCount: "1.9M+",
        price: 0,
        isPaid: false,
        url: "https://www.coursera.org/specializations/python",
        platform: "Coursera"
      },
      {
        id: "coursera-3",
        title: "Deep Learning Specialization",
        description: "Become a Deep Learning Expert. Master Deep Learning and Break into AI.",
        thumbnail: "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/84/6606905716418b9377273decd1af49/Raw-Logo.png",
        instructor: "Andrew Ng",
        level: "advanced",
        duration: "124 hours",
        rating: 4.9,
        studentsCount: "750K+",
        price: 49,
        isPaid: true,
        url: "https://www.coursera.org/specializations/deep-learning",
        platform: "Coursera"
      }
    ];
    
    return courseraCourses.slice(0, count);
  };
  
  // Simulate edX search
  const simulateEdXSearch = async (query, count) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock data
    const edXCourses = [
      {
        id: "edx-1",
        title: "CS50's Introduction to Computer Science",
        description: "An introduction to the intellectual enterprises of computer science and the art of programming.",
        thumbnail: "https://prod-discovery.edx-cdn.org/media/course/image/da1b2400-322b-459b-97b0-0c557f05d017-1b1e7c6a3de8.small.png",
        instructor: "David J. Malan",
        level: "beginner",
        duration: "12 weeks",
        rating: 4.9,
        studentsCount: "3.2M+",
        price: 0,
        isPaid: false,
        url: "https://www.edx.org/course/introduction-computer-science-harvardx-cs50x",
        platform: "edX"
      },
      {
        id: "edx-2",
        title: "Data Science: R Basics",
        description: "Build a foundation in R and learn how to wrangle, analyze, and visualize data.",
        thumbnail: "https://prod-discovery.edx-cdn.org/media/course/image/0e8a78d6-9f73-4806-b161-9c848a480b7b-3942b4e8ba80.small.jpg",
        instructor: "Rafael Irizarry",
        level: "intermediate",
        duration: "8 weeks",
        rating: 4.6,
        studentsCount: "850K+",
        price: 49,
        isPaid: true,
        url: "https://www.edx.org/course/data-science-r-basics",
        platform: "edX"
      }
    ];
    
    return edXCourses.slice(0, count);
  };
  
  // Simulate Khan Academy search
  const simulateKhanAcademySearch = async (query, count) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock data
    const khanCourses = [
      {
        id: "khan-1",
        title: "Computer Programming",
        description: "Learn the basics of programming using JavaScript and ProcessingJS.",
        thumbnail: "https://cdn.kastatic.org/genfiles/topic_icons/icons/algebra.png-e13680-256c.png",
        instructor: "Khan Academy",
        level: "beginner",
        duration: "Self-paced",
        rating: 4.7,
        studentsCount: "2M+",
        price: 0,
        isPaid: false,
        url: "https://www.khanacademy.org/computing/computer-programming",
        platform: "Khan Academy"
      },
      {
        id: "khan-2",
        title: "Statistics and probability",
        description: "Learn statistics and probability—everything you'd want to know about descriptive and inferential statistics.",
        thumbnail: "https://cdn.kastatic.org/genfiles/topic_icons/icons/statistics.png-a1e5d6-256c.png",
        instructor: "Khan Academy",
        level: "beginner",
        duration: "Self-paced",
        rating: 4.8,
        studentsCount: "1.5M+",
        price: 0,
        isPaid: false,
        url: "https://www.khanacademy.org/math/statistics-probability",
        platform: "Khan Academy"
      }
    ];
    
    return khanCourses.slice(0, count);
  };
  
  // Public API
  return {
    getRecommendations,
    platforms
  };
})();

export default AIRecommendationService; 