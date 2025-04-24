
import { motion } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  height?: number;
  width?: string | number;
  rounded?: string;
  shimmer?: boolean;
}

export const SkeletonLoader = ({ 
  className, 
  count = 1, 
  height = 20, 
  width = "100%", 
  rounded = "md",
  shimmer = false // Default to false to remove shimmer
}: SkeletonLoaderProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="relative overflow-hidden">
          <Skeleton 
            className={cn(`h-${height} rounded-${rounded}`)}
            style={{ width }}
          />
          
          {shimmer && (
            <motion.div
              className="absolute inset-0 w-full h-full"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
                zIndex: 1
              }}
              animate={{
                x: ["calc(-100%)", "calc(100%)"]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export const FlashcardSkeleton = () => {
  return (
    <div className="w-full max-w-lg mx-auto h-64 rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 to-primary/20 p-6 relative overflow-hidden">
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-2 w-full">
          <SkeletonLoader height={6} width="60%" rounded="sm" />
          <SkeletonLoader height={4} width="85%" rounded="sm" />
          <SkeletonLoader height={4} width="40%" rounded="sm" />
        </div>
        <div className="flex justify-center">
          <SkeletonLoader height={10} width={120} rounded="full" />
        </div>
      </div>
    </div>
  );
};

export const FlashcardDeckSkeleton = () => {
  return (
    <div className="space-y-8">
      <FlashcardSkeleton />
      
      <div className="flex justify-between items-center mt-8">
        <SkeletonLoader height={4} width={60} rounded="sm" />
        
        <div className="flex gap-2">
          <SkeletonLoader height={10} width={40} rounded="md" />
          <SkeletonLoader height={10} width={40} rounded="md" />
          <SkeletonLoader height={10} width={40} rounded="md" />
        </div>
      </div>
    </div>
  );
};
