// This service handles interactions with the Gemini AI API
import axios from 'axios';

// API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Base URL for Gemini API
const BASE_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

/**
 * Generate a learning path based on user interests and career goals
 * @param {Object} params - Parameters containing user information
 * @param {string} params.interests - User's interests
 * @param {string} params.careerGoals - User's career goals
 * @param {string} params.currentSkills - User's current skills (optional)
 * @param {string} params.timeAvailable - User's available time for learning (optional)
 * @returns {Promise<Object>} - The AI-generated learning path
 */
export const generateLearningPath = async (params) => {
  try {
    const { interests, careerGoals, currentSkills = '', timeAvailable = '' } = params;
    
    const prompt = `As an educational expert, create a detailed learning path for someone with the following profile:
    
    Interests: ${interests}
    Career Goals: ${careerGoals}
    ${currentSkills ? `Current Skills: ${currentSkills}` : ''}
    ${timeAvailable ? `Time Available: ${timeAvailable}` : ''}
    
    Please provide a step-by-step learning path that includes:
    1. Core competencies they need to develop
    2. Suggested sequence of subjects to learn
    3. Recommended types of courses (beginner, intermediate, advanced)
    4. Realistic timeline for completion
    5. Important skill milestones to track progress
    
    Format the response as JSON with the following structure:
    {
      "learningPath": {
        "title": "Custom title for the learning path",
        "description": "Brief overview of this learning path",
        "coreFocus": ["Focus area 1", "Focus area 2", ...],
        "steps": [
          {
            "step": 1,
            "title": "Step title",
            "description": "Description of what to learn",
            "estimatedTime": "Time estimate",
            "skillLevel": "beginner/intermediate/advanced",
            "keyTopics": ["Topic 1", "Topic 2", ...],
            "resourceTypes": ["courses", "books", "projects", ...]
          },
          ...
        ],
        "milestones": [
          {
            "milestone": 1,
            "title": "Milestone title",
            "description": "What you should be able to do",
            "projects": ["Suggested project 1", "Suggested project 2", ...]
          },
          ...
        ]
      }
    }
    `;

    const response = await axios.post(
      `${BASE_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      }
    );

    const textResponse = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response (in case there's any text before or after the JSON)
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : null;
    
    if (jsonStr) {
      return {
        success: true,
        data: JSON.parse(jsonStr)
      };
    } else {
      return {
        success: false,
        error: "Failed to parse AI response"
      };
    }
  } catch (error) {
    console.error('Error generating learning path:', error);
    return {
      success: false,
      error: error.message || "Failed to generate learning path"
    };
  }
};

/**
 * Generate skill gap analysis based on resume or current skills and desired career
 * @param {Object} params - Parameters for skill gap analysis
 * @param {string} params.currentSkills - User's current skills or resume text
 * @param {string} params.targetRole - User's target role or career
 * @returns {Promise<Object>} - The AI-generated skill gap analysis
 */
export const generateSkillGapAnalysis = async (params) => {
  try {
    const { currentSkills, targetRole } = params;
    
    const prompt = `As a career development expert, analyze the gap between the person's current skills and what they need for their target role.
    
    Current Skills/Resume: ${currentSkills}
    Target Role: ${targetRole}
    
    Please provide a comprehensive skill gap analysis in JSON format with this structure:
    {
      "skillGapAnalysis": {
        "summary": "Brief summary of the analysis",
        "currentStrengths": ["Strength 1", "Strength 2", ...],
        "keyGaps": [
          {
            "skill": "Skill name",
            "importance": "high/medium/low",
            "description": "Why this skill is important for the target role",
            "recommendedResources": ["Course 1", "Book 1", "Project 1", ...]
          },
          ...
        ],
        "recommendedLearningPath": {
          "immediate": ["Skill to learn first", ...],
          "shortTerm": ["Skills to develop in 3-6 months", ...],
          "longTerm": ["Skills to develop in 6-12+ months", ...]
        }
      }
    }
    `;

    const response = await axios.post(
      `${BASE_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      }
    );

    const textResponse = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : null;
    
    if (jsonStr) {
      return {
        success: true,
        data: JSON.parse(jsonStr)
      };
    } else {
      return {
        success: false,
        error: "Failed to parse AI response"
      };
    }
  } catch (error) {
    console.error('Error generating skill gap analysis:', error);
    return {
      success: false,
      error: error.message || "Failed to generate skill gap analysis"
    };
  }
};

/**
 * Chat with AI career mentor
 * @param {string} message - User's message
 * @param {Array} history - Chat history (optional)
 * @returns {Promise<Object>} - The AI response
 */
export const chatWithCareerMentor = async (message, history = []) => {
  try {
    const chatHistory = history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));
    
    const systemMessage = {
      role: "user",
      parts: [{ text: `You are an AI career mentor and educational guide. Your role is to provide helpful, encouraging advice about educational paths, career options, learning resources, and skill development. Base your guidance on evidence-based educational practices and current career trends. Be friendly, supportive, and focused on practical next steps the user can take.` }]
    };
    
    const userMessage = {
      role: "user",
      parts: [{ text: message }]
    };
    
    // Combine system message, history and new message
    const allMessages = [systemMessage, ...chatHistory, userMessage];
    
    const response = await axios.post(
      `${BASE_URL}?key=${API_KEY}`,
      {
        contents: allMessages,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 2048,
        }
      }
    );

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
    return {
      success: true,
      response: aiResponse,
      role: "assistant",
      text: aiResponse
    };
  } catch (error) {
    console.error('Error chatting with career mentor:', error);
    return {
      success: false,
      error: error.message || "Failed to chat with career mentor"
    };
  }
};

/**
 * Generate quiz questions based on a topic or course
 * @param {Object} params - Parameters for quiz generation
 * @param {string} params.topic - The topic for the quiz
 * @param {string} params.difficulty - The difficulty level (easy/medium/hard)
 * @param {number} params.questionCount - Number of questions to generate (default: 5)
 * @returns {Promise<Object>} - The AI-generated quiz
 */
export const generateQuiz = async (params) => {
  try {
    const { topic, difficulty = 'medium', questionCount = 5 } = params;
    
    const prompt = `Create a quiz on the topic of "${topic}" with ${questionCount} ${difficulty}-level multiple-choice questions.
    
    Format the response as JSON with this structure:
    {
      "quiz": {
        "title": "Title for this quiz",
        "topic": "${topic}",
        "difficulty": "${difficulty}",
        "questions": [
          {
            "id": 1,
            "question": "Question text",
            "options": [
              {"id": "a", "text": "Option A"},
              {"id": "b", "text": "Option B"},
              {"id": "c", "text": "Option C"},
              {"id": "d", "text": "Option D"}
            ],
            "correctAnswer": "a",
            "explanation": "Explanation of the correct answer"
          },
          ...
        ]
      }
    }
    `;

    const response = await axios.post(
      `${BASE_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.5,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      }
    );

    const textResponse = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : null;
    
    if (jsonStr) {
      return {
        success: true,
        data: JSON.parse(jsonStr)
      };
    } else {
      return {
        success: false,
        error: "Failed to parse AI response"
      };
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    return {
      success: false,
      error: error.message || "Failed to generate quiz"
    };
  }
}; 