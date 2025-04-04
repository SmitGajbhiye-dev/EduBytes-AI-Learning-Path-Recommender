/**
 * Service to fetch YouTube courses and educational content
 */

// Mock YouTube API Response - In a real app, this would call the YouTube API
const MOCK_YOUTUBE_COURSES = [
  {
    id: 'yt-course-1',
    title: 'Complete Web Development Bootcamp',
    channel: 'Programming with Mosh',
    thumbnail: 'https://i.ytimg.com/vi/Q33KBiDriJY/maxresdefault.jpg',
    playlistId: 'PL4cUxeGkcC9gQcYgjhBoeQH7wiAyZNrYa',
    videoCount: 42,
    viewCount: '2.4M',
    publishedAt: '2023-05-15',
    description: 'Learn web development from scratch with this comprehensive bootcamp covering HTML, CSS, JavaScript, React, Node.js, and more.',
    tags: ['web development', 'javascript', 'react', 'node.js'],
    difficulty: 'Beginner',
    url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9gQcYgjhBoeQH7wiAyZNrYa',
  },
  {
    id: 'yt-course-2',
    title: 'Data Science for Beginners',
    channel: 'freeCodeCamp.org',
    thumbnail: 'https://i.ytimg.com/vi/ua-CiDNNj30/maxresdefault.jpg',
    playlistId: 'PLWKjhJtqVAbn5emQ3RRG8gEBqkhf_5vxD',
    videoCount: 23,
    viewCount: '1.8M',
    publishedAt: '2023-07-22',
    description: 'Learn the fundamentals of data science, including Python, pandas, matplotlib, scikit-learn, and more.',
    tags: ['data science', 'python', 'machine learning'],
    difficulty: 'Beginner',
    url: 'https://www.youtube.com/playlist?list=PLWKjhJtqVAbn5emQ3RRG8gEBqkhf_5vxD',
  },
  {
    id: 'yt-course-3',
    title: 'Advanced React Patterns',
    channel: 'Kent C. Dodds',
    thumbnail: 'https://i.ytimg.com/vi/WV0UUcSPk-0/maxresdefault.jpg',
    playlistId: 'PL4cUxeGkcC9gZD-Tvwfod2gaISzfRiP9d',
    videoCount: 18,
    viewCount: '765K',
    publishedAt: '2023-04-10',
    description: 'Learn advanced React patterns like render props, HOCs, compound components, and more.',
    tags: ['react', 'javascript', 'frontend'],
    difficulty: 'Advanced',
    url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9gZD-Tvwfod2gaISzfRiP9d',
  },
  {
    id: 'yt-course-4',
    title: 'DevOps for Beginners',
    channel: 'TechWorld with Nana',
    thumbnail: 'https://i.ytimg.com/vi/j5Zsa_eOXeY/maxresdefault.jpg',
    playlistId: 'PLy7NrYWoggjwPggqtFsI_zMAwvG0SqYCb',
    videoCount: 32,
    viewCount: '1.2M',
    publishedAt: '2023-03-01',
    description: 'Learn DevOps concepts including Docker, Kubernetes, CI/CD, and cloud deployment.',
    tags: ['devops', 'docker', 'kubernetes', 'cloud'],
    difficulty: 'Intermediate',
    url: 'https://www.youtube.com/playlist?list=PLy7NrYWoggjwPggqtFsI_zMAwvG0SqYCb',
  },
  {
    id: 'yt-course-5',
    title: 'Machine Learning Full Course',
    channel: 'Stanford Online',
    thumbnail: 'https://i.ytimg.com/vi/jGwO_UgTS7I/maxresdefault.jpg',
    playlistId: 'PLoROMvodv4rMiGQp3WXShtMGk3anjRWBd',
    videoCount: 26,
    viewCount: '3.1M',
    publishedAt: '2022-12-15',
    description: 'The complete Stanford Machine Learning course with Andrew Ng covering all ML fundamentals.',
    tags: ['machine learning', 'ai', 'data science'],
    difficulty: 'Intermediate',
    url: 'https://www.youtube.com/playlist?list=PLoROMvodv4rMiGQp3WXShtMGk3anjRWBd',
  },
  {
    id: 'yt-course-6',
    title: 'Complete Python Programming Course',
    channel: 'Corey Schafer',
    thumbnail: 'https://i.ytimg.com/vi/YYXdXT2l-Gg/maxresdefault.jpg',
    playlistId: 'PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU',
    videoCount: 37,
    viewCount: '4.5M',
    publishedAt: '2023-06-05',
    description: 'Learn Python programming from basics to advanced concepts including OOP, decorators, and more.',
    tags: ['python', 'programming', 'computer science'],
    difficulty: 'Beginner',
    url: 'https://www.youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU',
  },
  {
    id: 'yt-course-7',
    title: 'Full Stack Development with MERN',
    channel: 'Traversy Media',
    thumbnail: 'https://i.ytimg.com/vi/PBTYxXADG_k/maxresdefault.jpg',
    playlistId: 'PLillGF-RfqbbiTGgA77tGO426V3hRF9iE',
    videoCount: 28,
    viewCount: '2.2M',
    publishedAt: '2023-02-18',
    description: 'Build full-stack applications with MongoDB, Express, React, and Node.js (MERN stack).',
    tags: ['mern', 'react', 'nodejs', 'mongodb'],
    difficulty: 'Intermediate',
    url: 'https://www.youtube.com/playlist?list=PLillGF-RfqbbiTGgA77tGO426V3hRF9iE',
  },
  {
    id: 'yt-course-8',
    title: 'iOS Development with Swift',
    channel: 'CodeWithChris',
    thumbnail: 'https://i.ytimg.com/vi/comQ1-x2a1Q/maxresdefault.jpg',
    playlistId: 'PLMRqhzcHGw1ZqzYnpIuQAn2rcjhOtbqGX',
    videoCount: 22,
    viewCount: '980K',
    publishedAt: '2023-01-10',
    description: 'Learn iOS app development with Swift from scratch and build your first iOS applications.',
    tags: ['ios', 'swift', 'mobile development'],
    difficulty: 'Beginner',
    url: 'https://www.youtube.com/playlist?list=PLMRqhzcHGw1ZqzYnpIuQAn2rcjhOtbqGX',
  },
];

