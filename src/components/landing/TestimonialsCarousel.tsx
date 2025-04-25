
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  image?: string;
  quote: string;
  rating: number; // 1-5
  location?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Juruaa Sebastian",
    role: "Software engineering student",
    quote: "MindGrove has revolutionized my research workflow. I can process academic papers in minutes instead of hours, with summaries that capture all the key points.",
    rating: 5,
    location: "Uganda"
  },
  {
    name: "Asiime Blessing",
    role: "Software engineering student",
    quote: "The flashcard feature is incredible! It helped me with my tests by automatically identifying key concepts and creating effective study materials.",
    rating: 5,
    location: "Uganda"
  },
  {
    name: "Nimungu saviour Jude",
    role: "Electronics engineering student",
    quote: "I recommend MindGrove to all students. The AI-powered summaries help them grasp complex topics faster and engage more meaningfully in class discussions.",
    rating: 5,
    location: "Uganda"
  },
  {
    name: "Abaasa",
    role: "Software engineering student",
    quote: "The document chat feature feels like having a personal tutor for every paper I read. It's transformed how I absorb complex topics.",
    rating: 5,
    location: "Uganda"
  }
];

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2 border-primary">
            <AvatarImage src={testimonial.image} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {testimonial.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          </div>
        </div>
        
        <div className="flex mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              size={16} 
              className={i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"} 
            />
          ))}
        </div>
        
        <blockquote className="text-lg flex-1 relative">
          <span className="text-4xl font-serif text-primary/10 absolute -top-2 -left-1">"</span>
          <p className="relative z-10 italic">{testimonial.quote}</p>
          <span className="text-4xl font-serif text-primary/10 absolute bottom-0 right-0">"</span>
        </blockquote>
        
        {testimonial.location && (
          <div className="mt-4 text-right text-sm text-muted-foreground">
            {testimonial.location}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TestimonialsCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  
  // Auto-scroll functionality
  useEffect(() => {
    if (autoplayPaused) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => 
        current === testimonials.length - 1 ? 0 : current + 1
      );
    }, 6000);
    
    return () => clearInterval(interval);
  }, [autoplayPaused]);
  
  return (
    <div 
      className="relative max-w-5xl mx-auto px-4 py-8"
      onMouseEnter={() => setAutoplayPaused(true)}
      onMouseLeave={() => setAutoplayPaused(false)}
    >
      <Carousel 
        className="w-full"
        setApi={(api) => {
          if (api) {
            api.on("select", () => {
              // Update active index when carousel changes
              const selectedIndex = api.selectedScrollSnap();
              setActiveIndex(selectedIndex);
            });
          }
        }}
      >
        <CarouselContent>
          {testimonials.map((testimonial, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 h-[320px]">
              <TestimonialCard testimonial={testimonial} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 bg-background/80 backdrop-blur-sm" />
        <CarouselNext className="right-0 bg-background/80 backdrop-blur-sm" />
      </Carousel>
      
      {/* Pagination dots */}
      <div className="flex justify-center space-x-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              activeIndex === index
                ? 'bg-primary w-6'
                : 'bg-primary/30'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
