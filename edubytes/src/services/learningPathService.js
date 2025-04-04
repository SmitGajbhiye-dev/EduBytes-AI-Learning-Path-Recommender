import { updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Sample career paths with predefined learning paths
const careerPathTemplates = {
  'web-development': {
    title: 'Web Development',
    description: 'Master frontend and backend technologies to become a full-stack web developer',
    coreFocus: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Databases'],
    steps: [
      {
        title: 'Web Fundamentals',
        description: 'Learn the core technologies of the web: HTML, CSS and JavaScript',
        skillLevel: 'Beginner',
        keyTopics: ['HTML5', 'CSS3', 'JavaScript Basics', 'Responsive Design'],
        estimatedTime: '4-6 weeks'
      },
      {
        title: 'Frontend Development',
        description: 'Master modern frontend frameworks and tools',
        skillLevel: 'Intermediate',
        keyTopics: ['React', 'State Management', 'CSS Frameworks', 'Web APIs'],
        estimatedTime: '8-10 weeks'
      },
      {
        title: 'Backend Development',
        description: 'Build server-side applications and APIs',
        skillLevel: 'Intermediate',
        keyTopics: ['Node.js', 'Express', 'REST APIs', 'Authentication'],
        estimatedTime: '6-8 weeks'
      },
      {
        title: 'Database & Deployment',
        description: 'Learn database technologies and deployment strategies',
        skillLevel: 'Intermediate',
        keyTopics: ['SQL', 'NoSQL', 'Cloud Deployment', 'CI/CD'],
        estimatedTime: '4-6 weeks'
      },
      {
        title: 'Advanced Topics',
        description: 'Explore advanced concepts and specialized areas',
        skillLevel: 'Advanced',
        keyTopics: ['GraphQL', 'Microservices', 'Performance Optimization', 'Security'],
        estimatedTime: '6-8 weeks'
      }
    ]
  },
  'data-science': {
    title: 'Data Science',
    description: 'Develop expertise in data analysis, machine learning, and AI to become a data scientist',
    coreFocus: ['Python', 'Statistics', 'Machine Learning', 'Data Visualization', 'Big Data'],
    steps: [
      {
        title: 'Python Fundamentals',
        description: 'Learn Python programming and data science libraries',
        skillLevel: 'Beginner',
        keyTopics: ['Python Basics', 'NumPy', 'Pandas', 'Data Manipulation'],
        estimatedTime: '4-6 weeks'
      },
      {
        title: 'Statistics & Mathematics',
        description: 'Master the mathematical foundations of data science',
        skillLevel: 'Intermediate',
        keyTopics: ['Probability', 'Statistical Analysis', 'Linear Algebra', 'Calculus'],
        estimatedTime: '6-8 weeks'
      },
      {
        title: 'Data Visualization & Analysis',
        description: 'Learn to explore and visualize data effectively',
        skillLevel: 'Intermediate',
        keyTopics: ['Matplotlib', 'Seaborn', 'Exploratory Data Analysis', 'Data Cleaning'],
        estimatedTime: '4-6 weeks'
      },
      {
        title: 'Machine Learning',
        description: 'Understand ML algorithms and their applications',
        skillLevel: 'Advanced',
        keyTopics: ['Supervised Learning', 'Unsupervised Learning', 'Scikit-learn', 'Model Evaluation'],
        estimatedTime: '8-10 weeks'
      },
      {
        title: 'Deep Learning & AI',
        description: 'Explore neural networks and advanced AI concepts',
        skillLevel: 'Advanced',
        keyTopics: ['Neural Networks', 'TensorFlow', 'Natural Language Processing', 'Computer Vision'],
        estimatedTime: '8-10 weeks'
      }
    ]
  },
  'digital-marketing': {
    title: 'Digital Marketing',
    description: 'Develop skills in various digital marketing channels to drive business growth',
    coreFocus: ['Content Marketing', 'SEO', 'Social Media', 'Analytics', 'Ad Campaigns'],
    steps: [
      {
        title: 'Marketing Fundamentals',
        description: 'Learn the core concepts of digital marketing',
        skillLevel: 'Beginner',
        keyTopics: ['Marketing Principles', 'Buyer Personas', 'Marketing Channels', 'Brand Strategy'],
        estimatedTime: '3-4 weeks'
      },
      {
        title: 'Content & SEO',
        description: 'Master content creation and search engine optimization',
        skillLevel: 'Intermediate',
        keyTopics: ['Content Marketing', 'SEO Techniques', 'Keyword Research', 'Content Strategy'],
        estimatedTime: '6-8 weeks'
      },
      {
        title: 'Social Media Marketing',
        description: 'Learn to effectively market on social platforms',
        skillLevel: 'Intermediate',
        keyTopics: ['Social Media Strategy', 'Community Management', 'Social Advertising', 'Influencer Marketing'],
        estimatedTime: '4-6 weeks'
      },
      {
        title: 'Paid Advertising',
        description: 'Master paid marketing channels and campaigns',
        skillLevel: 'Intermediate',
        keyTopics: ['Google Ads', 'Facebook Ads', 'Display Advertising', 'Retargeting'],
        estimatedTime: '5-7 weeks'
      },
      {
        title: 'Analytics & Optimization',
        description: 'Analyze marketing performance and optimize campaigns',
        skillLevel: 'Advanced',
        keyTopics: ['Google Analytics', 'Marketing KPIs', 'A/B Testing', 'Conversion Optimization'],
        estimatedTime: '4-6 weeks'
      }
    ]
  },
};

/**
 * Generate a learning path based on career goal and preferences
 * @param {Object} params - Parameters for generating learning path
 * @param {string} params.careerGoal - Career goal (e.g., "web development", "data science")
 * @param {string} params.currentLevel - Current skill level (beginner, intermediate, advanced)
 * @param {string} params.timeCommitment - Time commitment (e.g., "1-3 hours/week", "10+ hours/week")
 * @param {Array} params.interests - Areas of interest
 * @returns {Promise<Object>} - Generated learning path
 */
export const generateLearningPath = async (params) => {
  try {
    // In a real app, this would call an AI API like Google Gemini or OpenAI
    // For now, we'll return predefined templates
    const { careerGoal } = params;
    
    // Normalize career goal string to match template keys
    const normalizedCareerGoal = careerGoal
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    // Find closest matching template
    let matchedTemplate = null;
    
    if (normalizedCareerGoal.includes('web') || normalizedCareerGoal.includes('frontend') || normalizedCareerGoal.includes('backend')) {
      matchedTemplate = 'web-development';
    } else if (normalizedCareerGoal.includes('data') || normalizedCareerGoal.includes('machine') || normalizedCareerGoal.includes('ai')) {
      matchedTemplate = 'data-science';
    } else if (normalizedCareerGoal.includes('market') || normalizedCareerGoal.includes('content') || normalizedCareerGoal.includes('seo')) {
      matchedTemplate = 'digital-marketing';
    } else {
      // Default to web development if no match found
      matchedTemplate = 'web-development';
    }
    
    const template = careerPathTemplates[matchedTemplate];
    
    // Add metadata to the learning path
    const learningPath = {
      ...template,
      id: `path-${Date.now()}`,
      createdAt: new Date().toISOString(),
      metadata: {
        careerGoal: params.careerGoal,
        currentLevel: params.currentLevel,
        timeCommitment: params.timeCommitment,
        interests: params.interests
      }
    };
    
    return {
      success: true,
      data: learningPath
    };
  } catch (error) {
    console.error('Error generating learning path:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate learning path'
    };
  }
};

/**
 * Save a learning path to user's account
 * @param {string} uid - User ID
 * @param {Object} learningPath - Learning path to save
 * @returns {Promise<Object>} - Result of save operation
 */
export const saveLearningPath = async (uid, learningPath) => {
  try {
    if (!db) {
      // Mock implementation for when Firebase is unavailable
      console.log('Mock save learning path:', { uid, learningPath });
      return { success: true };
    }
    
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        learningPaths: arrayUnion(learningPath)
      });
      
      return { success: true };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error('Error saving learning path:', error);
    return {
      success: false,
      error: error.message || 'Failed to save learning path'
    };
  }
};

/**
 * Get all learning paths for a user
 * @param {string} uid - User ID
 * @returns {Promise<Object>} - User's learning paths
 */
export const getUserLearningPaths = async (uid) => {
  try {
    if (!db) {
      // Mock implementation for when Firebase is unavailable
      console.log('Mock get user learning paths:', { uid });
      return { 
        success: true, 
        data: [careerPathTemplates['web-development']] 
      };
    }
    
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        success: true,
        data: userData.learningPaths || []
      };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error('Error getting user learning paths:', error);
    return {
      success: false,
      error: error.message || 'Failed to get user learning paths',
      data: []
    };
  }
}; 