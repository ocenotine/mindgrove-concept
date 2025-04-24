import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Users, FileText } from 'lucide-react';
import Button from '@/components/common/Button';
import BookAnimation from '@/components/animations/BookAnimation';
import BackgroundAnimation from '@/components/animations/BackgroundAnimation';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* 3D Background Animation */}
      <BackgroundAnimation />
      
      {/* Header */}
      <header className="border-b py-4 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-brand text-primary flex items-center gap-2">
            <img src="/mindgrove.png" alt="MindGrove Logo" className="h-10 w-10" />
            MindGrove
          </Link>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-10 px-6 flex-1 flex flex-col items-center justify-center text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            AI-Powered Academic Research Assistant
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform your research with automated summarization, flashcards and collaborative tools.
          </p>
          
          {/* 3D Book Animation - now with proper position prop */}
          <div className="mb-8 h-[300px]">
            <BookAnimation position={[0, 0, 0]} title="MindGrove" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="px-8">Get Started</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8">Log In</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              MindGrove helps students and researchers work smarter, not harder.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="h-10 w-10 text-primary" />,
                title: "AI Document Analysis",
                description: "Automatically extract insights, summaries and flashcards from research papers."
              },
              {
                icon: <Users className="h-10 w-10 text-primary" />,
                title: "Collaborative Learning",
                description: "Share annotations, create study groups and collaborate in real-time."
              },
              {
                icon: <FileText className="h-10 w-10 text-primary" />,
                title: "Document Management",
                description: "Organize your research materials with smart tagging and powerful search."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
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

      {/* Testimonials Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">What Users Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Researchers and students love using MindGrove for their academic work.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "MindGrove has completely transformed how I approach my research. The AI summaries save me hours of reading time.",
                author: "Jurua Sebastian",
                role: "Software engineering Student"
              },
              {
                quote: "The flashcard feature helped me ace my exams. I love how it automatically creates study materials from my PDFs.",
                author: "Asiime blessing",
                role: "Software engineering Student"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <p className="text-lg italic mb-4">{testimonial.quote}</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
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
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Research?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join the students and researchers using MindGrove to enhance their academic work.
            </p>
            <div className="inline-block">
              <Link to="/signup">
                <Button size="lg" className="px-8">Get Started for Free</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
