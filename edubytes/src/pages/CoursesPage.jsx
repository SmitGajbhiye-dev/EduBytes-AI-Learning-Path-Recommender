import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import AIRecommendationService from '../services/aiRecommendationService';

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [categorizedCourses, setCategorizedCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiInsights, setAiInsights] = useState(null);
  const [learningPath, setLearningPath] = useState([]);
  
  // Filter states
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [priceOptions, setPriceOptions] = useState(['free', 'paid']);
  const [sortBy, setSortBy] = useState('relevance');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const { currentUser } = useAuth();
  
  // Get query from URL params
  const query = searchParams.get('q') || '';
  
  // Define levels and platforms
  const levels = ['beginner', 'intermediate', 'advanced'];
  const platforms = AIRecommendationService.platforms;
  
  // Fetch recommendations using AI service
  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      // Prepare options for AI recommendations
      const options = {
        platforms: selectedPlatforms,
        priceOptions: priceOptions,
        limit: 30,
        experienceLevel: selectedLevels.length === 1 ? selectedLevels[0] : 'all'
      };
      
      // Get recommendations from AI service
      const result = await AIRecommendationService.getRecommendations(
        currentUser?.uid, 
        query, 
        options
      );
      
      if (result.success) {
        setCourses(result.data.courses);
        setCategorizedCourses(result.data.categories);
        setAiInsights(result.data.insights);
        
        // Set learning path if available
        if (result.data.insights && result.data.insights.learningPath) {
          setLearningPath(result.data.insights.learningPath);
        }
        
        // Reset active category if it doesn't exist in new results
        if (
          activeCategory !== 'all' && 
          !Object.keys(result.data.categories).includes(activeCategory)
        ) {
          setActiveCategory('all');
        }
      } else {
        setError(result.error || 'Failed to fetch course recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('An error occurred while fetching course recommendations');
    } finally {
      setLoading(false);
    }
  }, [
    query, 
    currentUser, 
    selectedPlatforms, 
    selectedLevels, 
    priceOptions, 
    activeCategory
  ]);
  
  // Update search query when URL parameter changes
  useEffect(() => {
    if (query) {
      setSearchQuery(query);
    }
  }, [query]);
  
  // Fetch recommendations when dependencies change
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    } else {
      setSearchParams({});
    }
  };
  
  // Toggle platform selection
  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };
  
  // Toggle level selection
  const toggleLevel = (level) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level) 
        : [...prev, level]
    );
  };
  
  // Toggle price option
  const togglePriceOption = (option) => {
    setPriceOptions(prev => 
      prev.includes(option) 
        ? prev.filter(p => p !== option) 
        : [...prev, option]
    );
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedPlatforms([]);
    setSelectedLevels([]);
    setPriceOptions(['free', 'paid']);
    setSortBy('relevance');
    setActiveCategory('all');
  };
  
  // Get displayed courses based on active category and sorting
  const getDisplayedCourses = () => {
    let displayedCourses = [];
    
    if (activeCategory === 'all') {
      displayedCourses = [...courses];
    } else if (categorizedCourses[activeCategory]) {
      displayedCourses = [...categorizedCourses[activeCategory]];
    }
    
    // Apply sorting
    return sortCourses(displayedCourses, sortBy);
  };
  
  // Sort courses based on selected criteria
  const sortCourses = (coursesToSort, sortCriteria) => {
    if (!coursesToSort || coursesToSort.length === 0) return [];
    
    const sortedCourses = [...coursesToSort];
    
    switch (sortCriteria) {
      case 'relevance':
        return sortedCourses.sort((a, b) => b.aiRelevanceScore - a.aiRelevanceScore);
      case 'rating':
        return sortedCourses.sort((a, b) => b.rating - a.rating);
      case 'popularity':
        return sortedCourses.sort((a, b) => {
          // Parse student counts (remove non-numeric characters and convert to number)
          const aCount = a.studentsCount ? parseInt(a.studentsCount.replace(/\D/g, '')) : 0;
          const bCount = b.studentsCount ? parseInt(b.studentsCount.replace(/\D/g, '')) : 0;
          return bCount - aCount;
        });
      case 'newest':
        return sortedCourses.sort((a, b) => {
          // Sort by publication date if available
          if (a.publishedAt && b.publishedAt) {
            return new Date(b.publishedAt) - new Date(a.publishedAt);
          }
          return 0;
        });
      case 'price-low-high':
        return sortedCourses.sort((a, b) => {
          const aPrice = a.price || 0;
          const bPrice = b.price || 0;
          return aPrice - bPrice;
        });
      case 'price-high-low':
        return sortedCourses.sort((a, b) => {
          const aPrice = a.price || 0;
          const bPrice = b.price || 0;
          return bPrice - aPrice;
        });
      default:
        return sortedCourses;
    }
  };
  
  // Get category names for rendering tabs
  const getCategoryNames = () => {
    if (!categorizedCourses) return [];
    return Object.keys(categorizedCourses);
  };
  
  // Format course level with proper capitalization
  const formatLevel = (level) => {
    if (!level) return 'All Levels';
    return level.charAt(0).toUpperCase() + level.slice(1);
  };
  
  return (
    <Layout>
      <Helmet>
        <title>{query ? `${query} Courses | EduBytes` : 'AI-Powered Course Recommendations | EduBytes'}</title>
        <meta 
          name="description" 
          content={`Discover the best courses from multiple platforms with AI-powered recommendations. ${query ? `Search results for: ${query}` : 'Personalized for your learning goals.'}`} 
        />
      </Helmet>
      
      <div className="container-custom py-16 md:py-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            {query ? `AI-Powered Results: ${query}` : 'Discover Your Perfect Learning Path'}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {query 
              ? `Explore AI-curated courses from top platforms for "${query}"`
              : 'Our Gemini AI analyzes multiple learning platforms to find the perfect courses for your goals.'
            }
          </p>
        </div>
        
        {/* Search Form */}
        <div className="mb-8 glass-card shadow p-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              className="input-field flex-grow py-3"
              placeholder="What do you want to learn today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary min-w-[120px] py-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </form>
        </div>
        
        {/* AI Insights & Learning Path */}
        {aiInsights && !loading && !error && (
          <div className="mb-8 p-6 glass-card shadow border-l-4 border-primary">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  AI-Recommended Learning Path
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Our AI has analyzed your query and recommended this learning path:
                </p>
                <ol className="ml-5 list-decimal text-gray-700 dark:text-gray-300 space-y-1">
                  {learningPath.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
                <div className="mt-4 flex flex-wrap gap-2">
                  {aiInsights.keyTopics && aiInsights.keyTopics.map((topic, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Section */}
          <div className="lg:w-1/4 w-full">
            <div className="glass-card shadow p-6 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filters</h2>
                <button 
                  onClick={resetFilters}
                  className="text-primary text-sm hover:underline"
                >
                  Reset All
                </button>
              </div>
              
              {/* Platform Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Platforms</h3>
                <div className="space-y-2">
                  {platforms.map(platform => (
                    <label key={platform.name} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox rounded text-primary"
                        checked={selectedPlatforms.includes(platform.name)}
                        onChange={() => togglePlatform(platform.name)}
                      />
                      <div className="flex items-center space-x-2">
                        <img 
                          src={platform.logo} 
                          alt={platform.name} 
                          className="w-5 h-5 object-contain"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {platform.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {platform.type === 'free' ? 'Free' : platform.type === 'paid' ? 'Paid' : 'Mixed'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Level Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Level</h3>
                <div className="space-y-2">
                  {levels.map(level => (
                    <label key={level} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox rounded text-primary"
                        checked={selectedLevels.includes(level)}
                        onChange={() => toggleLevel(level)}
                      />
                      <span className="text-gray-700 dark:text-gray-300">{formatLevel(level)}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Price Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Price</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox rounded text-primary"
                      checked={priceOptions.includes('free')}
                      onChange={() => togglePriceOption('free')}
                    />
                    <span className="text-gray-700 dark:text-gray-300">Free</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox rounded text-primary"
                      checked={priceOptions.includes('paid')}
                      onChange={() => togglePriceOption('paid')}
                    />
                    <span className="text-gray-700 dark:text-gray-300">Paid</span>
                  </label>
                </div>
              </div>
              
              {/* Sort By */}
              <div className="mb-6">
                <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field w-full py-2"
                >
                  <option value="relevance">AI Relevance</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popularity">Most Popular</option>
                  <option value="newest">Newest First</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Courses Grid */}
          <div className="lg:w-3/4 w-full">
            {/* Category Tabs */}
            {!loading && !error && getCategoryNames().length > 0 && (
              <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
                  <button 
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 whitespace-nowrap rounded-t-lg ${
                      activeCategory === 'all' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    All Courses
                  </button>
                  {getCategoryNames().map(category => (
                    <button 
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 whitespace-nowrap rounded-t-lg ${
                        activeCategory === category 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Our AI is finding the best courses for you...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 glass-card shadow p-6">
                <div className="text-red-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">Something went wrong</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {error}
                </p>
                <button 
                  onClick={fetchRecommendations}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : getDisplayedCourses().length === 0 ? (
              <div className="text-center py-12 glass-card shadow p-6">
                <div className="text-5xl mb-4">😕</div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">No courses found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
                <button 
                  onClick={resetFilters}
                  className="mt-4 btn btn-outline-primary"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4 text-gray-600 dark:text-gray-400">
                  Found {getDisplayedCourses().length} course{getDisplayedCourses().length !== 1 ? 's' : ''}
                  {activeCategory !== 'all' && ` in ${activeCategory}`}
                </div>
                
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                  {getDisplayedCourses().map(course => (
                    <div key={course.id} className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
                      <div className="absolute top-2 left-2 z-10">
                        <div className="px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span>{formatLevel(course.level) || 'All Levels'}</span>
                        </div>
                      </div>
                      
                      {course.aiRelevanceScore > 80 && (
                        <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-primary text-white text-xs rounded">
                          Top Pick
                        </div>
                      )}
                      
                      <div className="relative">
                        <a 
                          href={course.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img 
                            src={course.thumbnail} 
                            alt={course.title} 
                            className="w-full h-48 object-cover"
                          />
                        </a>
                        <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          <img 
                            src={course.platformLogo} 
                            alt={course.platform} 
                            className="w-4 h-4 object-contain"
                          />
                          <span>{course.platform}</span>
                        </div>
                      </div>
                      
                      <div className="p-5 flex-grow flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem]">
                          <a 
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary"
                          >
                            {course.title}
                          </a>
                        </h3>
                        
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3 space-x-3">
                          {course.instructor && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {course.instructor || course.channelTitle}
                            </span>
                          )}
                          
                          {course.duration && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {course.duration}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center mb-4">
                          {course.rating && (
                            <div className="flex items-center">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                                {course.rating}
                              </span>
                            </div>
                          )}
                          
                          {course.studentsCount && (
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                              ({course.studentsCount})
                            </span>
                          )}
                          
                          {course.viewCount && !course.studentsCount && (
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                              ({course.viewCount} views)
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                          {course.description}
                        </p>
                        
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {course.price === 0 || course.platform === 'YouTube' || course.platform === 'Khan Academy' ? (
                              <span className="text-green-600 dark:text-green-400">Free</span>
                            ) : course.price ? (
                              <span>${course.price.toFixed(2)}</span>
                            ) : (
                              <span>Subscription</span>
                            )}
                          </div>
                          <a 
                            href={course.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                          >
                            View Course
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoursesPage; 