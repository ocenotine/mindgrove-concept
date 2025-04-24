
/**
 * Mark a new user account for onboarding tour
 */
export const markNewAccount = () => {
  localStorage.setItem('mindgrove_new_account', 'true');
};

/**
 * Check if the user has completed the onboarding tour
 */
export const hasCompletedTour = (): boolean => {
  return localStorage.getItem('mindgrove_tour_completed') === 'true';
};

/**
 * Check if this is a new account that should see the tour
 */
export const isNewAccount = (): boolean => {
  return localStorage.getItem('mindgrove_new_account') === 'true';
};

/**
 * Mark the tour as completed
 */
export const markTourCompleted = () => {
  localStorage.setItem('mindgrove_tour_completed', 'true');
};

/**
 * Clear the new account flag
 */
export const clearNewAccountFlag = () => {
  localStorage.removeItem('mindgrove_new_account');
};

/**
 * Check if the app can be installed as PWA
 */
export const checkPwaInstallable = (): boolean => {
  // Return true if the app is not in standalone mode and meets PWA criteria
  return window.matchMedia('(display-mode: browser)').matches && 
         'serviceWorker' in navigator && 
         'BeforeInstallPromptEvent' in window;
};

/**
 * Mark first time visitor status
 */
export const markFirstVisit = () => {
  if (!localStorage.getItem('mindgrove_first_visit')) {
    localStorage.setItem('mindgrove_first_visit', Date.now().toString());
  }
};

/**
 * Check if user is a returning visitor 
 */
export const isReturningUser = (): boolean => {
  return !!localStorage.getItem('mindgrove_first_visit');
};

/**
 * Show tour again (for testing/debugging)
 */
export const resetTour = () => {
  localStorage.removeItem('mindgrove_tour_completed');
  localStorage.setItem('mindgrove_new_account', 'true');
};

/**
 * Track onboarding step completion
 */
export const trackOnboardingStep = (stepName: string) => {
  const completedSteps = getCompletedOnboardingSteps();
  if (!completedSteps.includes(stepName)) {
    completedSteps.push(stepName);
    localStorage.setItem('mindgrove_onboarding_steps', JSON.stringify(completedSteps));
  }
};

/**
 * Get array of completed onboarding steps
 */
export const getCompletedOnboardingSteps = (): string[] => {
  const steps = localStorage.getItem('mindgrove_onboarding_steps');
  return steps ? JSON.parse(steps) : [];
};

/**
 * Clear onboarding progress
 */
export const clearOnboardingProgress = () => {
  localStorage.removeItem('mindgrove_onboarding_steps');
};

/**
 * Check if a specific onboarding step has been completed
 */
export const hasCompletedStep = (stepName: string): boolean => {
  return getCompletedOnboardingSteps().includes(stepName);
};

/**
 * Save user preferences for tour display
 */
export const setTourPreferences = (preferences: { showOnLogin: boolean }) => {
  localStorage.setItem('mindgrove_tour_preferences', JSON.stringify(preferences));
};

/**
 * Get saved tour preferences
 */
export const getTourPreferences = () => {
  const prefs = localStorage.getItem('mindgrove_tour_preferences');
  return prefs ? JSON.parse(prefs) : { showOnLogin: true };
};
