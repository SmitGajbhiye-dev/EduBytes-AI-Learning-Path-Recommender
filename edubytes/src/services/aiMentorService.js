// In a production app, this would connect to a real LLM API like OpenAI or Google Gemini
// For now, we'll create a mock implementation with predefined responses

// AI Mentor Service - Enhanced with NLP capabilities
import NLPService from './nlpService';

/**
 * Send a message to the AI Mentor and get a response
 * @param {string} userId - User ID for personalization and context
 * @param {string} message - User message to the AI
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<Object>} - AI response
 */
export const sendMessageToAI = async (userId, message, conversationHistory = []) => {
  try {
    // Analyze the user's message with NLP
    const analysis = NLPService.analyzeText(message);
    
    // Check if the message is related to course recommendations
    const isRecommendationQuery = analysis.intent === 'recommendation' || 
                                  analysis.intent === 'learning' || 
                                  analysis.intent === 'roadmap';
    
    let response;
    let additionalData = null;
    
    // If it's a recommendation query, use the NLP service to generate recommendations
    if (isRecommendationQuery && analysis.topics.length > 0) {
      const recommendationsResult = await NLPService.generateRecommendations(userId, analysis);
      
      if (recommendationsResult.success) {
        const recommendations = recommendationsResult.data;
        
        // Format a response with the recommendations
        response = formatRecommendationResponse(recommendations);
        
        // Include the recommendations data for rendering
        additionalData = {
          type: 'recommendations',
          recommendations: recommendations
        };
      } else {
        response = "I'm sorry, I had trouble finding specific recommendations. " + 
                  "Could you try asking about a more specific topic or skill you're interested in learning?";
      }
    } else {
      // For non-recommendation queries, use the standard response generation
      response = generateMockResponse(message, conversationHistory);
    }
    
    return {
      success: true,
      data: {
        id: `msg-${Date.now()}`,
        content: response,
        timestamp: new Date().toISOString(),
        sender: 'ai',
        additionalData
      }
    };
  } catch (error) {
    console.error('Error sending message to AI:', error);
    return {
      success: false,
      error: error.message || 'Failed to get AI response'
    };
  }
};

/**
 * Format a response message with course recommendations
 * @param {Object} recommendations - The recommendations data
 * @returns {string} - Formatted response message
 */
const formatRecommendationResponse = (recommendations) => {
  const { explanation, courses, youtubeVideos, playlists } = recommendations;
  
  let response = `${explanation}\n\n`;
  
  if (courses && courses.length > 0) {
    response += "Here are some courses that might interest you:\n";
    response += "I've included detailed recommendations in the message below.";
  } else if (youtubeVideos && youtubeVideos.length > 0) {
    response += "I've found some excellent YouTube videos that should help you. Check them out below:";
  }
  
  return response;
};

/**
 * Save conversation history to user's profile
 * @param {string} userId - User ID
 * @param {Array} conversation - Conversation history
 * @returns {Promise<Object>} - Result of save operation
 */
export const saveConversation = async (userId, conversation) => {
  try {
    // In a real app, this would save to Firebase
    console.log('Saving conversation for user:', userId, conversation);
    localStorage.setItem(`aiMentor_conversation_${userId}`, JSON.stringify(conversation));
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error saving conversation:', error);
    return {
      success: false,
      error: error.message || 'Failed to save conversation'
    };
  }
};

/**
 * Get conversation history for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Conversation history
 */
export const getConversationHistory = async (userId) => {
  try {
    // In a real app, this would fetch from Firebase
    const savedConversation = localStorage.getItem(`aiMentor_conversation_${userId}`);
    
    return {
      success: true,
      data: savedConversation ? JSON.parse(savedConversation) : []
    };
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return {
      success: false,
      error: error.message || 'Failed to get conversation history',
      data: []
    };
  }
};

