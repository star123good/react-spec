// @flow
import cors from 'cors';

export default cors({
  origin:
    process.env.NODE_ENV === 'production' && !process.env.FORCE_DEV
      ? [
          'https://spectrum.chat',
          /\.spectrum\.chat$/,
          process.env.NOW_URL,
          'https://zeit.co',
          /(\.|https:\/\/)zeit\.sh$/,
        ].filter(Boolean)
      : [/localhost/],
  credentials: true,
});
