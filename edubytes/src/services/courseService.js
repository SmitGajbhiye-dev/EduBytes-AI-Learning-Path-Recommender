import axios from 'axios';

// Since we don't have direct access to all the APIs mentioned in the requirements,
// we'll create a mock service for demonstration purposes. In a real application,
// you would implement actual API calls to these services.

// Base URL for your API or mock data
const MOCK_API_URL = import.meta.env.VITE_MOCK_API_URL || 'https://mocki.io/v1/c082a6c7-aaa2-4e5e-b61b-a006a021266c';

// We'll simulate querying multiple course providers by using categories in our mock data
const COURSE_PROVIDERS = [
  'Udemy', 
  'Coursera', 
  'edX', 
  'YouTube Learning',
  'Khan Academy',
  'LinkedIn Learning',
  'Pluralsight',
  'Skillshare',
  'Codecademy',
  'MIT OpenCourseWare',
  'Harvard Online',
  'Stanford Online',
  'FutureLearn',
  'Udacity',
  'Microsoft Learn',
  'Google Cloud Skills',
  'IBM SkillsBuild',
  'OpenAI Courses',
  'AWS Training',
  'DataCamp',
  'Medscape',
  'Elsevier',
  'LawCourses',
  'HarvardBusiness',
  'FineArtsAcademy'
];

// Function to get mock courses data
// In a real application, this would be replaced with actual API calls
const getMockCourses = async () => {
  // Generate mock courses data
  // In a real application, this data would come from API calls to different providers
  try {
    // For development, use generated mock data directly to avoid CORS issues
    console.log('Using generated mock data for development');
    return generateMockCourses();
  } catch (error) {
    console.error('Error generating mock data', error);
    return [];
  }
};

