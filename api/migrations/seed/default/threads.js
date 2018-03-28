// @flow
const { fromPlainText, toJSON } = require('../../../../shared/draft-utils');
const constants = require('./constants');
const {
  DATE,
  BRIAN_ID,
  MAX_ID,
  BRYN_ID,
  SPECTRUM_GENERAL_CHANNEL_ID,
  SPECTRUM_PRIVATE_CHANNEL_ID,
  PAYMENTS_GENERAL_CHANNEL_ID,
  PAYMENTS_PRIVATE_CHANNEL_ID,
  SPECTRUM_COMMUNITY_ID,
  PAYMENTS_COMMUNITY_ID,
} = constants;

module.exports = [
  {
    id: 'thread-1',
    createdAt: new Date(DATE),
    creatorId: BRIAN_ID,
    channelId: SPECTRUM_GENERAL_CHANNEL_ID,
    communityId: SPECTRUM_COMMUNITY_ID,
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
    id: 'thread-2',
    createdAt: new Date(DATE + 1),
    creatorId: MAX_ID,
    channelId: SPECTRUM_GENERAL_CHANNEL_ID,
    communityId: SPECTRUM_COMMUNITY_ID,
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
    id: 'thread-3',
    createdAt: new Date(DATE + 2),
    creatorId: BRYN_ID,
    channelId: SPECTRUM_GENERAL_CHANNEL_ID,
    communityId: SPECTRUM_COMMUNITY_ID,
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

  {
    id: 'thread-4',
    createdAt: new Date(DATE),
    creatorId: BRIAN_ID,
    channelId: SPECTRUM_PRIVATE_CHANNEL_ID,
    communityId: SPECTRUM_COMMUNITY_ID,
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
    id: 'thread-5',
    createdAt: new Date(DATE + 1),
    creatorId: MAX_ID,
    channelId: SPECTRUM_PRIVATE_CHANNEL_ID,
    communityId: SPECTRUM_COMMUNITY_ID,
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
    id: 'thread-6',
    createdAt: new Date(DATE + 2),
    creatorId: BRYN_ID,
    channelId: SPECTRUM_PRIVATE_CHANNEL_ID,
    communityId: SPECTRUM_COMMUNITY_ID,
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
