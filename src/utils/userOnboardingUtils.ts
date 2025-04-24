
/**
 * Handles functions related to user onboarding, tour, and feature discovery
 */

// Keys for localStorage
const FIRST_VISIT_KEY = 'mindgrove-first-visit';
const NEW_ACCOUNT_KEY = 'mindgrove-new-account';
const TOUR_COMPLETED_KEY = 'mindgrove-tour-completed';

/**
 * Marks that this is the user's first visit
 */
export const markFirstVisit = (): void => {
  if (!localStorage.getItem(FIRST_VISIT_KEY)) {
    localStorage.setItem(FIRST_VISIT_KEY, Date.now().toString());
  }
};

/**
 * Checks if this is the user's first visit
 */
export const isFirstVisit = (): boolean => {
  return !localStorage.getItem(FIRST_VISIT_KEY);
};

/**
 * Marks that a new account was created
 */
export const markNewAccount = (): void => {
  if (!localStorage.getItem(NEW_ACCOUNT_KEY)) {
    localStorage.setItem(NEW_ACCOUNT_KEY, Date.now().toString());
  }
};

/**
 * Checks if this is a newly created account
 */
export const isNewAccount = (): boolean => {
  const tourCompletedStr = localStorage.getItem(TOUR_COMPLETED_KEY);
  if (tourCompletedStr) return false;
  
  const newAccountStr = localStorage.getItem(NEW_ACCOUNT_KEY);
  if (!newAccountStr) return false;
  
  // Consider new account status valid for 7 days
  const newAccountTime = parseInt(newAccountStr, 10);
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - newAccountTime < ONE_WEEK;
};

/**
 * Marks the tour as completed
 */
export const markTourComplete = (): void => {
  localStorage.setItem(TOUR_COMPLETED_KEY, Date.now().toString());
};

/**
 * Checks if the tour has been completed
 */
export const isTourCompleted = (): boolean => {
  return !!localStorage.getItem(TOUR_COMPLETED_KEY);
};

/**
 * Resets onboarding state (for testing purposes)
 */
export const resetOnboardingState = (): void => {
  localStorage.removeItem(FIRST_VISIT_KEY);
  localStorage.removeItem(NEW_ACCOUNT_KEY);
  localStorage.removeItem(TOUR_COMPLETED_KEY);
};

/**
 * Gets the number of days since first visit
 */
export const daysSinceFirstVisit = (): number => {
  const firstVisitStr = localStorage.getItem(FIRST_VISIT_KEY);
  if (!firstVisitStr) return 0;
  
  const firstVisit = parseInt(firstVisitStr, 10);
  const ONE_DAY = 24 * 60 * 60 * 1000;
  return Math.floor((Date.now() - firstVisit) / ONE_DAY);
};

/**
 * Shows a feature tip if it hasn't been dismissed
 */
export const shouldShowFeatureTip = (featureKey: string): boolean => {
  return !localStorage.getItem(`mindgrove-feature-${featureKey}-dismissed`);
};

/**
 * Dismisses a feature tip
 */
export const dismissFeatureTip = (featureKey: string): void => {
  localStorage.setItem(`mindgrove-feature-${featureKey}-dismissed`, 'true');
};
