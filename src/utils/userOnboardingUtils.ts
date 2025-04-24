
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
