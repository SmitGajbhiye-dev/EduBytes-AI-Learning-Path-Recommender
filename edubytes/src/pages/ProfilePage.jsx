import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import YouTubeAPI from '../services/youtubeAPI';

const ProfilePage = () => {
  const { user, userData, loading } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [watchLaterVideos, setWatchLaterVideos] = useState([]);
  const [watchLaterLoading, setWatchLaterLoading] = useState(false);
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const navigate = useNavigate();
  const db = getFirestore();

  // Predefined interests for suggestions
  const interestSuggestions = [
    'Web Development', 'Data Science', 'Machine Learning', 'Mobile Development',
    'Cloud Computing', 'DevOps', 'Cybersecurity', 'Blockchain', 'UI/UX Design',
    'Game Development', 'Artificial Intelligence', 'Programming Languages',
    'Software Engineering', 'Computer Science', 'Databases', 'Networking'
  ];
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Set initial form values when userData is loaded
  useEffect(() => {
    if (userData) {
      setUpdatedProfile({
        name: userData.name || '',
        email: userData.email || user?.email || '',
        bio: userData.bio || ''
      });
      setInterests(userData.interests || []);
    }
  }, [userData, user]);

  // Set active tab based on URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['profile', 'saved', 'interests'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Load watch later videos
  useEffect(() => {
    const fetchWatchLaterVideos = async () => {
      if (!user) return;
      
      setWatchLaterLoading(true);
      try {
        // Get user document
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const watchLaterIds = userData.watchLater || [];
          
          // Fetch video details for each ID
          const videosPromises = watchLaterIds.map(videoId => 
            YouTubeAPI.getVideoDetails(videoId)
          );
          
          const videosResults = await Promise.all(videosPromises);
          const formattedVideos = videosResults.map(videoDetails => {
            // Format the video information
            const snippet = videoDetails.snippet || {};
            
            return {
              id: videoDetails.id,
              title: snippet.title || 'Unknown Title',
              thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
              channelTitle: snippet.channelTitle || 'Unknown Channel',
              publishedAt: snippet.publishedAt || '',
              url: `https://youtube.com/watch?v=${videoDetails.id}`
            };
          });
          
          setWatchLaterVideos(formattedVideos);
        }
      } catch (error) {
        console.error('Error fetching watch later videos:', error);
      } finally {
        setWatchLaterLoading(false);
      }
    };
    
    fetchWatchLaterVideos();
  }, [user, db]);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      if (!user) {
        setUpdateError('You must be logged in to update your profile');
        return;
      }
      
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        name: updatedProfile.name,
        bio: updatedProfile.bio,
        interests: interests
      });
      
      setUpdateSuccess(true);
      setIsEditing(false);
      
      // Reset notification after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError('Failed to update profile: ' + error.message);
    }
  };

  // Handle adding new interest
  const handleAddInterest = () => {
    if (newInterest && !interests.includes(newInterest)) {
      setInterests([...interests, newInterest]);
      setNewInterest('');
    }
  };

  // Handle removing interest
  const handleRemoveInterest = (interest) => {
    setInterests(interests.filter(item => item !== interest));
  };

  // Handle selecting a suggested interest
  const handleSelectInterest = (interest) => {
    if (!interests.includes(interest)) {
      setInterests([...interests, interest]);
    }
  };

  // Handle removing video from watch later
  const handleRemoveVideo = async (videoId) => {
    try {
      if (!user) return;
      
      await YouTubeAPI.removeFromWatchLater(videoId, user.uid);
      
      // Update local state without refetching
      setWatchLaterVideos(prevVideos => 
        prevVideos.filter(video => video.id !== videoId)
      );
    } catch (error) {
      console.error('Error removing video:', error);
    }
  };

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
        <title>Your Profile | EduBytes</title>
        <meta name="description" content="Manage your EduBytes profile, saved content and learning preferences" />
      </Helmet>
      
      <div className="container-custom py-24">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
              Your Profile
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Manage your account, saved content, and learning preferences
            </p>
          </div>
          
          {updateSuccess && (
            <div className="mt-4 md:mt-0 bg-green-100 text-green-800 px-4 py-2 rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Profile updated successfully!
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex mb-8 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-5 ${
              activeTab === 'profile'
                ? 'text-primary font-medium border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-3 px-5 ${
              activeTab === 'saved'
                ? 'text-primary font-medium border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Saved Videos
          </button>
          <button
            onClick={() => setActiveTab('interests')}
            className={`py-3 px-5 ${
              activeTab === 'interests'
                ? 'text-primary font-medium border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Learning Interests
          </button>
        </div>
        
        {/* Profile Information */}
        {activeTab === 'profile' && (
          <div className="glass-card shadow-lg rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-sm btn-outline-primary"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            
            {updateError && (
              <div className="mb-4 bg-red-100 text-red-800 px-4 py-3 rounded-md">
                {updateError}
              </div>
            )}
            
            {isEditing ? (
              <form onSubmit={handleProfileUpdate}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="name">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="input-field w-full"
                    value={updatedProfile.name}
                    onChange={(e) => setUpdatedProfile({...updatedProfile, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="input-field w-full bg-gray-100 dark:bg-gray-800"
                    value={updatedProfile.email}
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="bio">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    className="input-field w-full min-h-[100px]"
                    value={updatedProfile.bio}
                    onChange={(e) => setUpdatedProfile({...updatedProfile, bio: e.target.value})}
                    placeholder="Tell us a bit about yourself and your learning goals..."
                  />
                </div>
                
                <div className="flex justify-end">
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold mr-4">
                    {userData?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {userData?.name || 'User'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Bio</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {userData?.bio || 'No bio provided yet. Click "Edit Profile" to add one.'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Learning Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {interests && interests.length > 0 ? (
                      interests.map((interest, index) => (
                        <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                          {interest}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No interests added yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Saved Videos */}
        {activeTab === 'saved' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Saved Videos
            </h2>
            
            {watchLaterLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : watchLaterVideos.length === 0 ? (
              <div className="text-center py-12 glass-card rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">No saved videos yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Browse our YouTube course section and save videos for later viewing
                </p>
                <button 
                  onClick={() => navigate('/courses/youtube')}
                  className="btn btn-primary"
                >
                  Browse YouTube Courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {watchLaterVideos.map(video => (
                  <div key={video.id} className="glass-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="relative pb-[56.25%] overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                      </div>
                    </a>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                          <a 
                            href={video.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary"
                          >
                            {video.title}
                          </a>
                        </h3>
                        
                        <button 
                          onClick={() => handleRemoveVideo(video.id)}
                          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                          title="Remove from Watch Later"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {video.channelTitle}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Learning Interests */}
        {activeTab === 'interests' && (
          <div className="glass-card shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Learning Interests
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Select your learning interests to get personalized course recommendations and learning paths.
            </p>
            
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {interests.map((interest, index) => (
                  <div 
                    key={index} 
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {interest}
                    <button 
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-2 text-primary/70 hover:text-primary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {interests.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400">No interests selected yet</p>
                )}
              </div>
              
              <div className="flex">
                <input
                  type="text"
                  className="input-field flex-grow"
                  placeholder="Add a learning interest..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                />
                <button
                  onClick={handleAddInterest}
                  className="btn btn-primary ml-2"
                  disabled={!newInterest}
                >
                  Add
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
                Suggested Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {interestSuggestions
                  .filter(suggestion => !interests.includes(suggestion))
                  .slice(0, 10)
                  .map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectInterest(suggestion)}
                      className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))
                }
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={handleProfileUpdate}
                className="btn btn-primary"
              >
                Save Interests
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage; 