// Function to generate mock course data
const generateMockCourses = () => {
  const mockCourses = [];
  
  // Generate courses for different categories
  const categories = [
    'Computer Science', 'Data Science', 'Web Development', 
    'Mobile Development', 'Design', 'Business', 'Marketing',
    'Finance', 'Medicine', 'Health', 'Law', 'Arts',
    'Music', 'Photography', 'Personal Development'
  ];
  
  // Generate levels
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  
  // Generate mock courses
  for (let i = 1; i <= 200; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const provider = COURSE_PROVIDERS[Math.floor(Math.random() * COURSE_PROVIDERS.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const isFree = Math.random() < 0.3; // 30% chance of being free
    
    // Generate topics based on category
    const topics = generateTopicsForCategory(category);
    
    mockCourses.push({
      id: `course-${i}`,
      title: generateCourseTitle(category, level),
      description: `This is a ${level.toLowerCase()} level course on ${category.toLowerCase()} topics. ${generateCourseDescription(category)}`,
      provider: provider,
      url: `https://example.com/courses/${i}`,
      imageUrl: `https://source.unsplash.com/300x200/?${encodeURIComponent(category.toLowerCase())}`,
      price: isFree ? 0 : Math.floor(Math.random() * 200) + 10, // $10-$210
      rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
      studentsEnrolled: Math.floor(Math.random() * 50000) + 1000, // 1000-51000
      duration: `${Math.floor(Math.random() * 40) + 5} hours`,
      level: level,
      category: category,
      topics: topics,
      lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toISOString(), // Within last year
      isCertified: Math.random() < 0.7 // 70% chance of being certified
    });
  }
  
  return mockCourses;
};

/**
 * Fetch courses based on query and filters
 * @param {string} query - Search query
 * @param {Object} filters - Filters like provider, price range, level, etc.
 * @returns {Promise<Array>} - List of courses
 */
export const searchCourses = async (query, filters = {}) => {
  try {
    // Get mock data
    const mockResponse = await getMockCourses();
    
    // Filter the mock data based on query and filters
    let filteredCourses = mockResponse;
    
    // Apply search query filter
    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      filteredCourses = filteredCourses.filter(course => {
        return searchTerms.some(term => 
          course.title.toLowerCase().includes(term) || 
          course.description.toLowerCase().includes(term) ||
          course.topics.some(topic => topic.toLowerCase().includes(term))
        );
      });
    }
    
    // Apply provider filter
    if (filters.providers && filters.providers.length > 0) {
      filteredCourses = filteredCourses.filter(course => 
        filters.providers.includes(course.provider)
      );
    }
    
    // Apply price filter
    if (filters.priceRange) {
      const { min = 0, max = Infinity } = filters.priceRange;
      filteredCourses = filteredCourses.filter(course => 
        (course.price >= min && course.price <= max) ||
        (course.price === 0 && filters.includeFree)
      );
    }
    
    // Apply level filter
    if (filters.levels && filters.levels.length > 0) {
      filteredCourses = filteredCourses.filter(course => 
        filters.levels.includes(course.level)
      );
    }
    
    return {
      success: true,
      data: filteredCourses,
      totalResults: filteredCourses.length
    };
  } catch (error) {
    console.error('Error searching courses:', error);
    return {
      success: false,
      error: error.message || 'Failed to search courses',
      data: []
    };
  }
};

/**
 * Get course recommendations based on learning path
 * @param {Object} learningPath - The learning path object from Gemini AI
 * @returns {Promise<Array>} - List of recommended courses
 */
export const getRecommendedCourses = async (learningPath) => {
  try {
    // Extract key topics from learning path
    const allTopics = [];
    
    // Get topics from core focus
    if (learningPath.coreFocus && Array.isArray(learningPath.coreFocus)) {
      allTopics.push(...learningPath.coreFocus);
    }
    
    // Get topics from steps
    if (learningPath.steps && Array.isArray(learningPath.steps)) {
      learningPath.steps.forEach(step => {
        if (step.keyTopics && Array.isArray(step.keyTopics)) {
          allTopics.push(...step.keyTopics);
        }
      });
    }
    
    // Remove duplicates
    const uniqueTopics = [...new Set(allTopics)];
    
    // Get courses for each topic
    const coursePromises = uniqueTopics.map(topic => 
      searchCourses(topic, {})
    );
    
    const courseResults = await Promise.all(coursePromises);
    
    // Flatten and deduplicate courses
    let allCourses = [];
    courseResults.forEach(result => {
      if (result.success && result.data) {
        allCourses.push(...result.data);
      }
    });
    
    // Remove duplicate courses (by id)
    const uniqueCourses = [];
    const seenIds = new Set();
    
    allCourses.forEach(course => {
      if (!seenIds.has(course.id)) {
        seenIds.add(course.id);
        uniqueCourses.push(course);
      }
    });
    
    // Organize courses by learning path steps
    const organizedCourses = {};
    
    if (learningPath.steps && Array.isArray(learningPath.steps)) {
      learningPath.steps.forEach(step => {
        const stepTitle = step.title;
        const stepTopics = step.keyTopics || [];
        const stepLevel = step.skillLevel || '';
        
        // Filter courses relevant to this step
        const stepCourses = uniqueCourses.filter(course => {
          // Match course topics with step topics
          const hasRelevantTopic = stepTopics.some(topic => 
            course.topics.some(courseTopic => 
              courseTopic.toLowerCase().includes(topic.toLowerCase())
            )
          );
          
          // Match course level with step level if specified
          const hasMatchingLevel = !stepLevel || 
            course.level.toLowerCase() === stepLevel.toLowerCase();
          
          return hasRelevantTopic && hasMatchingLevel;
        });
        
        organizedCourses[stepTitle] = stepCourses;
      });
    }
    
    return {
      success: true,
      data: {
        allCourses: uniqueCourses,
        organizedByStep: organizedCourses
      }
    };
  } catch (error) {
    console.error('Error getting recommended courses:', error);
    return {
      success: false,
      error: error.message || 'Failed to get recommended courses',
      data: { allCourses: [], organizedByStep: {} }
    };
  }
};

/**
 * Get trending courses across different platforms
 * @param {number} limit - Number of courses to return
 * @returns {Promise<Array>} - List of trending courses
 */
export const getTrendingCourses = async (limit = 10) => {
  try {
    // In a real application, you would make API calls to different providers
    // to get their trending courses. For this demo, we'll use mock data.
    const mockResponse = await getMockCourses();
    
    // Simulate trending courses by sorting by rating and students enrolled
    const trendingCourses = mockResponse
      .sort((a, b) => {
        // Sort by a combination of rating and enrollment
        const aScore = a.rating * 0.7 + (a.studentsEnrolled / 10000) * 0.3;
        const bScore = b.rating * 0.7 + (b.studentsEnrolled / 10000) * 0.3;
        return bScore - aScore;
      })
      .slice(0, limit);
    
    return {
      success: true,
      data: trendingCourses
    };
  } catch (error) {
    console.error('Error getting trending courses:', error);
    return {
      success: false,
      error: error.message || 'Failed to get trending courses',
      data: []
    };
  }
};

/**
 * Get courses by category (field of study)
 * @param {string} category - Category or field (e.g., "Computer Science", "Medicine")
 * @param {number} limit - Number of courses to return
 * @returns {Promise<Array>} - List of courses in the category
 */
export const getCoursesByCategory = async (category, limit = 20) => {
  try {
    // In a real application, you would make API calls to different providers
    // filtered by category. For this demo, we'll use mock data.
    const mockResponse = await getMockCourses();
    
    // Filter courses by category
    const categoryCourses = mockResponse
      .filter(course => 
        course.category.toLowerCase() === category.toLowerCase() ||
        course.topics.some(topic => topic.toLowerCase().includes(category.toLowerCase()))
      )
      .slice(0, limit);
    
    return {
      success: true,
      data: categoryCourses
    };
  } catch (error) {
    console.error('Error getting courses by category:', error);
    return {
      success: false,
      error: error.message || 'Failed to get courses by category',
      data: []
    };
  }
};

/**
 * Get detailed information about a specific course
 * @param {string} courseId - Course ID
 * @param {string} provider - Course provider
 * @returns {Promise<Object>} - Course details
 */
export const getCourseDetails = async (courseId, provider) => {
  try {
    // In a real application, you would make an API call to the specific provider
    // to get detailed course information. For this demo, we'll use mock data.
    const mockResponse = await getMockCourses();
    
    // Find the course by ID and provider
    const course = mockResponse.find(c => c.id === courseId && c.provider === provider);
    
    if (!course) {
      return {
        success: false,
        error: 'Course not found',
        data: null
      };
    }
    
    return {
      success: true,
      data: course
    };
  } catch (error) {
    console.error('Error getting course details:', error);
    return {
      success: false,
      error: error.message || 'Failed to get course details',
      data: null
    };
  }
};

// Helper functions for mock data generation
const generateCourseTitle = (category, level) => {
  const titlePrefixes = [
    'Complete', 'Comprehensive', 'Ultimate', 'Essential', 
    'Practical', 'Modern', 'Advanced', 'Introduction to',
    'Mastering', 'Professional', 'Certified', 'Expert'
  ];
  
  const titleSuffixes = [
    'Bootcamp', 'Course', 'Masterclass', 'Guide',
    'Training', 'Tutorial', 'Workshop', 'Certification',
    'Fundamentals', 'Specialization', 'Deep Dive', 'Essentials'
  ];
  
  const prefix = titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)];
  const suffix = titleSuffixes[Math.floor(Math.random() * titleSuffixes.length)];
  
  return `${prefix} ${category} ${suffix}`;
};

