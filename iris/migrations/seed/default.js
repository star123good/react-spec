const { fromPlainText, toJSON } = require('../../../shared/draft-utils');

// 2017/01/01
const DATE = 1483225200000;

const MAX_ID = 'gVk5mYwccUOEKiN5vtOouqroGKo1';
const BRIAN_ID = '01p2A7kDCWUjGj6zQLlMQUOSQL42';
const BRYN_ID = 'VToKcde16dREgDkXcDl3hhcrFN33';

const DEFAULT_USERS = [
  {
    id: MAX_ID,
    name: 'Max Stoiber',
    description:
      'Makes styled-components, react-boilerplate and micro-analytics 💅 Speciality coffee geek, skier, traveller ☕',
    website: 'https://mxstbr.com',
    username: 'mxstbr',
    profilePhoto: 'https://img.gs/jztmrqvgzv/500/mxstbr.com/headshot.jpeg',
    coverPhoto:
      'https://pbs.twimg.com/profile_banners/2451223458/1479507323/1500x500',
    email: 'contact@mxstbr.com',
    subscriptions: [],
    providerId: '2451223458',
    createdAt: new Date(DATE),
    lastSeen: new Date(DATE),
  },
  {
    id: BRIAN_ID,
    name: 'Brian Lovin',
    description: 'Chief Nice Boy™',
    website: 'https://brianlovin.com',
    username: 'brian',
    profilePhoto:
      'https://pbs.twimg.com/profile_images/570313913648955392/cf4tgX7M_bigger.jpeg',
    coverPhoto:
      'https://pbs.twimg.com/profile_banners/465068802/1490051733/1500x500',
    email: 'briandlovin@gmail.com',
    subscriptions: [],
    providerId: '465068802',
    createdAt: new Date(DATE),
    lastSeen: new Date(DATE),
  },
  {
    id: BRYN_ID,
    name: 'Bryn Jackson',
    description: 'full-stack flapjack',
    website: 'https://bryn.io',
    username: 'bryn',
    profilePhoto:
      'https://pbs.twimg.com/profile_images/848823167699230721/-9CbPtto_bigger.jpg',
    coverPhoto:
      'https://pbs.twimg.com/profile_banners/17106008/1491444958/1500x500',
    email: 'hi@bryn.io',
    subscriptions: [],
    providerId: '17106008',
    createdAt: new Date(DATE),
    lastSeen: new Date(DATE),
  },
];

const DEFAULT_COMMUNITIES = [
  {
    id: 'ce2b4488-4c75-47e0-8ebc-2539c1e6a191',
    createdAt: new Date(DATE),
    name: 'Spectrum',
    description: 'The future of communities',
    website: 'https://spectrum.chat',
    profilePhoto:
      'https://spectrum.imgix.net/communities/-Kh6RfPYjmSaIWbkck8i/Twitter Profile.png.0.6225566835336693',
    coverPhoto:
      'https://spectrum.imgix.net/communities/-Kh6RfPYjmSaIWbkck8i/Twitter Header.png.0.3303118636071434',
    slug: 'spectrum',
  },
];

const DEFAULT_CHANNELS = [
  {
    id: 'ce2b4488-4c75-47e0-8ebc-2539c1e6a192',
    communityId: 'ce2b4488-4c75-47e0-8ebc-2539c1e6a191',
    createdAt: new Date(DATE),
    name: 'General',
    description: 'General chatter',
    slug: 'general',
    isPrivate: false,
    isDefault: true,
  },
];

