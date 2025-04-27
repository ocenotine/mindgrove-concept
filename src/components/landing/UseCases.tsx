
import { Book, Users, GraduationCap, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const UseCases = () => {
  const cases = [
    {
      icon: GraduationCap,
      title: "Students",
      description: "Study smarter with AI-generated summaries and flashcards"
    },
    {
      icon: Book,
      title: "Researchers",
      description: "Digest lengthy papers faster with AI-powered research assistants"
    },
    {
      icon: Users,
      title: "Educators",
      description: "Help students reinforce key concepts with personalized AI-driven content"
    },
    {
      icon: Brain,
      title: "Self-learners",
      description: "Build consistent study habits with goal-driven gamification"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Who Uses MindGrove?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cases.map((item, index) => (
            <motion.div
              key={item.title}
              className="p-6 rounded-lg bg-card shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 text-primary">
                <item.icon size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