const generateCourseDescription = (category) => {
  const descriptions = {
    'Computer Science': 'Learn computer science principles, algorithms, data structures, and computational thinking.',
    'Data Science': 'Master data analysis, visualization, machine learning, and statistical methods to derive insights from data.',
    'Web Development': 'Build responsive websites and web applications using modern frameworks and best practices.',
    'Mobile Development': 'Create native and cross-platform mobile applications for iOS and Android devices.',
    'Design': 'Learn design principles, UI/UX, graphic design, and creative tools to create stunning visuals.',
    'Business': 'Develop business acumen, strategy, management, and entrepreneurial skills.',
    'Marketing': 'Master digital marketing, SEO, social media, content marketing, and growth strategies.',
    'Finance': 'Understanding financial principles, investment strategies, accounting, and financial analysis.',
    'Medicine': 'Study medical sciences, healthcare procedures, anatomy, and clinical practices.',
    'Health': 'Learn about nutrition, fitness, mental wellbeing, and preventative health measures.',
    'Law': 'Study legal principles, case law, legal writing, and specific areas of legal practice.',
    'Arts': 'Develop artistic skills, creative expression, and appreciation for various art forms.',
    'Music': 'Learn music theory, performance techniques, composition, and music production.',
    'Photography': 'Master photography techniques, composition, editing, and visual storytelling.',
    'Personal Development': 'Improve productivity, leadership, communication, and life management skills.'
  };
  
  return descriptions[category] || 'This course provides comprehensive education on the subject matter.';
};

