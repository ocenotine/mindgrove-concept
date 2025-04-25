import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Users, FileText, Star, PenTool, ChevronDown, LayoutDashboard, Sparkles } from 'lucide-react';
import Button from '@/components/common/Button';
import BookAnimation from '@/components/animations/BookAnimation';
import BackgroundAnimation from '@/components/animations/BackgroundAnimation';
import { useEffect, useState } from 'react';
import React, { lazy } from 'react';

const TestimonialsCarousel = React.lazy(() => import('@/components/landing/TestimonialsCarousel'));

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState({
    features: false,
    testimonials: false,
    pricing: false,
    faq: false
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.8;
      
      // Check each section's visibility
      document.querySelectorAll('section').forEach(section => {
        const sectionId = section.id;
        if (!sectionId) return;
        
        const sectionTop = section.offsetTop;
        if (scrollPosition > sectionTop) {
          setIsVisible(prev => ({ ...prev, [sectionId]: true }));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
    
      {/* Header */}
      <header className="border-b py-4 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-brand text-primary flex items-center gap-2">
            <img src="/mindgrove.png" alt="MindGrove Logo" className="h-10 w-10" />
            MindGrove
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How It Works</a>
            <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Testimonials</a>
            <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">FAQ</a>
          </div>
          
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 flex-1 flex flex-col items-center justify-center text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            Transform Your Academic Journey with AI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            MindGrove combines AI-powered document analysis, instant summarization, and smart flashcards to revolutionize how you study and research.
          </p>
          
          {/* 3D Book Animation - now with proper position prop */}
          <div className="mb-12 h-[300px] relative">
            <BookAnimation position={[0, 0, 0]} title="MindGrove" />
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-primary/10 backdrop-blur-sm rounded-full px-6 py-3 border border-primary/20"
            >
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">Powered by Advanced AI</span>
              </div>
            </motion.div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="px-8 bg-primary hover:bg-primary/90">Get Started for Free</Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="px-8 group">
                How It Works
                <ChevronDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
              </Button>
            </a>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-muted-foreground">Used by many learners</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-muted-foreground">4.3/5 average rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-muted-foreground">Multiple documents processed</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-muted/30 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={isVisible.features ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Intelligent Features for Modern Learning</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              MindGrove equips you with powerful AI tools designed to enhance your academic performance and research capabilities.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="h-10 w-10 text-primary" />,
                title: "AI Document Analysis",
                description: "Automatically extract key insights and concepts from academic papers, textbooks, and research materials with our advanced AI engine."
              },
              {
                icon: <BookOpen className="h-10 w-10 text-primary" />,
                title: "Smart Summarization",
                description: "Transform lengthy documents into concise, well-structured summaries that capture the most important information and save you hours of reading time."
              },
              {
                icon: <PenTool className="h-10 w-10 text-primary" />,
                title: "Intelligent Flashcards",
                description: "Generate study-ready flashcards that identify core concepts and create effective question-answer pairs to test your understanding and memory."
              },
              {
                icon: <Users className="h-10 w-10 text-primary" />,
                title: "Collaborative Learning",
                description: "Share annotations, create study groups and collaborate in real-time with peers and colleagues for enhanced understanding."
              },
              {
                icon: <LayoutDashboard className="h-10 w-10 text-primary" />,
                title: "Progress Tracking",
                description: "Monitor your study habits, track your learning achievements, and visualize your progress with detailed analytics and insights."
              },
              {
                icon: <FileText className="h-10 w-10 text-primary" />,
                title: "Smart Organization",
                description: "Keep your academic and research materials perfectly organized with intelligent tagging, powerful search, and automatic categorization."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible.features ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow"
              >
                <div className="mb-4 p-3 bg-primary/10 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">How MindGrove Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience a seamless workflow designed to maximize your academic productivity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Upload Documents",
                description: "Upload any academic paper, research document, or textbook chapter in PDF format."
              },
              {
                step: "2",
                title: "AI Processing",
                description: "Our AI analyzes the content, extracting key information and meaningful concepts."
              },
              {
                step: "3",
                title: "Generate Resources",
                description: "Create summaries and flashcards with a single click, perfectly tailored to your documents."
              },
              {
                step: "4",
                title: "Study Smarter",
                description: "Use the generated materials to enhance understanding and retention of complex subjects."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-card border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow h-full">
                  <div className="absolute -top-5 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 mt-4">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-1/2">
                    <motion.div 
                      animate={{ x: [0, 10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6 bg-muted/30 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={isVisible.testimonials ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-4">What Students & Researchers Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students and academics who are transforming their study habits with MindGrove
            </p>
          </motion.div>

          <React.Suspense fallback={<div className="h-[320px] flex items-center justify-center">Loading testimonials...</div>}>
            <TestimonialsCarousel />
          </React.Suspense>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={isVisible.faq ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about MindGrove
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: "What types of documents can MindGrove process?",
                answer: "MindGrove currently supports PDF documents, including academic papers, research articles, textbooks, and other educational materials. We're working on expanding to more formats soon."
              },
              {
                question: "How accurate are the AI-generated summaries?",
                answer: "Our AI models are specifically trained on academic and research content to ensure high accuracy. The summaries capture key concepts, methodologies, findings, and conclusions while maintaining the integrity of the original document."
              },
              {
                question: "Is my data secure with MindGrove?",
                answer: "Absolutely. We take data security seriously. Your documents are encrypted, and we don't store their content permanently. Our AI processing happens in secure environments, and we never share your data with third parties."
              },
              {
                question: "Can I use MindGrove for collaborative research?",
                answer: "Yes! MindGrove's collaborative features allow you to share documents, summaries, and flashcards with team members or classmates. You can collaborate in real-time, adding notes and annotations to shared documents."
              },
              {
                question: "Is there a limit to how many documents I can process?",
                answer: "Free accounts can process up to 5 documents per month, with a size limit of 20MB each. Premium subscriptions offer higher limits and additional features for serious researchers and students."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={isVisible.faq ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-card border rounded-lg p-6"
              >
                <h3 className="text-lg font-medium mb-2">{item.question}</h3>
                <p className="text-muted-foreground">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary/5 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Academic Experience?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of students and researchers using MindGrove to study smarter, not harder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="px-8 bg-primary hover:bg-primary/90">Start Your Free Trial</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="px-8">Log In</Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
             Get started today
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} MindGrove- AI Research Assistant.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
