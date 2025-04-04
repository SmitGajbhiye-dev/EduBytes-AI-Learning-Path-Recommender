import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getTrendingCourses } from '../../services/courseService';

gsap.registerPlugin(ScrollTrigger);

const CourseCard = ({ course }) => {
  return (
    <div className="course-card card group flex flex-col h-full">
      {/* Course Image */}
      <div className="relative overflow-hidden">
        <img 
          src={course.imageUrl} 
          alt={course.title} 
          className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white dark:bg-gray-900 rounded-full px-2 py-1 text-xs font-semibold text-gray-900 dark:text-white">
          {course.provider}
        </div>
      </div>
      
      {/* Course Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            course.level === 'Beginner' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : course.level === 'Intermediate'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
          }`}>
            {course.level}
          </span>
          <div className="flex items-center text-yellow-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-xs font-medium text-gray-700 dark:text-gray-300">{course.rating}</span>
          </div>
        </div>
        
        <h3 className="text-lg font-display font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
          {course.description}
        </p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center text-sm mb-3">
            <span className="text-gray-700 dark:text-gray-300">
              {course.duration}
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {course.price === 0 ? 'Free' : `$${course.price}`}
            </span>
          </div>
          
          <div className="flex justify-between">
            <a 
              href={course.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary text-sm py-2 px-4 flex-grow mr-2"
            >
              View Course
            </a>
            <button 
              className="p-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Save course"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrendingCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const sectionRef = useRef(null);
  
  const categories = ['All', 'Computer Science', 'Data Science', 'Business', 'Design', 'Medicine'];
  
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await getTrendingCourses(12);
        if (response.success) {
          setCourses(response.data);
        } else {
          console.error('Error fetching courses:', response.error);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // GSAP animation
  useEffect(() => {
    if (courses.length === 0) return;
    
    const ctx = gsap.context(() => {
      gsap.from('.section-title', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        }
      });
      
      gsap.from('.course-card', {
        y: 60,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.courses-grid',
          start: 'top 80%',
        }
      });
    }, sectionRef);
    
    return () => ctx.revert();
  }, [courses]);
  
  // Filter courses by category
  const filteredCourses = activeCategory === 'All' 
    ? courses
    : courses.filter(course => course.category === activeCategory);
  
  return (
    <section ref={sectionRef} className="py-20 bg-gray-50 dark:bg-darkBg/50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="section-title text-3xl md:text-4xl font-display font-bold mb-4 text-gray-900 dark:text-white">
            Trending Courses
          </h2>
          <p className="section-title max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Explore the most popular courses across different learning platforms, 
            curated and recommended by our AI.
          </p>
        </div>
        
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="courses-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            
            {filteredCourses.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-600 dark:text-gray-400">No courses found in this category.</p>
              </div>
            )}
            
            <div className="text-center mt-12">
              <Link 
                to="/courses" 
                className="btn btn-primary px-8 py-3 inline-flex items-center"
              >
                <span>View All Courses</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default TrendingCourses; 