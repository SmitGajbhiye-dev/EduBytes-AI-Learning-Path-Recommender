import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const featuresRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate section heading
      gsap.from(headingRef.current.querySelectorAll('.animate-item'), {
        y: 30,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 80%",
        }
      });
      
      // Animate features
      gsap.from(featuresRef.current.querySelectorAll('.feature-card'), {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 75%",
        }
      });
      
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);
  
  return (
    <section ref={sectionRef} className="py-16 md:py-20 relative bg-white dark:bg-darkBg overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-accent/5 rounded-full blur-2xl"></div>
      </div>
      
      <div className="container-custom px-4 md:px-8 relative z-10">
        {/* Section heading */}
        <div ref={headingRef} className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="animate-item text-3xl md:text-4xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Everything You Need to Learn Effectively
          </h2>
          <p className="animate-item text-base md:text-lg text-gray-700 dark:text-gray-300">
            Our platform combines AI technology with expert curation to provide you with the most effective learning tools and resources
          </p>
        </div>
        
        {/* Features grid */}
        <div 
          ref={featuresRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          <FeatureCard 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            title="AI-Powered Learning Paths"
            description="Get personalized learning paths created by our AI based on your goals, experience, and learning style."
            link="/learning-paths"
          />
          
          <FeatureCard 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            }
            title="AI Mentor Assistance"
            description="Ask questions, get explanations, and receive guidance from our AI mentor whenever you're stuck."
            link="/ai-mentor"
          />
          
          <FeatureCard 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            title="Curated Course Collection"
            description="We analyze and organize thousands of courses from 25+ platforms to help you find the best options."
            link="/courses"
          />
          
          <FeatureCard 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
            title="Progress Tracking"
            description="Track your learning progress, set goals, and celebrate milestones as you advance through your courses."
            link="/dashboard"
          />
          
          <FeatureCard 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Spaced Repetition"
            description="Our intelligent system reminds you to review material at optimal intervals to improve long-term retention."
            link="/spaced-learning"
          />
          
          <FeatureCard 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            title="Learning Communities"
            description="Connect with fellow learners, discuss course material, and collaborate on projects with our community features."
            link="/communities"
          />
        </div>
        
        <div className="text-center mt-12">
          <Link to="/features" className="btn btn-primary-outline text-lg px-8 py-3">
            Discover All Features
          </Link>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description, link }) => {
  return (
    <div className="feature-card glass-card p-6 h-full flex flex-col border border-gray-100 dark:border-gray-800 hover:border-primary/30 dark:hover:border-primary/30 transition-all hover:shadow-xl">
      <div className="text-primary mb-4">
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
        {description}
      </p>
      
      <Link to={link} className="text-primary hover:text-primary-dark font-medium flex items-center mt-auto group">
        Learn More
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    </div>
  );
};

export default Features;