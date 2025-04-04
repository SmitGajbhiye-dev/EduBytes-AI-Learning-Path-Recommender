import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CallToAction = () => {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const decorationRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate content
      gsap.from(contentRef.current.querySelectorAll('.animate-item'), {
        y: 30,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 80%",
        }
      });
      
      // Animate decorations
      gsap.from(decorationRef.current.querySelectorAll('.deco-item'), {
        scale: 0,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: decorationRef.current,
          start: "top 85%",
        }
      });
      
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);
  
  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.08) 0%, rgba(var(--color-accent-rgb), 0.08) 100%)',
      }}
    >
      {/* Decorative elements */}
      <div ref={decorationRef} className="absolute inset-0 overflow-hidden">
        <div className="deco-item absolute top-10 right-[5%] w-40 h-40 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="deco-item absolute bottom-20 left-[10%] w-56 h-56 rounded-full bg-accent/10 blur-3xl"></div>
        <div className="deco-item absolute top-1/3 left-[25%] w-24 h-24 rounded-full bg-secondary/10 blur-xl"></div>
      </div>
      
      <div className="container-custom px-4 md:px-8 relative z-10">
        <div 
          ref={contentRef}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="animate-item text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 text-gray-900 dark:text-white">
            Ready to Transform Your Learning Experience?
          </h2>
          
          <p className="animate-item text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of learners who have accelerated their careers through personalized learning paths and AI mentorship.
          </p>
          
          <div className="animate-item flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
              Create Free Account
            </Link>
            <Link to="/ai-mentor" className="btn bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 text-lg px-8 py-3">
              Try AI Mentor Now
            </Link>
          </div>
          
          <div className="animate-item grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Free Access</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Create an account and access core features at no cost
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Privacy First</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Your data is protected and never shared with third parties
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Instant Start</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Begin your learning journey in minutes, not days
              </p>
            </div>
          </div>
          
          <div className="animate-item mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-gray-600 dark:text-gray-400 text-sm">
            <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction; 