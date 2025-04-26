import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/animations/PageTransition';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ArrowRight } from 'lucide-react';
import TestimonialsCarousel from '@/components/landing/TestimonialsCarousel';
import InstitutionBanner from '@/components/landing/InstitutionBanner';
import CompanionAppBanner from '@/components/landing/CompanionAppBanner';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  // Features list
  const features = [
    {
      title: "AI-Powered Learning",
      description: "Transform documents into personalized study materials in seconds with our advanced AI.",
      icon: "🤖"
    },
    {
      title: "Streak-Based Motivation",
      description: "Build consistent study habits with our gamified streak system that keeps you engaged.",
      icon: "🔥"
    },
    {
      title: "Smart Flashcards",
      description: "Automatically generated flashcards help reinforce key concepts and improve retention.",
      icon: "🧠"
    },
    {
      title: "Research Collaboration",
      description: "Connect with peers and mentors to collaborate on research projects and papers.",
      icon: "🔍"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <PageTransition>
        <main>
          {/* Hero Section */}
          <section className="relative">
            <div className="absolute inset-0 overflow-hidden" style={{ zIndex: -1 }}>
              <div className="absolute inset-0 bg-black/50"> {/* Semi-transparent overlay */}
                <img 
                  src="/lovable-uploads/f73d1a1a-8bd0-4b9f-b8f5-02c5a6740722.png" 
                  alt="MindGrove Banner" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="container mx-auto py-24 px-6 text-center relative z-10">
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Cultivate Knowledge with <span className="text-primary">Mind</span>Grove
              </motion.h1>
              
              <motion.p
                className="text-lg md:text-xl text-white/90 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Unlock your academic potential with AI-powered tools for learning, research, and collaboration.
              </motion.p>
              
              <motion.div
                className="space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {!isAuthenticated ? (
                  <>
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
                      <Link to="/signup">Get Started <ArrowRight className="ml-2" /></Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild size="lg">
                    <Link to={user?.user_metadata?.account_type === 'institution' ? "/institution/dashboard" : "/dashboard"}>
                      Go to Dashboard <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                )}
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-6">
              <motion.h2
                className="text-3xl font-bold text-center mb-12 text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Empowering Your Learning Journey
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="text-center p-6 rounded-lg bg-card shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                  >
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-20">
            <div className="container mx-auto px-6">
              <motion.h2
                className="text-3xl font-bold text-center mb-12 text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                What Our Users Are Saying
              </motion.h2>
              <TestimonialsCarousel />
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-primary/10">
            <div className="container mx-auto px-6 text-center">
              <motion.h2
                className="text-3xl font-bold mb-8 text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Ready to Transform Your Learning Experience?
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Button asChild size="lg">
                  <Link to="/signup">Get Started Today <ArrowRight className="ml-2" /></Link>
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Institution Banner */}
          <InstitutionBanner />
          
          {/* Companion App Banner */}
          <CompanionAppBanner />
        </main>

        <footer className="bg-muted/50 py-10">
          <div className="container mx-auto px-6 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MindGrove. All rights reserved.</p>
            <p>
              <a href="/terms" className="hover:underline">Terms of Service</a> | <a href="/privacy" className="hover:underline">Privacy Policy</a>
            </p>
          </div>
        </footer>
      </PageTransition>
    </div>
  );
};

export default LandingPage;