const generateTopicsForCategory = (category) => {
  const topicsMaps = {
    'Computer Science': ['Algorithms', 'Data Structures', 'Programming Languages', 'Computational Theory', 'Operating Systems', 'Networking', 'Computer Architecture'],
    'Data Science': ['Machine Learning', 'Statistics', 'Python', 'R', 'Data Visualization', 'Big Data', 'SQL', 'Data Mining', 'NLP'],
    'Web Development': ['HTML/CSS', 'JavaScript', 'React', 'Angular', 'Vue', 'Node.js', 'PHP', 'Django', 'Ruby on Rails', 'Responsive Design'],
    'Mobile Development': ['iOS', 'Android', 'Swift', 'Kotlin', 'React Native', 'Flutter', 'Mobile UX', 'App Lifecycle', 'Push Notifications'],
    'Design': ['UI/UX', 'Graphic Design', 'Adobe Creative Suite', 'Figma', 'Typography', 'Color Theory', 'Design Systems', 'Branding'],
    'Business': ['Management', 'Entrepreneurship', 'Strategy', 'Leadership', 'Operations', 'Business Models', 'Negotiation', 'Decision Making'],
    'Marketing': ['Digital Marketing', 'SEO', 'Content Marketing', 'Social Media', 'Email Marketing', 'Analytics', 'Market Research', 'Branding'],
    'Finance': ['Accounting', 'Investment', 'Financial Analysis', 'Risk Management', 'Corporate Finance', 'Personal Finance', 'Banking', 'Taxation'],
    'Medicine': ['Anatomy', 'Physiology', 'Pharmacology', 'Clinical Skills', 'Pathology', 'Medical Ethics', 'Patient Care', 'Diagnostics'],
    'Health': ['Nutrition', 'Fitness', 'Mental Health', 'Wellness', 'Preventative Care', 'Sleep Science', 'Stress Management', 'Health Psychology'],
    'Law': ['Constitutional Law', 'Contract Law', 'Criminal Law', 'Legal Writing', 'Torts', 'Intellectual Property', 'International Law', 'Legal Ethics'],
    'Arts': ['Painting', 'Sculpture', 'Drawing', 'Art History', 'Ceramics', 'Printmaking', 'Mixed Media', 'Art Theory'],
    'Music': ['Music Theory', 'Composition', 'Performance', 'Production', 'Instruments', 'Music History', 'Ear Training', 'Recording'],
    'Photography': ['Camera Skills', 'Composition', 'Lighting', 'Editing', 'Portrait Photography', 'Landscape Photography', 'Commercial Photography', 'Photography Business'],
    'Personal Development': ['Productivity', 'Leadership', 'Communication', 'Time Management', 'Goal Setting', 'Public Speaking', 'Emotional Intelligence', 'Critical Thinking']
  };
  
  const allTopics = topicsMaps[category] || ['General Knowledge', 'Basic Skills', 'Core Concepts', 'Practical Application'];
  
  // Pick 3-6 random topics
  const numTopics = Math.floor(Math.random() * 4) + 3;
  const selectedTopics = [];
  
  for (let i = 0; i < numTopics; i++) {
    const randomTopic = allTopics[Math.floor(Math.random() * allTopics.length)];
    if (!selectedTopics.includes(randomTopic)) {
      selectedTopics.push(randomTopic);
    }
  }
  
  return selectedTopics;
}; 