/**
 * Fetch YouTube courses based on query and filters
 * @param {string} query - Search query
 * @param {Object} filters - Filtering options
 * @returns {Promise<Object>} Promise with courses and metadata
 */
export const fetchYouTubeCourses = async (query = '', filters = {}) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // In a real app, this would call the YouTube API with the query and filters
    let filteredCourses = [...MOCK_YOUTUBE_COURSES];
    
    // Apply search query filter
    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      filteredCourses = filteredCourses.filter(course => {
        const searchText = `${course.title} ${course.description} ${course.channel} ${course.tags.join(' ')}`.toLowerCase();
        return searchTerms.some(term => searchText.includes(term));
      });
    }
    
    // Apply difficulty filter
    if (filters.difficulty) {
      filteredCourses = filteredCourses.filter(course => 
        course.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }
    
    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filteredCourses = filteredCourses.filter(course => 
        filters.tags.some(tag => course.tags.includes(tag.toLowerCase()))
      );
    }
    
    return {
      success: true,
      data: filteredCourses,
      total: filteredCourses.length,
      message: 'Courses fetched successfully'
    };
  } catch (error) {
    console.error('Error fetching YouTube courses:', error);
    return {
      success: false,
      data: [],
      total: 0,
      message: error.message || 'Failed to fetch YouTube courses'
    };
  }
};

/**
 * Get course recommendations based on user interests or history
 * @param {string} userId - User ID for personalized recommendations
 * @param {Array} interests - User interests
 * @returns {Promise<Object>} Promise with recommended courses
 */
export const getYouTubeRecommendations = async (userId = null, interests = []) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, this would call an AI recommendation service
    // For now, just return some courses filtered by interests
    
    if (interests && interests.length > 0) {
      const interestTerms = interests.map(i => i.toLowerCase());
      const recommendedCourses = MOCK_YOUTUBE_COURSES.filter(course => 
        course.tags.some(tag => interestTerms.some(interest => tag.includes(interest)))
      );
      
      return {
        success: true,
        data: recommendedCourses.length > 0 ? recommendedCourses : MOCK_YOUTUBE_COURSES.slice(0, 4),
        message: 'Recommendations fetched successfully'
      };
    }
    
    // Default recommendations (random selection)
    const shuffled = [...MOCK_YOUTUBE_COURSES].sort(() => 0.5 - Math.random());
    
    return {
      success: true,
      data: shuffled.slice(0, 4),
      message: 'Recommendations fetched successfully'
    };
  } catch (error) {
    console.error('Error getting YouTube recommendations:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to get recommendations'
    };
  }
};

/**
 * Get course details by ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Promise with course details
 */
export const getYouTubeCourseById = async (courseId) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const course = MOCK_YOUTUBE_COURSES.find(c => c.id === courseId);
    
    if (!course) {
      return {
        success: false,
        data: null,
        message: 'Course not found'
      };
    }
    
    return {
      success: true,
      data: course,
      message: 'Course details fetched successfully'
    };
  } catch (error) {
    console.error('Error fetching YouTube course details:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to fetch course details'
    };
  }
};

export default {
  fetchYouTubeCourses,
  getYouTubeRecommendations,
  getYouTubeCourseById
}; 