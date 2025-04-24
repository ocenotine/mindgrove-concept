
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import { playNotificationSound } from "@/utils/openRouterUtils";
import { Check, AlertCircle, AlertTriangle, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  // Get the appropriate icon based on toast variant
  const getToastIcon = (variant: string | undefined) => {
    switch (variant) {
      case 'destructive':
        return <AlertCircle className="h-5 w-5 text-white" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <ToastProvider>
      <AnimatePresence>
        {toasts.map(function ({ id, title, description, action, variant, ...props }) {
          // Play notification sound when toast appears
          playNotificationSound();
          
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ 
                opacity: 0, 
                y: -20, 
                scale: 0.9, 
                transition: { duration: 0.2 } 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30 
              }}
              className="relative"
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  duration: props.duration || 5,
                  ease: "linear"
                }}
                className={`absolute bottom-0 left-0 h-[2px] rounded-full ${
                  variant === 'destructive' ? 'bg-red-500/40' : 
                  variant === 'warning' ? 'bg-amber-500/40' : 
                  variant === 'success' ? 'bg-green-500/40' : 
                  'bg-primary/40'
                }`}
              />
              <Toast key={id} {...props} className="group">
                <div className="flex items-start gap-3">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-1.5 rounded-full ${
                      variant === 'destructive' ? 'bg-red-100 text-red-600' : 
                      variant === 'warning' ? 'bg-amber-100 text-amber-600' : 
                      variant === 'success' ? 'bg-green-100 text-green-600' : 
                      'bg-primary/10 text-primary'
                    }`}
                  >
                    {getToastIcon(variant)}
                  </motion.div>
                  <div className="grid gap-1 flex-1">
                    {title && <ToastTitle>{title}</ToastTitle>}
                    {description && (
                      <ToastDescription className="whitespace-pre-wrap">{description}</ToastDescription>
                    )}
                  </div>
                  {action}
                  <ToastClose />
                </div>
              </Toast>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <ToastViewport />
    </ToastProvider>
  );
}