const DEFAULT_THREADS = [
  {
    id: 'ce2b4488-4c75-47e0-8ebc-2539c1e6a193',
    createdAt: new Date(DATE),
    creatorId: BRIAN_ID,
    channelId: 'ce2b4488-4c75-47e0-8ebc-2539c1e6a192',
    communityId: 'ce2b4488-4c75-47e0-8ebc-2539c1e6a191',
    isPublished: true,
    isLocked: false,
    type: 'DRAFTJS',
    content: {
      title: 'The first thread! 🎉',
      body: JSON.stringify(
        toJSON(fromPlainText('This is it, we got a thread here'))
      ),
    },
    attachments: [],
    edits: [
      {
        timestamp: new Date(DATE),
        content: {
          title: 'The first thread! 🎉',
          body: JSON.stringify(
            toJSON(fromPlainText('This is it, we got a thread here'))
          ),
        },
      },
    ],
    modifiedAt: new Date(DATE),
    lastActive: new Date(DATE),
  },
  {
    id: '11e736b3-5464-4bab-acfd-bbd42cddc1dd',
    createdAt: new Date(DATE + 1),
    creatorId: MAX_ID,
    channelId: 'ce2b4488-4c75-47e0-8ebc-2539c1e6a192',
    communityId: 'ce2b4488-4c75-47e0-8ebc-2539c1e6a191',
    isPublished: true,
    isLocked: false,
    type: 'DRAFTJS',
    content: {
      title: 'Another thread',
      body: JSON.stringify(
        toJSON(fromPlainText('This is just another thread'))
      ),
    },
    attachments: [],
    edits: [
      {
        timestamp: new Date(DATE + 1),
        content: {
          title: 'Another thread',
          body: JSON.stringify(
            toJSON(fromPlainText('This is just another thread'))
          ),
        },
      },
    ],
    modifiedAt: new Date(DATE + 1),
    lastActive: new Date(DATE + 1),
  },
  {
    id: 'f2eb9d3d-ed05-49ae-8fc9-91d02314d5a9',
    createdAt: new Date(DATE + 2),
    creatorId: BRYN_ID,
    channelId: 'ce2b4488-4c75-47e0-8ebc-2539c1e6a192',
    communityId: 'ce2b4488-4c75-47e0-8ebc-2539c1e6a191',
    isPublished: true,
    isLocked: false,
    type: 'DRAFTJS',
    content: {
      title: 'Yet another thread',
      body: JSON.stringify(
        toJSON(fromPlainText('This is just another thread'))
      ),
    },
    attachments: [],
    edits: [
      {
        timestamp: new Date(DATE + 2),
        content: {
          title: 'Yet another thread',
          body: JSON.stringify(
            toJSON(fromPlainText('This is just another thread'))
          ),
        },
      },
    ],
    modifiedAt: new Date(DATE + 2),
    lastActive: new Date(DATE + 2),
  },
];

const DEFAULT_DIRECT_MESSAGE_THREADS = [
  {
    id: 'first-dm-thread-asfd123',
    createdAt: new Date(DATE),
    name: null,
    threadLastActive: new Date(),
  },
];

const DEFAULT_USERS_DIRECT_MESSAGE_THREADS = [
  {
    createdAt: new Date(DATE),
    userId: '01p2A7kDCWUjGj6zQLlMQUOSQL42',
    threadId: 'ce2b4488-4c75-47e0-8ebc-2539c1e6a191',
    lastActive: new Date(DATE),
    lastSeen: new Date(DATE),
    receiveNotifications: true,
  },
];

const DEFAULT_USERS_COMMUNITIES = [
  {
    createdAt: new Date(DATE),
    userId: '01p2A7kDCWUjGj6zQLlMQUOSQL42',
    communityId: 'ce2b4488-4c75-47e0-8ebc-2539c1e6a191',
    isOwner: true,
    isModerator: false,
    isMember: true,
    isBlocked: false,
    receiveNotifications: true,
    reputation: 1,
  },
];

const DEFAULT_USERS_CHANNELS = [
  {
    createdAt: new Date(DATE),
    userId: '01p2A7kDCWUjGj6zQLlMQUOSQL42',
    channelId: 'ce2b4488-4c75-47e0-8ebc-2539c1e6a191',
    isOwner: true,
    isModerator: false,
    isMember: true,
    isBlocked: false,
    isPending: false,
    receiveNotifications: true,
  },
];

const DEFAULT_NOTIFICATIONS = [];

module.exports = {
  DEFAULT_USERS,
  DEFAULT_COMMUNITIES,
  DEFAULT_CHANNELS,
  DEFAULT_THREADS,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_DIRECT_MESSAGE_THREADS,
  DEFAULT_USERS_DIRECT_MESSAGE_THREADS,
  DEFAULT_USERS_COMMUNITIES,
  DEFAULT_USERS_CHANNELS,
};
