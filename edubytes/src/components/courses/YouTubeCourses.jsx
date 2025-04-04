import { useState, useEffect } from 'react';
import YouTubeAPI from '../../services/youtubeAPI';
import { useAuth } from '../../context/AuthContext';

const YouTubeCourses = ({ searchQuery }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: '',
    tags: []
  });
  const [watchLaterStatus, setWatchLaterStatus] = useState({});
  const { currentUser } = useAuth();

  // Load courses on component mount and when search query changes
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        // If no search query, use default topics
        const topic = searchQuery || 'web-development';
        const videos = await YouTubeAPI.searchVideos(topic, 12);
        
        // Get watch later status for each video if user is logged in
        if (videos.length > 0 && currentUser) {
          const statusPromises = videos.map(video => 
            YouTubeAPI.isInWatchLater(video.id, currentUser.uid)
          );
          const statuses = await Promise.all(statusPromises);
          
          const newStatus = {};
          videos.forEach((video, index) => {
            newStatus[video.id] = statuses[index];
          });
          
          setWatchLaterStatus(newStatus);
        }
        
        // Apply difficulty filter if needed
        let filteredVideos = videos;
        if (filters.difficulty) {
          // Simulate difficulty levels based on video duration
          filteredVideos = videos.filter(video => {
            const durationParts = video.duration.split(':');
            let hours = 0;
            
            if (durationParts.length === 3) {
              hours = parseInt(durationParts[0]);
            }
            
            if (filters.difficulty === 'Beginner' && hours < 2) return true;
            if (filters.difficulty === 'Intermediate' && hours >= 2 && hours < 5) return true; 
            if (filters.difficulty === 'Advanced' && hours >= 5) return true;
            
            return filters.difficulty === '';
          });
        }
        
        setCourses(filteredVideos);
      } catch (err) {
        setError('Failed to load YouTube courses. Please try again later.');
        console.error('Error loading YouTube courses:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [searchQuery, filters, currentUser]);

  // Handler for filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle adding/removing videos from watch later
  const toggleWatchLater = async (videoId) => {
    if (!currentUser) {
      // Prompt user to log in
      alert('Please log in to save videos to your Watch Later list');
      return;
    }
    
    try {
      if (watchLaterStatus[videoId]) {
        // Remove from watch later
        await YouTubeAPI.removeFromWatchLater(videoId, currentUser.uid);
        setWatchLaterStatus(prev => ({
          ...prev,
          [videoId]: false
        }));
      } else {
        // Add to watch later
        await YouTubeAPI.addToWatchLater(videoId, currentUser.uid);
        setWatchLaterStatus(prev => ({
          ...prev,
          [videoId]: true
        }));
      }
    } catch (error) {
      console.error('Error toggling watch later status:', error);
    }
  };

  // Determine video difficulty based on duration
  const getVideoDifficulty = (duration) => {
    const durationParts = duration.split(':');
    let hours = 0;
    
    if (durationParts.length === 3) {
      hours = parseInt(durationParts[0]);
    }
    
    if (hours < 2) return 'Beginner';
    if (hours >= 2 && hours < 5) return 'Intermediate';
    return 'Advanced';
  };

  // Render difficulty badge with appropriate color
  const renderDifficultyBadge = (duration) => {
    const difficulty = getVideoDifficulty(duration);
    let bgColor = 'bg-green-100 text-green-800';
    
    if (difficulty === 'Intermediate') {
      bgColor = 'bg-blue-100 text-blue-800';
    } else if (difficulty === 'Advanced') {
      bgColor = 'bg-purple-100 text-purple-800';
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor}`}>
        {difficulty}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="w-full py-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-10 flex flex-col items-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-gray-700 dark:text-gray-300">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 btn btn-secondary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="w-full py-10 flex flex-col items-center">
        <div className="text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-gray-700 dark:text-gray-300">No courses found matching your criteria.</p>
        <button 
          onClick={() => setFilters({ difficulty: '', tags: [] })} 
          className="mt-4 btn btn-secondary"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Difficulty
          </label>
          <select
            id="difficulty-filter"
            className="input-field py-2 pl-3 pr-10 text-gray-700 dark:text-gray-200 cursor-pointer"
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          Showing {courses.length} course{courses.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <a 
              href={course.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <div className="relative pb-[56.25%] overflow-hidden bg-gray-200 dark:bg-gray-700">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {course.duration}
                </div>
              </div>
            </a>
            
            <div className="p-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                  <a 
                    href={course.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                  >
                    {course.title}
                  </a>
                </h3>
                
                <button 
                  onClick={() => toggleWatchLater(course.id)}
                  className="text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-primary ml-1 mt-1 transition-colors"
                  title={watchLaterStatus[course.id] ? "Remove from Watch Later" : "Add to Watch Later"}
                >
                  {watchLaterStatus[course.id] ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="flex items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {course.channelTitle}
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-sm text-gray-500 dark:text-gray-500">
                  {course.viewCount} views
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {course.description}
              </p>
              
              <div className="mt-auto flex items-center justify-between">
                {renderDifficultyBadge(course.duration)}
                
                <a 
                  href={course.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:text-primary-dark text-sm font-medium"
                >
                  Watch
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YouTubeCourses; 