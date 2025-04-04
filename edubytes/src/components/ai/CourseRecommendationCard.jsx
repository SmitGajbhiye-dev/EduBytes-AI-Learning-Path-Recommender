import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Component to display course recommendations in AI Mentor chat
 */
const CourseRecommendationCard = ({ recommendations }) => {
  const { courses, youtubeVideos, playlists } = recommendations;
  const [activeTab, setActiveTab] = useState(courses.length > 0 ? 'courses' : 'videos');
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {courses.length > 0 && (
          <button
            onClick={() => handleTabChange('courses')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center ${
              activeTab === 'courses'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Courses
            </span>
          </button>
        )}
        
        {youtubeVideos.length > 0 && (
          <button
            onClick={() => handleTabChange('videos')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center ${
              activeTab === 'videos'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              Videos
            </span>
          </button>
        )}
        
        {playlists.length > 0 && (
          <button
            onClick={() => handleTabChange('playlists')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center ${
              activeTab === 'playlists'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Learning Paths
            </span>
          </button>
        )}
      </div>
      
      {/* Content based on active tab */}
      <div className="p-4">
        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            {courses.map((course, index) => (
              <div key={index} className="flex border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span className="mr-2">{course.provider}</span>
                    <span className="mx-1">•</span>
                    <span className="mr-2">{course.level}</span>
                    <span className="mx-1">•</span>
                    <span>
                      {course.price > 0 ? `$${course.price.toFixed(2)}` : 'Free'}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <Link 
                      to={`/courses/${course.id}`}
                      className="text-xs font-medium text-primary hover:text-primary-dark"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-2 text-center">
              <Link 
                to="/courses" 
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                Browse All Courses
              </Link>
            </div>
          </div>
        )}
        
        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-4">
            {youtubeVideos.map((video, index) => (
              <div key={index} className="flex border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                <div className="w-24 h-16 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {video.title}
                  </h3>
                  
                  <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>{video.channelTitle}</span>
                    <span className="mx-1">•</span>
                    <span>{video.duration}</span>
                  </div>
                  
                  <div className="mt-2">
                    <a 
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-primary hover:text-primary-dark"
                    >
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-2 text-center">
              <Link 
                to="/courses/youtube" 
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                Browse All Videos
              </Link>
            </div>
          </div>
        )}
        
        {/* Playlists Tab */}
        {activeTab === 'playlists' && (
          <div className="space-y-4">
            {playlists.map((playlist, index) => (
              <div key={index} className="flex border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                <div className="w-24 h-16 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                  {playlist.thumbnail ? (
                    <img src={playlist.thumbnail} alt={playlist.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {playlist.title}
                  </h3>
                  
                  <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>{playlist.channelTitle}</span>
                    <span className="mx-1">•</span>
                    <span>{playlist.videoCount} videos</span>
                  </div>
                  
                  <div className="mt-2">
                    <a 
                      href={playlist.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-primary hover:text-primary-dark"
                    >
                      View Playlist
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseRecommendationCard; 