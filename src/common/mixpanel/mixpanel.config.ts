import mixpanel from 'mixpanel-browser';

let isInitialized = false;

// Debug helper (only runs in development)
const debug = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Mixpanel Debug] ${message}`, data || '');
  }
};

// Initialize Mixpanel
export const initMixpanel = () => {
  debug('Initializing Mixpanel...');
  debug('Environment variables:', {
    // token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ? 'Present' : 'Missing',
    token: '468d006c6e3d1c7cfc1f7592b1a8b236',
    // enabled: process.env.NEXT_PUBLIC_MIXPANEL_ENABLED,
    enable: true,
    nodeEnv: process.env.NODE_ENV,
  });

  if (isInitialized) {
    debug('Already initialized');
    return true;
  }

  // const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  const MIXPANEL_TOKEN = '468d006c6e3d1c7cfc1f7592b1a8b236';
  // const MIXPANEL_ENABLED = process.env.NEXT_PUBLIC_MIXPANEL_ENABLED !== 'false';
  const MIXPANEL_ENABLED = true;

  if (!MIXPANEL_TOKEN || !MIXPANEL_ENABLED) {
    debug('Initialization failed - missing token or disabled');
    return false;
  }

  try {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: true,
      track_pageview: true,
      persistence: 'localStorage',
    });
    debug('Successfully initialized');
    isInitialized = true;
    return true;
  } catch (e) {
    debug('Initialization error', e);
    return false;
  }
};

// Track event
export const track = (eventName: string, properties?: Record<string, any>) => {
  debug(`Attempting to track event: ${eventName}`, properties);

  if (!isInitialized) {
    debug('Not initialized, attempting initialization');
    if (!initMixpanel()) {
      debug('Failed to initialize, event not tracked');
      return;
    }
  }

  // const MIXPANEL_ENABLED = process.env.NEXT_PUBLIC_MIXPANEL_ENABLED !== 'false';
  const MIXPANEL_ENABLED = true;
  if (!MIXPANEL_ENABLED) return;

  try {
    mixpanel.track(eventName, properties);
    debug('Event tracked successfully');
  } catch (e) {
    debug('Error tracking event', e);
  }
};

// Identify user
export const identify = (userId: string, properties?: Record<string, any>) => {
  if (!isInitialized) {
    console.warn('Mixpanel not initialized, initializing now...');
    if (!initMixpanel()) {
      console.error(
        'Failed to initialize Mixpanel, user not identified:',
        userId
      );
      return;
    }
  }

  // const MIXPANEL_ENABLED = process.env.NEXT_PUBLIC_MIXPANEL_ENABLED !== 'false';
  const MIXPANEL_ENABLED = true;
  if (!MIXPANEL_ENABLED) return;

  try {
    mixpanel.identify(userId);
    if (properties) {
      mixpanel.people.set(properties);
    }
    console.log('Mixpanel user identified:', userId, properties);
  } catch (e) {
    console.error('Error identifying user:', e);
  }
};

// Reset user
export const reset = () => {
  // const MIXPANEL_ENABLED = process.env.NEXT_PUBLIC_MIXPANEL_ENABLED !== 'false';
  const MIXPANEL_ENABLED = true;

  if (!MIXPANEL_ENABLED) {
    return;
  }

  try {
    mixpanel.reset();
    console.log('Mixpanel user reset'); // Add logging
  } catch (e) {
    console.error('Error resetting user:', e);
  }
};
