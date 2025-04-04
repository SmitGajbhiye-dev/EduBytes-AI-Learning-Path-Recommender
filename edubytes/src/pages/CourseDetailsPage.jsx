import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/layout/Layout';
import { getCourseDetails } from '../services/courseService';
import { saveCourse } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const { user, userData } = useAuth();
  
  // Extract provider from URL if present (can be enhanced with provider from URL params)
  const provider = new URLSearchParams(window.location.search).get('provider') || 'Unknown';
  
  // Check if course is already saved by the user
  useEffect(() => {
    if (userData && userData.savedCourses && course) {
      const isSaved = userData.savedCourses.some(c => c.id === course.id);
      setSaved(isSaved);
    }
  }, [userData, course]);
  
  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;
      
      setLoading(true);
      try {
        const result = await getCourseDetails(courseId, provider);
        
        if (result.success && result.data) {
          setCourse(result.data);
        } else {
          setError(result.error || 'Failed to fetch course details');
        }
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('An error occurred while fetching course details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseDetails();
  }, [courseId, provider]);
  
  // Handle saving course to user's saved courses
  const handleSaveCourse = async () => {
    if (!user) {
      window.location.href = `/login?redirect=/courses/${courseId}?provider=${provider}`;
      return;
    }
    
    if (!course) return;
    
    setSavingCourse(true);
    try {
      const result = await saveCourse(user.uid, course);
      
      if (result.success) {
        setSaved(true);
      } else {
        console.error('Error saving course:', result.error);
      }
    } catch (err) {
      console.error('Error saving course:', err);
    } finally {
      setSavingCourse(false);
    }
  };
  
  return (
    <Layout>
      <Helmet>
        <title>{course ? `${course.title} | EduBytes` : 'Course Details | EduBytes'}</title>
        <meta 
          name="description" 
          content={course ? `Learn about ${course.title} from ${course.provider}. ${course.description.substring(0, 150)}...` : 'View course details on EduBytes'} 
        />
      </Helmet>
      
      <div className="container-custom py-24">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">😕</div>
            <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-2">Course Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Link to="/courses" className="btn btn-primary">
              Browse Courses
            </Link>
          </div>
        ) : course ? (
          <div>
            {/* Breadcrumbs */}
            <div className="mb-6 text-sm">
              <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary">
                Home
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <Link to="/courses" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary">
                Courses
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-700 dark:text-gray-300">{course.title}</span>
            </div>
            
            {/* Course Header */}
            <div className="glass-card shadow-md p-6 md:p-8 mb-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3">
                  <div className="flex items-center mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      {course.category}
                    </span>
                    <span className="ml-3 text-gray-500 dark:text-gray-400">
                      By {course.provider}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
                    {course.title}
                  </h1>
                  
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    {course.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-5 h-5 ${i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">
                        {course.rating} ({course.studentsEnrolled.toLocaleString()} students)
                      </span>
                    </div>
                    
                    <span className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="w-5 h-5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {course.duration}
                    </span>
                    
                    <span className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="w-5 h-5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {course.level}
                    </span>
                    
                    <span className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="w-5 h-5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Last updated: {new Date(course.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    {course.topics.map((topic, index) => (
                      <Link 
                        key={index} 
                        to={`/courses?q=${encodeURIComponent(topic)}`}
                        className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        {topic}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <div className="lg:w-1/3">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img 
                      src={course.imageUrl} 
                      alt={course.title} 
                      className="w-full h-48 object-cover"
                    />
                    
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {course.price === 0 ? (
                            <span className="text-green-600 dark:text-green-400">Free</span>
                          ) : (
                            <span>${course.price}</span>
                          )}
                        </div>
                        {course.isCertified && (
                          <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                            Certificate
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <a 
                          href={course.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary w-full py-3"
                        >
                          Enroll Now
                        </a>
                        
                        <button 
                          onClick={handleSaveCourse}
                          disabled={saved || savingCourse}
                          className={`btn w-full py-3 ${saved ? 'btn-success' : 'btn-outline-primary'}`}
                        >
                          {savingCourse ? (
                            <span className="flex justify-center items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </span>
                          ) : saved ? (
                            <span className="flex justify-center items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Saved to Library
                            </span>
                          ) : (
                            <span className="flex justify-center items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                              Save to Library
                            </span>
                          )}
                        </button>
                      </div>
                      
                      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                        <p>This course is offered by {course.provider}. When you click "Enroll Now", you will be redirected to their website to complete registration.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Similar Courses */}
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">
                Similar Courses
              </h2>
              
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Similar courses will be available soon.</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default CourseDetailsPage; 