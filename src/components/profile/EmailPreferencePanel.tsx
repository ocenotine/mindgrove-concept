
import { motion } from 'framer-motion';
import EmailPreferences from '@/components/profile/EmailPreferences';

const EmailPreferencePanel = () => {
  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <h3 className="text-lg font-medium mb-4">Email Preferences</h3>
      <EmailPreferences />
    </div>
  );
};

export default EmailPreferencePanel;
