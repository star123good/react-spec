// @flow

const amplitude = window.amplitude;

export const track = (eventType: string, eventProperties?: Object = {}) => {
  const AMPLITUDE_API_KEY =
    process.env.NODE_ENV === 'production'
      ? process.env.AMPLITUDE_API_KEY
      : process.env.AMPLITUDE_API_KEY_DEVELOPMENT;

  if (!AMPLITUDE_API_KEY) {
    console.warn(`[Amplitude Dev] Tracking ${eventType}`);
    return;
  }

  const amplitudePromise = () => {
    console.warn(`[Amplitude] Tracking ${eventType}`);
    return amplitude.getInstance().logEvent(eventType, {
      ...eventProperties,
      client: 'web',
    });
  };

  return Promise.all([amplitudePromise()]);
};
