import { useEffect, useState } from 'react';
import { initMixpanel } from './mixpanel.config';

export const useInitMixpanel = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      initMixpanel();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Mixpanel:', error);
    }
  }, []);

  return isInitialized;
};