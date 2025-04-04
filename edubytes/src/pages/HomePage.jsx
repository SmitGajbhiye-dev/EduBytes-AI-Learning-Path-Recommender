import { Helmet } from 'react-helmet-async';
import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import CallToAction from '../components/home/CallToAction';

const HomePage = () => {
  return (
    <Layout>
      <Helmet>
        <title>EduBytes | Personalized Learning Platform</title>
        <meta name="description" content="Find the perfect courses and learning paths with EduBytes, your AI-powered education platform." />
      </Helmet>
      
      <Hero />
      <Features />
      <CallToAction />
    </Layout>
  );
};

export default HomePage; 