import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/animations/PageTransition";
import { useAuthStore } from "@/store/authStore";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { FeedbackSection } from "@/components/feedback/FeedbackSection";
import UseCases from "@/components/landing/UseCases";
import FAQ from "@/components/landing/FAQ";
import QRCodeGenerator from "@/components/common/QRCodeGenerator";
import InstitutionBanner from "@/components/landing/InstitutionBanner";
import BackgroundAnimation from "@/components/animations/BackgroundAnimation";
import CompanionAppBanner from "@/components/landing/CompanionAppBanner";
import TestimonialsCarousel from "@/components/landing/TestimonialsCarousel";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen min-h-[600px] max-h-[800px] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/uploads/banner.png')",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Cultivate Knowledge with MindGrove
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-white/90 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Unlock your academic potential with AI-powered study tools designed
            for students, researchers and educators
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              size="lg"
              className="text-lg px-8"
              onClick={() => navigate("/signup")}
            >
              Get Started →
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 border-white text-white hover:bg-white/10"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
    setTimeout(() => setIsLoaded(true), 100);
  }, [isAuthenticated, navigate]);

  if (!isLoaded) return null;

  const features = [
    {
      title: "AI-Powered Learning",
      description:
        "Transform documents into personalized study materials in seconds with our advanced AI.",
      icon: "🤖",
    },
    {
      title: "Streak-Based Motivation",
      description:
        "Build consistent study habits with our gamified streak system that keeps you engaged.",
      icon: "🔥",
    },
    {
      title: "Smart Flashcards",
      description:
        "Automatically generated flashcards help reinforce key concepts and improve retention.",
      icon: "🧠",
    },
    {
      title: "Research Collaboration",
      description:
        "Connect with peers and mentors to collaborate on research projects and papers.",
      icon: "🔍",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <PageTransition>
        <main>
          <HeroSection />

          <section className="relative overflow-hidden">
            <div className="container mx-auto px-6 py-12">
              <div className="bg-gradient-to-r from-primary/90 to-secondary/90 rounded-2xl p-8 flex items-center justify-between">
                <div className="space-y-4 flex-1">
                  <h2 className="text-3xl font-bold text-white">
                    Try the MindGrove Companion App
                  </h2>
                  <p className="text-white/90">
                    Take your research on the go! Get instant access to papers,
                    summaries, and saved research anytime, anywhere.
                  </p>
                  <Button
                    variant="secondary"
                    className="bg-white text-primary hover:bg-white/90"
                    asChild
                  >
                    <Link to="/landing">Download Now</Link>
                  </Button>
                </div>
                <div className="hidden md:block bg-white p-4 rounded-lg">
                  <QRCodeGenerator
                    value="https://mindgrove.app/download"
                    size={128}
                  />
                </div>
              </div>
            </div>
          </section>

          <UseCases />

          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold text-center mb-12">
                Stay Motivated with Gamification
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Streak Tracking",
                    description:
                      "Build consistent study habits by maintaining your daily streaks",
                  },
                  {
                    title: "Leaderboard",
                    description: "Compete with peers and climb the rankings",
                  },
                  {
                    title: "Achievements",
                    description:
                      "Earn badges and celebrate your academic milestones",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="p-6 rounded-lg bg-card shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <FAQ />

          <section className="py-10">
            <div className="container mx-auto px-6">
              <InstitutionBanner />
            </div>
          </section>

          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                  🚀 Have an idea for MindGrove?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join our beta group or request a feature
                </p>
              </div>
              <FeedbackSection />
            </div>
          </section>

          <footer className="bg-muted/50 py-10">
            <div className="container mx-auto px-6 text-center text-muted-foreground">
              <p>
                &copy; {new Date().getFullYear()} MindGrove. All rights
                reserved.
              </p>
              <p>
                <a href="/terms" className="hover:underline">
                  Terms of Service
                </a>{" "}
                |{" "}
                <a href="/privacy" className="hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </footer>
        </main>
      </PageTransition>
    </div>
  );
};

export default LandingPage;
