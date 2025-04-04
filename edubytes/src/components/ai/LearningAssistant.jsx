import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LearningAssistant = () => {
  const { user, userData } = useAuth();
  const [interests, setInterests] = useState([]);
  const [coursesInProgress, setCoursesInProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Sample study tips
  const studyTips = [
    "Use the Pomodoro Technique: 25 minutes of focused work followed by a 5-minute break.",
    "Practice active recall by testing yourself on material rather than simply reviewing it.",
    "Teach what you've learned to someone else to reinforce your understanding.",
    "Break large topics into smaller, manageable chunks to avoid feeling overwhelmed.",
    "Create a dedicated study space free from distractions to improve focus.",
    "Use spaced repetition by reviewing material at increasing intervals.",
    "Mix up your study routine with different topics to improve retention.",
    "Take short breaks between study sessions to keep your mind fresh.",
    "Connect new information to things you already know for better memory retention.",
    "Set specific, achievable goals for each study session."
  ];
  
  const [randomTip, setRandomTip] = useState('');
  
  useEffect(() => {
    if (userData) {
      setIsLoading(false);
      setInterests(userData.interests || []);
      
      // In a real app, this would fetch courses in progress from a service
      setCoursesInProgress([
        { id: 'c1', title: 'Web Development Bootcamp', progress: 65, image: 'https://source.unsplash.com/random/100x100/?code' },
        { id: 'c2', title: 'Data Science Fundamentals', progress: 32, image: 'https://source.unsplash.com/random/100x100/?data' }
      ]);
      
      // Set a random study tip
      const tipIndex = Math.floor(Math.random() * studyTips.length);
      setRandomTip(studyTips[tipIndex]);
    }
  }, [userData]);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/80 to-accent/80 p-4">
        <h3 className="text-lg font-semibold text-white">Learning Assistant</h3>
        <p className="text-white/90 text-sm">Personalized learning support</p>
      </div>
      
      {isLoading ? (
        <div className="p-4 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="p-4">
          {/* Learning Profile */}
          <div className="mb-5">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Learning Profile
            </h4>
            
            {interests.length > 0 ? (
              <div className="flex flex-wrap gap-1 mb-2">
                {interests.slice(0, 4).map((interest, index) => (
                  <span 
                    key={index}
                    className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
                  >
                    {interest}
                  </span>
                ))}
                {interests.length > 4 && (
                  <span className="inline-block px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">
                    +{interests.length - 4} more
                  </span>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                No interests set yet. Update your profile to get better recommendations.
              </div>
            )}
            
            <Link 
              to="/profile?tab=interests" 
              className="text-xs text-primary hover:text-primary-dark font-medium"
            >
              Update Interests
            </Link>
          </div>
          
          {/* Courses in Progress */}
          <div className="mb-5">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Continue Learning
            </h4>
            
            {coursesInProgress.length > 0 ? (
              <div className="space-y-3">
                {coursesInProgress.map(course => (
                  <div key={course.id} className="flex items-center">
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={course.image} 
                        alt={course.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <Link 
                        to={`/courses/${course.id}`}
                        className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-primary line-clamp-1"
                      >
                        {course.title}
                      </Link>
                      
                      <div className="mt-1 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {course.progress}% complete
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No courses in progress. Find a course to start learning!
              </div>
            )}
          </div>
          
          {/* Study Tip */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Study Tip
            </h4>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-lg">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="ml-2 text-xs text-gray-700 dark:text-gray-300">
                  {randomTip}
                </p>
              </div>
            </div>
          </div>
          
          {/* Ask for help */}
          <div className="mt-5 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Need help with your learning journey?
            </p>
            <button 
              onClick={() => document.querySelector('#chat-input')?.focus()}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-full transition-colors"
            >
              Ask the AI Mentor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningAssistant; 