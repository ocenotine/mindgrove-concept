
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmailPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const EmailPreferences = () => {
  const [preferences, setPreferences] = useState<EmailPreference[]>([
    {
      id: 'updates',
      label: 'Product Updates',
      description: 'Receive emails about new features and improvements.',
      enabled: true
    },
    {
      id: 'newsletters',
      label: 'Newsletters',
      description: 'Receive our monthly newsletter with tips and resources.',
      enabled: false
    },
    {
      id: 'tips',
      label: 'Tips & Tutorials',
      description: 'Receive emails with tips for getting the most out of MindGrove.',
      enabled: true
    },
    {
      id: 'summaries',
      label: 'Weekly Summaries',
      description: 'Get a weekly summary of your activity on MindGrove.',
      enabled: false
    }
  ]);
  
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (id: string) => {
    setPreferences(preferences.map(pref => 
      pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
    ));
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Preferences updated',
        description: 'Your email preferences have been saved successfully.',
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {preferences.map((preference) => (
        <div key={preference.id} className="flex items-center justify-between">
          <div>
            <Label htmlFor={preference.id} className="font-medium">{preference.label}</Label>
            <p className="text-sm text-muted-foreground">
              {preference.description}
            </p>
          </div>
          <Switch
            id={preference.id}
            checked={preference.enabled}
            onCheckedChange={() => handleToggle(preference.id)}
          />
        </div>
      ))}
      
      <motion.button
        onClick={handleSave}
        className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 flex items-center justify-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </>
        )}
      </motion.button>
    </div>
  );
};

export default EmailPreferences;
