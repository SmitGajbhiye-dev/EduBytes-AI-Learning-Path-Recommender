import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { sendMessageToAI, saveConversation, getConversationHistory } from '../services/aiMentorService';
import CourseRecommendationCard from '../components/ai/CourseRecommendationCard';

const AiMentorPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [topicSuggestions] = useState([
    'Recommend Python courses for beginners',
    'What\'s the best way to learn React?',
    'Suggest a learning path for data science',
    'Compare JavaScript frameworks for beginners',
    'Recommend YouTube channels for learning UX design'
  ]);
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Modified scroll behavior - only scroll on new messages, not on every render
  const scrollToBottom = () => {
    // Only smooth scroll for user interactions, not initial load
    const behavior = messages.length > 1 ? 'smooth' : 'auto';
    messagesEndRef.current?.scrollIntoView({ behavior });
  };
  
  // Load conversation history
  useEffect(() => {
    const fetchConversationHistory = async () => {
      if (user) {
        const result = await getConversationHistory(user.uid);
        if (result.success && result.data.length > 0) {
          setMessages(result.data);
        } else {
          // Add welcome message if no history
          const welcomeMessage = {
            id: 'welcome-msg',
            content: "Hello! I'm your AI learning mentor. I can help you find courses, recommend learning resources, and provide guidance on your educational journey. How can I assist you today?",
            timestamp: new Date().toISOString(),
            sender: 'ai'
          };
          setMessages([welcomeMessage]);
        }
      }
    };
    
    if (!loading) {
      if (!user) {
        navigate('/login?redirect=/ai-mentor');
      } else {
        fetchConversationHistory();
      }
    }
  }, [user, loading, navigate]);
  
  // Scroll to bottom only when messages change, not on every render
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);
  
  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: `user-msg-${Date.now()}`,
      content: inputMessage,
      timestamp: new Date().toISOString(),
      sender: 'user'
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsTyping(true);
    
    try {
      // Get AI response
      const result = await sendMessageToAI(user.uid, inputMessage, messages);
      
      if (result.success) {
        const newMessages = [...updatedMessages, result.data];
        setMessages(newMessages);
        
        // Save conversation
        await saveConversation(user.uid, newMessages);
      } else {
        // Handle error
        setMessages([
          ...updatedMessages,
          {
            id: `error-${Date.now()}`,
            content: "I'm sorry, I encountered an error processing your request. Please try again.",
            timestamp: new Date().toISOString(),
            sender: 'ai'
          }
        ]);
      }
    } catch (error) {
      console.error('Error in AI conversation:', error);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Handle clicking on a suggestion
  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };
  
  // Clear conversation
  const handleClearConversation = () => {
    const welcomeMessage = {
      id: 'welcome-msg',
      content: "Hello! I'm your AI learning mentor. I can help you find courses, recommend learning resources, and provide guidance on your educational journey. How can I assist you today?",
      timestamp: new Date().toISOString(),
      sender: 'ai'
    };
    setMessages([welcomeMessage]);
    saveConversation(user.uid, [welcomeMessage]);
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Render message content with recommendation cards if available
  const renderMessageContent = (message) => {
    if (message.additionalData && message.additionalData.type === 'recommendations') {
      return (
        <div>
          <div className="whitespace-pre-wrap">{message.content}</div>
          <CourseRecommendationCard recommendations={message.additionalData.recommendations} />
        </div>
      );
    }
    
    return <div className="whitespace-pre-wrap">{message.content}</div>;
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
        <title>AI Learning Mentor | EduBytes</title>
        <meta name="description" content="Chat with EduBytes AI Learning Mentor for personalized learning guidance, course recommendations, and educational advice." />
      </Helmet>
      
      <div className="container-custom py-16 md:py-24">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            AI Learning Mentor
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Get personalized learning guidance, course recommendations, and answers to your educational questions.
          </p>
        </div>
        
        {/* Removed flex container and Learning Assistant sidebar */}
        {/* Main Chat Area - now full width */}
        <div className="w-full">
          {/* Chat Container */}
          <div className="glass-card shadow-md rounded-xl overflow-hidden mb-4">
            {/* Chat Header */}
            <div className="bg-primary/10 p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">AI Learning Mentor</h3>
                  <div className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleClearConversation}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                title="Clear conversation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            {/* Chat Messages - increased height */}
            <div className="p-4 h-[400px] md:h-[500px] overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`mb-4 ${msg.sender === 'user' ? 'text-right' : ''}`}
                >
                  <div 
                    className={`inline-block max-w-[85%] md:max-w-[75%] rounded-lg px-4 py-3 ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-br-none' 
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {renderMessageContent(msg)}
                    <div 
                      className={`text-xs mt-1 ${
                        msg.sender === 'user' 
                          ? 'text-primary-100' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="mb-4">
                  <div className="inline-block bg-white dark:bg-gray-800 rounded-lg rounded-bl-none px-4 py-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  id="chat-input"
                  ref={inputRef}
                  className="input-field flex-grow py-2"
                  placeholder="Ask me anything about learning..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className={`btn btn-primary py-2 ${!inputMessage.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!inputMessage.trim()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
          
          {/* Topic Suggestions */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Suggested Topics
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {topicSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AiMentorPage; 