// Mock response generator based on keywords
function generateMockResponse(message, conversationHistory) {
  const lowerCaseMessage = message.toLowerCase();
  
  // Check for greetings
  if (lowerCaseMessage.match(/^(hi|hello|hey|greetings)/i)) {
    return "Hello! I'm your AI learning mentor. How can I assist with your learning journey today? You can ask me about course recommendations, learning strategies, or specific topics you're studying.";
  }
  
  // Check for course recommendations
  if (lowerCaseMessage.includes('course') && (lowerCaseMessage.includes('recommend') || lowerCaseMessage.includes('suggestion'))) {
    if (lowerCaseMessage.includes('web development') || lowerCaseMessage.includes('web dev')) {
      return "For web development, I recommend starting with HTML, CSS, and JavaScript fundamentals. After mastering the basics, you might want to explore React or Angular for frontend, and Node.js or Django for backend. Some excellent courses to consider are 'The Web Developer Bootcamp' by Colt Steele on Udemy or 'Full Stack Open' by the University of Helsinki, which is free.";
    } else if (lowerCaseMessage.includes('data science') || lowerCaseMessage.includes('machine learning')) {
      return "For data science and machine learning, I recommend starting with Python programming and statistics fundamentals. Then move on to libraries like Pandas, NumPy, and scikit-learn. Andrew Ng's Machine Learning course on Coursera is excellent for beginners, and for a more applied approach, 'Python for Data Science and Machine Learning Bootcamp' on Udemy is quite comprehensive.";
    } else if (lowerCaseMessage.includes('design') || lowerCaseMessage.includes('ui') || lowerCaseMessage.includes('ux')) {
      return "For UI/UX design, I'd recommend starting with design principles and user research methods. Courses like 'Google UX Design Professional Certificate' on Coursera or 'UI / UX Design Specialization' provide structured learning paths. For tools, learn Figma or Adobe XD through practical projects.";
    } else {
      return "I'd be happy to recommend courses for you. Could you specify which subject or skill you're interested in learning? For example, are you looking for courses in programming, data science, design, business, or something else?";
    }
  }
  
  // Check for learning strategies
  if (lowerCaseMessage.includes('learn') || lowerCaseMessage.includes('study') || lowerCaseMessage.includes('memorize')) {
    if (lowerCaseMessage.includes('faster') || lowerCaseMessage.includes('efficiently') || lowerCaseMessage.includes('better')) {
      return "To learn more efficiently, try these evidence-based techniques: 1) Spaced repetition - review material at increasing intervals, 2) Active recall - test yourself rather than just re-reading material, 3) The Pomodoro Technique - study in focused 25-minute sessions with short breaks, 4) Teach what you learn to someone else, even if imaginary, and 5) Connect new knowledge to things you already understand. Also, make sure you're getting enough sleep and exercise, as both significantly impact learning and memory.";
    }
    if (lowerCaseMessage.includes('programming') || lowerCaseMessage.includes('coding')) {
      return "Learning programming effectively comes down to practice and building projects. Instead of just watching tutorials, challenge yourself to build something with what you've learned. Start with small projects that interest you and gradually increase complexity. Join coding communities like GitHub, Stack Overflow, or Discord servers to ask questions and get feedback. And remember, debugging is an essential skill - don't get discouraged by errors, they're how you learn!";
    }
    return "Effective learning often combines different approaches: 1) Set clear, specific goals for what you want to learn, 2) Break complex topics into smaller, manageable chunks, 3) Use active learning techniques rather than passive ones, 4) Apply what you're learning through projects or exercises, and 5) Teach concepts to others to deepen your understanding. What specifically are you trying to learn? I can provide more tailored strategies.";
  }
  
  // Check for time management
  if (lowerCaseMessage.includes('time management') || lowerCaseMessage.includes('schedule') || lowerCaseMessage.includes('procrastination')) {
    return "Effective time management for learning includes: 1) Set specific study goals for each session, 2) Use a calendar to block dedicated learning time, 3) Prioritize difficult material when your energy is highest, 4) Break large tasks into smaller milestones, 5) Use the Pomodoro Technique (25 minutes of focus, 5-minute break), and 6) Review and adjust your approach regularly. To overcome procrastination, try reducing friction to start (even just 5 minutes) and creating a distraction-free environment.";
  }
  
  // Check for motivation
  if (lowerCaseMessage.includes('motivation') || lowerCaseMessage.includes('stay motivated') || lowerCaseMessage.includes('giving up')) {
    return "Staying motivated while learning can be challenging. Try these approaches: 1) Connect your learning to a meaningful personal goal or project, 2) Celebrate small wins and track your progress visually, 3) Join learning communities to share your journey, 4) Switch between different topics when you feel stuck, 5) Remember that learning curves aren't linear - plateaus are normal, and 6) Take breaks when needed without guilt. What are you currently learning, and what aspects are affecting your motivation?";
  }
  
  // Default responses for common queries
  if (lowerCaseMessage.includes('thank')) {
    return "You're welcome! Feel free to ask if you need any other guidance with your learning journey.";
  }
  
  if (lowerCaseMessage.includes('how are you')) {
    return "I'm functioning well and ready to help with your learning questions! What would you like guidance on today?";
  }
  
  // Default response if no pattern matches
  return "I'm here to help with your educational journey. You can ask me about course recommendations, learning strategies, or specific subjects you're studying. How can I assist you today?";
} 