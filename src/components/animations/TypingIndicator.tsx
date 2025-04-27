
import { motion } from 'framer-motion';

export const TypingIndicator = () => {
  return (
    <div className="flex space-x-2 p-2">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-2 h-2 bg-primary/50 rounded-full"
          animate={{
            y: ["0%", "-50%", "0%"],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: dot * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};
