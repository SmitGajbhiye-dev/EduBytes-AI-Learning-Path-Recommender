import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { searchCourses, getRecommendedCourses } from './courseService';
import YouTubeAPI from './youtubeAPI';

/**
 * NLP service for text analysis and personalized recommendations
 */
const NLPService = {
  /**
   * Analyze user text to extract key topics and learning intent
   * @param {string} text - The user's text input
   * @returns {Object} Analysis results
   */
  analyzeText: (text) => {
    const lowerCaseText = text.toLowerCase();
    
    // Categories/topics that we recognize
    const topics = {
      'web development': ['web', 'development', 'html', 'css', 'javascript', 'react', 'node', 'frontend', 'backend', 'fullstack'],
      'data science': ['data science', 'data analysis', 'statistics', 'machine learning', 'ml', 'ai', 'artificial intelligence', 'data visualization', 'pandas', 'numpy'],
      'mobile development': ['mobile', 'app development', 'ios', 'android', 'flutter', 'react native', 'swift', 'kotlin'],
      'cloud computing': ['cloud', 'aws', 'azure', 'gcp', 'devops', 'kubernetes', 'docker', 'microservices'],
      'cybersecurity': ['security', 'cybersecurity', 'hacking', 'penetration testing', 'encryption', 'network security'],
      'ui/ux design': ['ui', 'ux', 'design', 'user interface', 'user experience', 'figma', 'sketch', 'adobe xd'],
      'game development': ['game', 'unity', 'unreal', 'c#', 'c++', 'game design', '3d modeling'],
      'blockchain': ['blockchain', 'cryptocurrency', 'web3', 'smart contracts', 'solidity', 'ethereum'],
    };
    
    // Detect intent patterns
    const intents = {
      recommendation: ['recommend', 'suggestion', 'suggest', 'what should', 'good course', 'best course', 'help me find'],
      learning: ['how to learn', 'best way to learn', 'start learning', 'beginner in', 'new to'],
      comparison: ['versus', 'vs', 'compared to', 'difference between', 'better than'],
      roadmap: ['roadmap', 'learning path', 'career path', 'step by step', 'where to start']
    };
    
    // Detect difficulty level
    const difficultyLevels = {
      beginner: ['beginner', 'basic', 'fundamental', 'start', 'introduction', 'intro', 'new', 'novice'],
      intermediate: ['intermediate', 'improve', 'advance', 'better'],
      advanced: ['advanced', 'expert', 'professional', 'mastery', 'deep dive', 'complex']
    };
    
    // Detect matched topics
    const matchedTopics = [];
    for (const [topic, keywords] of Object.entries(topics)) {
      for (const keyword of keywords) {
        if (lowerCaseText.includes(keyword)) {
          if (!matchedTopics.includes(topic)) {
            matchedTopics.push(topic);
          }
          break;
        }
      }
    }
    
    // Detect intent
    let primaryIntent = 'general';
    for (const [intent, patterns] of Object.entries(intents)) {
      for (const pattern of patterns) {
        if (lowerCaseText.includes(pattern)) {
          primaryIntent = intent;
          break;
        }
      }
      if (primaryIntent !== 'general') break;
    }
    
    // Detect difficulty level
    let difficultyLevel = null;
    for (const [level, patterns] of Object.entries(difficultyLevels)) {
      for (const pattern of patterns) {
        if (lowerCaseText.includes(pattern)) {
          difficultyLevel = level;
          break;
        }
      }
      if (difficultyLevel) break;
    }
    
    return {
      topics: matchedTopics,
      intent: primaryIntent,
      difficultyLevel,
      originalText: text
    };
  },
  
  /**
   * Generate personalized course recommendations based on analysis and user profile
   * @param {string} userId - User ID for personalization
   * @param {Object} analysis - Text analysis results
   * @returns {Promise<Object>} Personalized recommendations
   */
  generateRecommendations: async (userId, analysis) => {
    try {
      const db = getFirestore();
      
      // Get user data for personalization
      let userInterests = [];
      let userHistory = [];
      let userLevel = 'beginner';
      
      if (userId) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userInterests = userData.interests || [];
            userHistory = userData.watchLater || [];
            userLevel = userData.skillLevel || 'beginner';
          }
        } catch (error) {
          console.error('Error fetching user data for recommendations:', error);
        }
      }
      
      // Combine analyzed topics with user interests if no specific topics found
      const searchTopics = analysis.topics.length > 0 
        ? analysis.topics 
        : userInterests.slice(0, 3);
      
      // Use detected difficulty level or user's level
      const difficulty = analysis.difficultyLevel || userLevel;
      
      // Handle different intents differently
      let recommendations = {
        courses: [],
        youtubeVideos: [],
        playlists: [],
        explanation: '',
      };
      
      // Generate topic string for search
      const topicString = searchTopics.length > 0 ? searchTopics[0] : 'programming';
      
      // Get course recommendations
      const coursesResult = await searchCourses(topicString, {
        levels: [difficulty]
      });
      
      if (coursesResult.success) {
        recommendations.courses = coursesResult.data.slice(0, 5);
      }
      
      // Get YouTube video recommendations
      const ytVideos = await YouTubeAPI.searchVideos(topicString, 5);
      recommendations.youtubeVideos = ytVideos;
      
      // Get YouTube playlists for learning paths
      if (analysis.intent === 'roadmap' || analysis.intent === 'learning') {
        const playlists = await YouTubeAPI.getPlaylists(topicString, 3);
        recommendations.playlists = playlists;
      }
      
      // Generate explanation based on intent and topics
      switch (analysis.intent) {
        case 'recommendation':
          recommendations.explanation = `Based on your interest in ${searchTopics.join(', ')}, here are some recommended courses that match your ${difficulty} level.`;
          break;
        case 'learning':
          recommendations.explanation = `To start learning ${searchTopics.join(', ')}, I recommend these resources. The playlists offer structured learning paths.`;
          break;
        case 'roadmap':
          recommendations.explanation = `Here's a learning roadmap for ${searchTopics.join(', ')}. The playlists are particularly helpful for following a structured path.`;
          break;
        case 'comparison':
          recommendations.explanation = `Here are resources that can help you compare different approaches in ${searchTopics.join(', ')}.`;
          break;
        default:
          recommendations.explanation = `Here are some resources on ${searchTopics.join(', ')} that might interest you.`;
      }
      
      return {
        success: true,
        data: recommendations
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return {
        success: false,
        error: error.message,
        data: {
          courses: [],
          youtubeVideos: [],
          playlists: [],
          explanation: 'I encountered an error while finding recommendations. Please try a different topic.'
        }
      };
    }
  }
};

export default NLPService; 