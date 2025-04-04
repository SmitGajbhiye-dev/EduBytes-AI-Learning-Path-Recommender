import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { generateLearningPath, saveLearningPath, getUserLearningPaths } from '../services/learningPathService';
import { getRecommendedCourses } from '../services/courseService';

const LearningPathsPage = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [userPaths, setUserPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pathLoading, setPathLoading] = useState(false);
  const [formData, setFormData] = useState({
    careerGoal: '',
    currentLevel: 'beginner',
    timeCommitment: '1-3 hours/week',
    interests: []
  });
  const [generatedPath, setGeneratedPath] = useState(null);
  const [recommendedCourses, setRecommendedCourses] = useState({});
  const [error, setError] = useState('');
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  
  // Fetch user's learning paths
  useEffect(() => {
    const fetchUserPaths = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const result = await getUserLearningPaths(user.uid);
        if (result.success) {
          setUserPaths(result.data);
        } else {
          console.error('Error fetching user paths:', result.error);
        }
      } catch (err) {
        console.error('Error fetching user paths:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserPaths();
  }, [user]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle interest selection
  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      const interests = [...prev.interests];
      const index = interests.indexOf(interest);
      
      if (index > -1) {
        interests.splice(index, 1);
      } else {
        interests.push(interest);
      }
      
      return { ...prev, interests };
    });
  };
  
  // Generate learning path
  const handleGeneratePath = async (e) => {
    e.preventDefault();
    
    if (!formData.careerGoal) {
      setError('Please enter your career goal');
      return;
    }
    
    setPathLoading(true);
    setError('');
    
    try {
      // Generate learning path
      const pathResult = await generateLearningPath(formData);
      
      if (pathResult.success) {
        setGeneratedPath(pathResult.data);
        
        // Get recommended courses for the learning path
        const coursesResult = await getRecommendedCourses(pathResult.data);
        if (coursesResult.success) {
          setRecommendedCourses(coursesResult.data.organizedByStep);
        }
      } else {
        setError(pathResult.error || 'Failed to generate learning path');
      }
    } catch (err) {
      console.error('Error generating path:', err);
      setError('An error occurred while generating your learning path');
    } finally {
      setPathLoading(false);
    }
  };
  
  // Save learning path
  const handleSavePath = async () => {
    if (!user) {
      navigate('/login?redirect=/learning-paths');
      return;
    }
    
    if (!generatedPath) return;
    
    setPathLoading(true);
    try {
      const result = await saveLearningPath(user.uid, generatedPath);
      
      if (result.success) {
        setUserPaths(prev => [...prev, generatedPath]);
        setActiveTab('my-paths');
      } else {
        setError(result.error || 'Failed to save learning path');
      }
    } catch (err) {
      console.error('Error saving path:', err);
      setError('An error occurred while saving your learning path');
    } finally {
      setPathLoading(false);
    }
  };
  
  // Interest options
  const interestOptions = [
    'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
    'DevOps', 'Cloud Computing', 'Cybersecurity', 'Blockchain',
    'Game Development', 'UI/UX Design', 'Digital Marketing', 'Project Management'
  ];
  
  return (
    <Layout>
      <Helmet>
        <title>Learning Paths | EduBytes</title>
        <meta name="description" content="Create personalized learning paths tailored to your career goals and interests." />
      </Helmet>
      
      <div className="container-custom py-24">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Learning Paths
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Create a personalized learning path to achieve your career goals with courses from top platforms.
          </p>
        </div>
        
        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Create New Path
            </button>
            <button
              onClick={() => setActiveTab('my-paths')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-paths'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              My Learning Paths
            </button>
          </nav>
        </div>
        
        {/* Create New Path */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div>
              {!generatedPath ? (
                <div className="glass-card shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Create Your Learning Path
                  </h2>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleGeneratePath} className="space-y-6">
                    <div>
                      <label htmlFor="careerGoal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        What is your career goal? *
                      </label>
                      <input
                        id="careerGoal"
                        name="careerGoal"
                        type="text"
                        className="input-field"
                        placeholder="e.g., Become a full-stack web developer"
                        value={formData.careerGoal}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="currentLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        What is your current skill level?
                      </label>
                      <select
                        id="currentLevel"
                        name="currentLevel"
                        className="input-field"
                        value={formData.currentLevel}
                        onChange={handleInputChange}
                      >
                        <option value="beginner">Beginner - Just starting out</option>
                        <option value="intermediate">Intermediate - Some experience</option>
                        <option value="advanced">Advanced - Looking to specialize</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="timeCommitment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        How much time can you commit weekly?
                      </label>
                      <select
                        id="timeCommitment"
                        name="timeCommitment"
                        className="input-field"
                        value={formData.timeCommitment}
                        onChange={handleInputChange}
                      >
                        <option value="1-3 hours/week">1-3 hours/week</option>
                        <option value="4-6 hours/week">4-6 hours/week</option>
                        <option value="7-10 hours/week">7-10 hours/week</option>
                        <option value="10+ hours/week">10+ hours/week</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Areas of interest (optional)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {interestOptions.map(interest => (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => handleInterestToggle(interest)}
                            className={`px-3 py-1.5 rounded-full text-sm ${
                              formData.interests.includes(interest)
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        className="btn btn-primary w-full py-3"
                        disabled={pathLoading}
                      >
                        {pathLoading ? (
                          <span className="flex justify-center items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </span>
                        ) : (
                          'Generate Learning Path'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="glass-card shadow p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Your Learning Path
                    </h2>
                    <button 
                      onClick={() => setGeneratedPath(null)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {generatedPath.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {generatedPath.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {generatedPath.coreFocus.map((focus, index) => (
                        <span 
                          key={index} 
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          {focus}
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>Based on your goal: <span className="text-gray-700 dark:text-gray-300">{formData.careerGoal}</span></p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSavePath}
                    className="btn btn-primary w-full py-3 mb-4"
                    disabled={pathLoading}
                  >
                    {pathLoading ? (
                      <span className="flex justify-center items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      'Save Learning Path'
                    )}
                  </button>
                  
                  <button
                    onClick={() => setGeneratedPath(null)}
                    className="btn btn-outline-primary w-full py-3"
                  >
                    Create a Different Path
                  </button>
                </div>
              )}
            </div>
            
            {/* Path Visualization */}
            <div>
              {generatedPath ? (
                <div className="glass-card shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Learning Journey Steps
                  </h2>
                  
                  <div className="relative pl-8">
                    <div className="absolute top-0 left-4 h-full w-0.5 bg-primary/20"></div>
                    
                    {generatedPath.steps.map((step, index) => (
                      <div key={index} className="mb-8 relative">
                        <div className="absolute -left-8 top-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white">
                          {index + 1}
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {step.title}
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 mb-3">
                            {step.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 mb-3">
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-0.5 rounded text-xs">
                              {step.skillLevel}
                            </span>
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-0.5 rounded text-xs">
                              {step.estimatedTime}
                            </span>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Key Topics:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {step.keyTopics.map((topic, i) => (
                                <span 
                                  key={i} 
                                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {/* Recommended Courses */}
                          {recommendedCourses[step.title] && recommendedCourses[step.title].length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Recommended Courses:
                              </h4>
                              <ul className="space-y-2">
                                {recommendedCourses[step.title].slice(0, 3).map((course, i) => (
                                  <li key={i} className="text-sm">
                                    <Link 
                                      to={`/courses/${course.id}?provider=${encodeURIComponent(course.provider)}`}
                                      className="flex items-start hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                                    >
                                      <img 
                                        src={course.imageUrl} 
                                        alt={course.title} 
                                        className="w-10 h-10 object-cover rounded mr-3"
                                      />
                                      <div>
                                        <h5 className="font-medium text-gray-900 dark:text-white line-clamp-1">{course.title}</h5>
                                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                                          <span>{course.provider}</span>
                                          <span className="mx-1">•</span>
                                          <span className="flex items-center">
                                            <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                            </svg>
                                            {course.rating}
                                          </span>
                                        </div>
                                      </div>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                              {recommendedCourses[step.title].length > 3 && (
                                <Link 
                                  to={`/courses?q=${encodeURIComponent(step.keyTopics.join(' '))}`}
                                  className="text-primary text-sm hover:underline mt-2 inline-block"
                                >
                                  View {recommendedCourses[step.title].length - 3} more courses
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass-card shadow p-6 h-full flex flex-col justify-center items-center text-center">
                  <img 
                    src="/images/generate-path.svg" 
                    alt="Generate Path" 
                    className="w-64 h-64 opacity-80 mb-6"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/250x250?text=Generate+Your+Path';
                    }}
                  />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Generate Your Learning Path
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    Fill out the form to create a personalized learning path for your career goals. Our AI will recommend steps and courses to help you succeed.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* My Learning Paths */}
        {activeTab === 'my-paths' && (
          <div>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : userPaths.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🧭</div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">No Learning Paths Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  You haven't created any learning paths yet. Create your first personalized learning journey.
                </p>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="btn btn-primary"
                >
                  Create Learning Path
                </button>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {userPaths.map((path, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {path.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {path.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {path.coreFocus.slice(0, 4).map((focus, idx) => (
                          <span 
                            key={idx} 
                            className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs"
                          >
                            {focus}
                          </span>
                        ))}
                        {path.coreFocus.length > 4 && (
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                            +{path.coreFocus.length - 4} more
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span>{path.steps.length} steps</span>
                        <span>{new Date(path.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <Link 
                        to={`/learning-paths/${path.id}`}
                        className="btn btn-primary w-full py-2.5"
                      >
                        View Path Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LearningPathsPage; 