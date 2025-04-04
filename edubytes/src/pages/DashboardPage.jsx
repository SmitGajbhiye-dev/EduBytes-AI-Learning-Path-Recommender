import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';

const DashboardPage = () => {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Helmet>
        <title>Dashboard | EduBytes</title>
        <meta name="description" content="Your personalized learning dashboard on EduBytes" />
      </Helmet>
      
      <div className="container-custom py-20">
        <div className="bg-white dark:bg-darkBg/80 rounded-xl shadow-md p-6 lg:p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Welcome, {userData?.name || 'Learner'}!
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Your personalized learning dashboard is ready. This is where you'll track your progress and manage your learning journey.
          </p>
          
          <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-display font-semibold text-primary mb-4">Getting Started</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-primary mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Find your ideal learning path tailored to your career goals</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-primary mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Explore top-rated courses across 25+ learning platforms</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-primary mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Chat with our AI mentor for personalized guidance</span>
              </li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a href="/learning-paths" className="block p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-2">Find Your Path</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">Generate a personalized learning path based on your career goals and interests.</p>
              <span className="text-primary font-medium flex items-center">
                Get started
                <svg className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </a>
            
            <a href="/ai-mentor" className="block p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-2">AI Mentor</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">Get personalized advice and answers to your learning and career questions.</p>
              <span className="text-primary font-medium flex items-center">
                Chat now
                <svg className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage; 