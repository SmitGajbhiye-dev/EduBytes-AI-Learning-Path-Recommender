// YouTube API Integration
import { getFirestore, doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const YouTubeAPI = (() => {
    // YouTube API Key
    const API_KEY = "AIzaSyCckjRVd_SdyiX9-tDIZwkg5COIZmVicFg";
    
    // Cache for storing fetched videos and playlists to reduce API calls
    let videoCache = {};
    let playlistCache = {};
    let videoDetailsCache = {};
    
    // Reference to Firestore database
    const db = getFirestore();
    
    // Initialize the YouTube API
    const init = () => {
        console.log('YouTube API module initialized with official YouTube Data API');
    };
    
    // Search for educational videos based on topic
    const searchVideos = async (topic, maxResults = 12) => {
        try {
            // Check cache first
            const cacheKey = `${topic}_${maxResults}`;
            if (videoCache[cacheKey]) {
                console.log('Returning cached YouTube results for:', topic);
                return videoCache[cacheKey];
            }
            
            console.log('Searching YouTube for:', topic);
            
            // Use the real YouTube API
            const searchQuery = `${topic} tutorial course`;
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(searchQuery)}&key=${API_KEY}&relevanceLanguage=en&videoDuration=long`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Get detailed information for each video including duration
            const videoDetailsPromises = data.items.map(item => getVideoDetailsFromAPI(item.id.videoId));
            const videoDetails = await Promise.all(videoDetailsPromises);
            
            // Format videos for our application
            const videos = videoDetails.map((details, index) => {
                const snippet = data.items[index].snippet;
                return {
                    id: data.items[index].id.videoId,
                    title: snippet.title,
                    description: snippet.description,
                    thumbnail: snippet.thumbnails.high.url,
                    channelTitle: snippet.channelTitle,
                    duration: formatDuration(details.contentDetails.duration),
                    viewCount: formatViewCount(details.statistics.viewCount),
                    publishedAt: snippet.publishedAt,
                    url: `https://youtube.com/watch?v=${data.items[index].id.videoId}`,
                    tags: details.snippet.tags ? details.snippet.tags.slice(0, 5) : []
                };
            });
            
            // Cache the results
            videoCache[cacheKey] = videos;
            
            return videos;
        } catch (error) {
            console.error('Error searching YouTube videos:', error);
            // Fallback to simulated results if API fails
            return simulateYouTubeResults(topic, maxResults);
        }
    };
    
    // Get detailed information for a video from the YouTube API
    const getVideoDetailsFromAPI = async (videoId) => {
        // Check cache first
        if (videoDetailsCache[videoId]) {
            return videoDetailsCache[videoId];
        }
        
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            // Cache the result
            videoDetailsCache[videoId] = data.items[0];
            return data.items[0];
        }
        
        throw new Error('Video not found');
    };
    
    // Format YouTube duration (ISO 8601 format) to human-readable format
    const formatDuration = (duration) => {
        // PT1H30M15S -> 1:30:15
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        
        if (!match) return '0:00';
        
        const hours = match[1] ? parseInt(match[1]) : 0;
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const seconds = match[3] ? parseInt(match[3]) : 0;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    };
    
    // Format view count to human-readable format
    const formatViewCount = (viewCount) => {
        const count = parseInt(viewCount);
        
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        } else {
            return count.toString();
        }
    };
    
    // Get playlists for a topic
    const getPlaylists = async (topic, maxResults = 5) => {
        try {
            // Check cache first
            const cacheKey = `playlist_${topic}_${maxResults}`;
            if (playlistCache[cacheKey]) {
                console.log('Returning cached YouTube playlists for:', topic);
                return playlistCache[cacheKey];
            }
            
            console.log('Fetching YouTube playlists for:', topic);
            
            // Use the real YouTube API
            const searchQuery = `${topic} course playlist tutorial`;
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&maxResults=${maxResults}&q=${encodeURIComponent(searchQuery)}&key=${API_KEY}&relevanceLanguage=en`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Get detailed information for each playlist
            const playlistDetailsPromises = data.items.map(item => getPlaylistDetailsFromAPI(item.id.playlistId));
            const playlistDetails = await Promise.all(playlistDetailsPromises);
            
            // Format playlists for our application
            const playlists = playlistDetails.map((details, index) => {
                const snippet = data.items[index].snippet;
                return {
                    id: data.items[index].id.playlistId,
                    title: snippet.title,
                    description: snippet.description,
                    thumbnail: snippet.thumbnails.high.url,
                    channelTitle: snippet.channelTitle,
                    videoCount: details.contentDetails.itemCount,
                    publishedAt: snippet.publishedAt,
                    url: `https://youtube.com/playlist?list=${data.items[index].id.playlistId}`
                };
            });
            
            // Cache the results
            playlistCache[cacheKey] = playlists;
            
            return playlists;
        } catch (error) {
            console.error('Error fetching YouTube playlists:', error);
            // Fallback to simulated results if API fails
            return simulateYouTubePlaylists(topic, maxResults);
        }
    };
    
    // Get detailed information for a playlist from the YouTube API
    const getPlaylistDetailsFromAPI = async (playlistId) => {
        const url = `https://www.googleapis.com/youtube/v3/playlists?part=contentDetails&id=${playlistId}&key=${API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            return data.items[0];
        }
        
        throw new Error('Playlist not found');
    };
    
    // Simulate YouTube playlists for demo purposes (fallback)
    const simulateYouTubePlaylists = (topic, maxResults) => {
        const playlists = {
            'web-development': [
                {
                    id: 'pl-web-1',
                    title: 'Full Stack Web Development Course 2023',
                    description: 'Complete course covering frontend and backend web development',
                    thumbnail: 'https://i.ytimg.com/vi/PBTYxXADG_k/maxresdefault.jpg',
                    channelTitle: 'Traversy Media',
                    videoCount: 45,
                    publishedAt: '2023-01-10',
                    url: 'https://youtube.com/playlist?list=example1'
                },
                {
                    id: 'pl-web-2',
                    title: 'React JS Complete Course',
                    description: 'Learn React from basics to advanced concepts',
                    thumbnail: 'https://i.ytimg.com/vi/w7ejDZ8SWv8/maxresdefault.jpg',
                    channelTitle: 'Academind',
                    videoCount: 32,
                    publishedAt: '2022-11-15',
                    url: 'https://youtube.com/playlist?list=example2'
                },
                {
                    id: 'pl-web-3',
                    title: 'Node.js Tutorial for Beginners',
                    description: 'Complete Node.js backend development course',
                    thumbnail: 'https://i.ytimg.com/vi/TlB_eWDSMt4/maxresdefault.jpg',
                    channelTitle: 'The Net Ninja',
                    videoCount: 28,
                    publishedAt: '2022-09-05',
                    url: 'https://youtube.com/playlist?list=example3'
                }
            ],
            'data-science': [
                {
                    id: 'pl-data-1',
                    title: 'Data Science with Python - Complete Course',
                    description: 'Learn data science from scratch with Python',
                    thumbnail: 'https://i.ytimg.com/vi/ua-CiDNNj30/maxresdefault.jpg',
                    channelTitle: 'freeCodeCamp.org',
                    videoCount: 38,
                    publishedAt: '2023-02-01',
                    url: 'https://youtube.com/playlist?list=example4'
                },
                {
                    id: 'pl-data-2',
                    title: 'Machine Learning A-Z',
                    description: 'Complete machine learning course with Python and R',
                    thumbnail: 'https://i.ytimg.com/vi/GwIo3gDZCVQ/maxresdefault.jpg',
                    channelTitle: 'Krish Naik',
                    videoCount: 42,
                    publishedAt: '2022-10-20',
                    url: 'https://youtube.com/playlist?list=example5'
                }
            ],
            'machine-learning': [
                {
                    id: 'pl-ml-1',
                    title: 'Deep Learning Specialization',
                    description: 'Complete deep learning course by Andrew Ng',
                    thumbnail: 'https://i.ytimg.com/vi/CS4cs9xpXxE/maxresdefault.jpg',
                    channelTitle: 'DeepLearning.AI',
                    videoCount: 55,
                    publishedAt: '2022-08-15',
                    url: 'https://youtube.com/playlist?list=example6'
                },
                {
                    id: 'pl-ml-2',
                    title: 'TensorFlow 2.0 Complete Course',
                    description: 'Learn TensorFlow from basics to advanced',
                    thumbnail: 'https://i.ytimg.com/vi/tPYj3fFJGjk/maxresdefault.jpg',
                    channelTitle: 'TensorFlow',
                    videoCount: 30,
                    publishedAt: '2022-12-10',
                    url: 'https://youtube.com/playlist?list=example7'
                }
            ],
            'cybersecurity': [
                {
                    id: 'pl-sec-1',
                    title: 'Ethical Hacking Course',
                    description: 'Complete ethical hacking and cybersecurity course',
                    thumbnail: 'https://i.ytimg.com/vi/3Kq1MIfTWCE/maxresdefault.jpg',
                    channelTitle: 'The Cyber Mentor',
                    videoCount: 25,
                    publishedAt: '2023-01-05',
                    url: 'https://youtube.com/playlist?list=example8'
                },
                {
                    id: 'pl-sec-2',
                    title: 'Network Security Fundamentals',
                    description: 'Learn network security from scratch',
                    thumbnail: 'https://i.ytimg.com/vi/qiQR5rTSshw/maxresdefault.jpg',
                    channelTitle: 'David Bombal',
                    videoCount: 18,
                    publishedAt: '2022-11-20',
                    url: 'https://youtube.com/playlist?list=example9'
                }
            ],
            'mobile-development': [
                {
                    id: 'pl-mob-1',
                    title: 'Flutter & Dart Complete Course',
                    description: 'Build iOS and Android apps with Flutter',
                    thumbnail: 'https://i.ytimg.com/vi/VPvVD8t02U8/maxresdefault.jpg',
                    channelTitle: 'Academind',
                    videoCount: 40,
                    publishedAt: '2023-02-15',
                    url: 'https://youtube.com/playlist?list=example10'
                },
                {
                    id: 'pl-mob-2',
                    title: 'iOS Development with Swift',
                    description: 'Complete iOS app development course',
                    thumbnail: 'https://i.ytimg.com/vi/comQ1-x2a1Q/maxresdefault.jpg',
                    channelTitle: 'CodeWithChris',
                    videoCount: 35,
                    publishedAt: '2022-10-10',
                    url: 'https://youtube.com/playlist?list=example11'
                }
            ]
        };
        
        // Default playlists for topics not in our predefined list
        const defaultPlaylists = [
            {
                id: `pl-${topic}-1`,
                title: `${topic.replace('-', ' ')} Masterclass`,
                description: `Complete ${topic.replace('-', ' ')} course for beginners to advanced`,
                thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                channelTitle: 'EduTech Academy',
                videoCount: 30,
                publishedAt: '2023-01-20',
                url: 'https://youtube.com/playlist?list=example12'
            },
            {
                id: `pl-${topic}-2`,
                title: `${topic.replace('-', ' ')} for Beginners`,
                description: `Learn ${topic.replace('-', ' ')} from scratch`,
                thumbnail: 'https://i.ytimg.com/vi/rfscVS0vtbw/maxresdefault.jpg',
                channelTitle: 'Tech Tutorials',
                videoCount: 25,
                publishedAt: '2022-12-05',
                url: 'https://youtube.com/playlist?list=example13'
            }
        ];
        
        // Get playlists for the requested topic or use default
        const topicPlaylists = playlists[topic] || defaultPlaylists;
        
        // Return the requested number of playlists
        return topicPlaylists.slice(0, maxResults);
    };
    
    // Simulate YouTube API results for demo purposes (fallback)
    const simulateYouTubeResults = (topic, maxResults) => {
        const topics = {
            'web-development': [
                {
                    id: 'yt-web-1',
                    title: 'Complete Web Development Bootcamp 2023',
                    description: 'Learn HTML, CSS, JavaScript, React, Node.js and more in this comprehensive web development course.',
                    thumbnail: 'https://i.ytimg.com/vi/Q33KBiDriJY/maxresdefault.jpg',
                    channelTitle: 'Web Dev Simplified',
                    duration: '10:45:22',
                    viewCount: '1.2M',
                    publishedAt: '2023-01-15',
                    url: 'https://youtube.com/watch?v=example1',
                    tags: ['html', 'css', 'javascript', 'react', 'nodejs']
                },
                {
                    id: 'yt-web-2',
                    title: 'React JS Crash Course 2023',
                    description: 'Learn React basics and build a complete application in this crash course.',
                    thumbnail: 'https://i.ytimg.com/vi/w7ejDZ8SWv8/maxresdefault.jpg',
                    channelTitle: 'Traversy Media',
                    duration: '1:30:45',
                    viewCount: '950K',
                    publishedAt: '2023-02-10',
                    url: 'https://youtube.com/watch?v=example2',
                    tags: ['react', 'javascript', 'web development']
                },
                {
                    id: 'yt-web-3',
                    title: 'Full Stack MERN Project Tutorial',
                    description: 'Build a full stack application with MongoDB, Express, React, and Node.js.',
                    thumbnail: 'https://i.ytimg.com/vi/7CqJlxBYj-M/maxresdefault.jpg',
                    channelTitle: 'JavaScript Mastery',
                    duration: '4:15:30',
                    viewCount: '820K',
                    publishedAt: '2023-03-05',
                    url: 'https://youtube.com/watch?v=example3',
                    tags: ['mern', 'mongodb', 'express', 'react', 'nodejs']
                }
            ],
            'data-science': [
                {
                    id: 'yt-data-1',
                    title: 'Python for Data Science Full Course',
                    description: 'Learn Python, Pandas, NumPy, Matplotlib and more for data science and analysis.',
                    thumbnail: 'https://i.ytimg.com/vi/ua-CiDNNj30/maxresdefault.jpg',
                    channelTitle: 'freeCodeCamp.org',
                    duration: '12:20:15',
                    viewCount: '1.5M',
                    publishedAt: '2023-01-05',
                    url: 'https://youtube.com/watch?v=example4',
                    tags: ['python', 'data science', 'pandas', 'numpy']
                },
                {
                    id: 'yt-data-2',
                    title: 'Data Visualization with Python',
                    description: 'Master data visualization techniques using Python libraries.',
                    thumbnail: 'https://i.ytimg.com/vi/GPOUGpF-Sno/maxresdefault.jpg',
                    channelTitle: 'Corey Schafer',
                    duration: '3:45:10',
                    viewCount: '620K',
                    publishedAt: '2023-02-22',
                    url: 'https://youtube.com/watch?v=example5',
                    tags: ['python', 'data visualization', 'matplotlib', 'seaborn']
                }
            ]
        };
        
        // Default videos for topics not in our predefined list
        const defaultVideos = [
            {
                id: `yt-${topic}-1`,
                title: `Complete ${topic.replace('-', ' ')} Course 2023`,
                description: `Learn everything about ${topic.replace('-', ' ')} in this comprehensive tutorial.`,
                thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                channelTitle: 'EduTech Academy',
                duration: '6:30:15',
                viewCount: '980K',
                publishedAt: '2023-03-01',
                url: 'https://youtube.com/watch?v=example23',
                tags: [topic.replace('-', ' '), 'tutorial', 'course']
            },
            {
                id: `yt-${topic}-2`,
                title: `${topic.replace('-', ' ')} for Beginners`,
                description: `Start your journey in ${topic.replace('-', ' ')} with this beginner-friendly tutorial.`,
                thumbnail: 'https://i.ytimg.com/vi/rfscVS0vtbw/maxresdefault.jpg',
                channelTitle: 'Tech Tutorials',
                duration: '3:45:22',
                viewCount: '750K',
                publishedAt: '2023-02-15',
                url: 'https://youtube.com/watch?v=example24',
                tags: [topic.replace('-', ' '), 'beginners', 'tutorial']
            },
            {
                id: `yt-${topic}-3`,
                title: `Advanced ${topic.replace('-', ' ')} Techniques`,
                description: `Take your ${topic.replace('-', ' ')} skills to the next level with advanced techniques.`,
                thumbnail: 'https://i.ytimg.com/vi/Z9TwGKdcjOo/maxresdefault.jpg',
                channelTitle: 'Pro Tutorials',
                duration: '5:15:30',
                viewCount: '620K',
                publishedAt: '2023-01-20',
                url: 'https://youtube.com/watch?v=example25',
                tags: [topic.replace('-', ' '), 'advanced', 'techniques']
            }
        ];
        
        // Get videos for the requested topic or use default
        const topicVideos = topics[topic] || defaultVideos;
        
        // Return the requested number of videos
        return topicVideos.slice(0, maxResults);
    };
    
    // Get video details by ID
    const getVideoDetails = async (videoId) => {
        try {
            return await getVideoDetailsFromAPI(videoId);
        } catch (error) {
            console.error('Error getting video details:', error);
            // Fallback if API fails
            return {
                id: videoId,
                title: 'Sample Video Title',
                description: 'This is a sample video description that would be fetched from the YouTube API.',
                thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                channelTitle: 'Sample Channel',
                duration: '1:30:00',
                viewCount: '1M',
                publishedAt: '2023-01-01',
                url: `https://youtube.com/watch?v=${videoId}`
            };
        }
    };
    
    // Add video to user's watch later list
    const addToWatchLater = async (videoId, userId) => {
        try {
            if (!userId) {
                console.warn('User not logged in, cannot add to watch later');
                return false;
            }
            
            console.log(`Adding video ${videoId} to watch later for user ${userId}`);
            
            // Update Firestore
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
                watchLater: arrayUnion(videoId)
            });
            
            return true;
        } catch (error) {
            console.error('Error adding to watch later:', error);
            return false;
        }
    };
    
    // Remove video from user's watch later list
    const removeFromWatchLater = async (videoId, userId) => {
        try {
            if (!userId) {
                console.warn('User not logged in, cannot remove from watch later');
                return false;
            }
            
            console.log(`Removing video ${videoId} from watch later for user ${userId}`);
            
            // Update Firestore
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
                watchLater: arrayRemove(videoId)
            });
            
            return true;
        } catch (error) {
            console.error('Error removing from watch later:', error);
            return false;
        }
    };
    
    // Check if a video is in the user's watch later list
    const isInWatchLater = async (videoId, userId) => {
        try {
            if (!userId) {
                return false;
            }
            
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            
            if (!userDoc.exists()) {
                return false;
            }
            
            const userData = userDoc.data();
            return userData.watchLater && userData.watchLater.includes(videoId);
        } catch (error) {
            console.error('Error checking watch later status:', error);
            return false;
        }
    };
    
    // Return public API
    return {
        init,
        searchVideos,
        getPlaylists,
        getVideoDetails,
        addToWatchLater,
        removeFromWatchLater,
        isInWatchLater
    };
})();

// Initialize the YouTube API module
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        YouTubeAPI.init();
    });
    
    // Make the module available globally
    window.YouTubeAPI = YouTubeAPI;
}

export default YouTubeAPI; 