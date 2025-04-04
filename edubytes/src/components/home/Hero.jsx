import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const searchRef = useRef(null);
  const decorationRef = useRef(null);
  
  // Animation using GSAP
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation timeline
      const tl = gsap.timeline();
      
      tl.from(textRef.current.querySelectorAll('.animate-item'), {
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "power3.out"
      })
      .from(searchRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.2")
      .from(decorationRef.current.querySelectorAll('.deco-item'), {
        scale: 0,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "back.out(1.7)"
      }, "-=0.4");
      
      // Background animation - Make sure target exists 
      const bgElement = document.querySelector('.bg-gradient-animation');
      if (bgElement) {
        gsap.to('.bg-gradient-animation', {
          backgroundPosition: '400% 400%',
          duration: 20,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    }, heroRef);
    
    return () => ctx.revert();
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to search page with query
      window.location.href = `/courses?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div 
      ref={heroRef}
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-animation bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-darkBg dark:via-gray-900 dark:to-darkBg"
      style={{backgroundSize: '400% 400%'}}
    >
      {/* Background decoration */}
      <div ref={decorationRef} className="absolute inset-0 overflow-hidden">
        <div className="deco-item absolute top-20 left-[10%] w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"></div>
        <div className="deco-item absolute bottom-32 right-[5%] w-72 h-72 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="deco-item absolute top-1/4 right-[20%] w-40 h-40 bg-accent/5 dark:bg-accent/10 rounded-full blur-2xl"></div>
        <div className="deco-item absolute bottom-[30%] left-[15%] w-56 h-56 bg-primary/5 dark:bg-primary/5 rounded-full blur-2xl"></div>
      </div>
      
      <div className="container-custom z-10 px-4 md:px-8 pt-16 pb-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center" ref={textRef}>
          <h1 className="animate-item text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-accent">
            Your Personalized AI Learning Guide!
          </h1>
          
          <p className="animate-item text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
            Find the perfect learning path with our AI-powered education platform. 
            We analyze your goals and recommend the best courses from 25+ platforms.
          </p>
          
          <div className="animate-item flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/learning-paths" className="btn btn-primary text-lg px-8 py-3">
              Find Your Path
            </Link>
            <Link to="/ai-mentor" className="btn bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 text-lg px-8 py-3">
              Talk to AI Mentor
            </Link>
          </div>
          
          <div 
            ref={searchRef} 
            className="relative max-w-2xl mx-auto glass-card p-1.5 shadow-lg"
          >
            <form onSubmit={handleSubmit} className="flex">
              <input
                type="text"
                placeholder="Search for any course, skill or topic..."
                className="w-full bg-transparent px-5 py-3 text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="btn-primary flex-shrink-0 flex items-center justify-center px-6 rounded-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="ml-2">Search</span>
              </button>
            </form>
          </div>
          
          <div className="animate-item mt-8 flex flex-wrap justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <span>Popular searches:</span>
            <Link to="/courses?q=programming" className="hover:text-primary transition-colors">Programming</Link>
            <span>•</span>
            <Link to="/courses?q=data+science" className="hover:text-primary transition-colors">Data Science</Link>
            <span>•</span>
            <Link to="/courses?q=web+development" className="hover:text-primary transition-colors">Web Development</Link>
            <span>•</span>
            <Link to="/courses?q=medicine" className="hover:text-primary transition-colors">Medicine</Link>
            <span>•</span>
            <Link to="/courses?q=business" className="hover:text-primary transition-colors">Business</Link>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-display font-bold text-primary">25+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Learning Platforms</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-display font-bold text-primary">100K+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Courses Available</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-display font-bold text-primary">50+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Career Fields</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-display font-bold text-primary">24/7</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Mentor Assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 