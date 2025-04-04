import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/layout/Layout';
import YouTubeCourses from '../components/courses/YouTubeCourses';
import YouTubeAPI from '../services/youtubeAPI';
import { useAuth } from '../context/AuthContext';

const YouTubeCoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('web-development');
  const { currentUser } = useAuth();

  const categories = [
    { id: 'web-development', name: 'Web Development' },
    { id: 'data-science', name: 'Data Science' },
    { id: 'machine-learning', name: 'Machine Learning' },
    { id: 'mobile-development', name: 'Mobile Apps' },
    { id: 'cybersecurity', name: 'Cybersecurity' }
  ];

  // Fetch playlists for the active category
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const result = await YouTubeAPI.getPlaylists(activeCategory, 5);
        setPlaylists(result);
      } catch (error) {
        console.error('Error loading playlists:', error);
      }
    };

    loadPlaylists();
  }, [activeCategory]);

  // Fetch recommended videos based on user interests
  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        // Get user interests if available, otherwise use web-development as default
        let userInterests = ['web-development'];
        if (currentUser && currentUser.interests && currentUser.interests.length > 0) {
          userInterests = currentUser.interests;
        }
        
        // Fetch videos for the first interest
        const videos = await YouTubeAPI.searchVideos(userInterests[0], 4);
        setRecommendations(videos);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [currentUser]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Update the search query to trigger the YouTubeCourses component to search
  };

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  return (
    <Layout>
      <Helmet>
        <title>{searchQuery ? `${searchQuery} - YouTube Courses | EduBytes` : 'Free YouTube Courses | EduBytes'}</title>
        <meta 
          name="description" 
          content="Discover the best free educational content from YouTube. Curated courses on programming, design, business, and more." 
        />
      </Helmet>

      <div className="container-custom py-24">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900 dark:text-white mb-4">
            Discover Free YouTube Courses
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore high-quality educational content from YouTube's best creators. Filter by difficulty level and find courses that match your learning goals.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Search for any topic (e.g. 'React.js', 'Machine Learning', 'Python')"
              className="flex-grow input-field py-3 px-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary py-3 px-8 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </form>
        </div>

        {/* Category Tabs */}
        {!searchQuery && (
          <div className="mb-10">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Playlists Section (only shown when no search is active) */}
        {!searchQuery && playlists.length > 0 && (
          <div className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Best {categories.find(c => c.id === activeCategory)?.name} Playlists
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Complete courses with multiple videos organized in playlists by top creators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {playlists.map(playlist => (
                <div key={playlist.id} className="glass-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <a 
                    href={playlist.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative pb-[56.25%] overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <img 
                        src={playlist.thumbnail} 
                        alt={playlist.title}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {playlist.videoCount} videos
                      </div>
                      
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                        <div className="bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white p-1 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                      <a 
                        href={playlist.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                      >
                        {playlist.title}
                      </a>
                    </h3>
                    
                    <div className="flex items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {playlist.channelTitle}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {playlist.description}
                    </p>
                    
                    <div className="flex justify-end">
                      <a 
                        href={playlist.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:text-primary-dark text-sm font-medium"
                      >
                        View Playlist
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
        )}

        {/* Personalized Recommendations Section */}
        {!searchQuery && recommendations.length > 0 && (
          <div className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Recommended For You
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Courses curated based on your interests and learning history.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map(course => (
                <div key={course.id} className="glass-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
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
                    
                    <div className="flex items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {course.channelTitle}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Courses Section */}
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Browse All Videos"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? "Find the best free educational content on YouTube."
                : "Explore our curated collection of free educational videos."}
            </p>
          </div>

          <YouTubeCourses searchQuery={searchQuery || activeCategory} />
        </div>
      </div>
    </Layout>
  );
};

export default YouTubeCoursesPage; 