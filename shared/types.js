// @flow
/*

  The purpose of this is file is to share flowtypes of our database records across
  API and our workers. When type checking results directly from a database query,
  attempt to use or update the types here

*/

export type DBChannel = {
  communityId: string,
  createdAt: Date,
  deletedAt?: Date,
  description: string,
  id: string,
  isDefault: boolean,
  isPrivate: boolean,
  name: string,
  slug: string,
  archivedAt?: Date,
};

export type DBCommunity = {
  coverPhoto: string,
  createdAt: Date,
  description: string,
  id: string,
  name: string,
  profilePhoto: string,
  slug: string,
  website?: ?string,
  deletedAt?: Date,
  pinnedThreadId?: string,
  watercoolerId?: string,
  creatorId: string,
  administratorEmail: ?string,
  hasAnalytics: boolean,
  hasPrioritySupport: boolean,
  stripeCustomerId: ?string,
  pendingAdministratorEmail?: string,
  ossVerified?: boolean,
};

export type DBCommunitySettings = {
  id: string,
  communityId: string,
  brandedLogin: ?{
    customMessage: ?string,
  },
  slackSettings: ?{
    connectedAt: ?string,
    connectedBy: ?string,
    invitesSentAt: ?string,
    teamName: ?string,
    teamId: ?string,
    scope: ?string,
    token: ?string,
    invitesMemberCount: ?string,
    invitesCustomMessage: ?string,
  },
};

export type DBChannelSettings = {
  id: string,
  channelId: string,
  joinSettings?: {
    tokenJoinEnabled: boolean,
    token: string,
  },
  slackSettings?: {
    botLinks: {
      threadCreated: ?string,
    },
  },
};

export type DBCuratedContent = {
  type: string,
  id: string,
  data: any,
};

export type DBDirectMessageThread = {
  createdAt: Date,
  id: string,
  name?: string,
  threadLastActive: Date,
};

export type DBInvoice = {
  amount: number,
  chargeId: string,
  communityId?: string,
  customerId: string,
  id: string,
  paidAt: Date,
  planId: 'beta-pro' | 'community-standard',
  planName: string,
  quantity: number,
  sourceBrand: string,
  sourceLast4: string,
  status: string,
  subscriptionId: string,
  userId: string,
};

export type DBMessage = {
  content: {
    body: string,
  },
  id: string,
  messageType: 'text' | 'media' | 'draftjs',
  senderId: string,
  deletedAt?: Date,
  threadId: string,
  threadType: 'story' | 'directMessageThread',
  timestamp: Date,
  parentId?: string,
};

export type NotificationPayloadType =
  | 'REACTION'
  | 'MESSAGE'
  | 'THREAD'
  | 'CHANNEL'
  | 'COMMUNITY'
  | 'USER'
  | 'DIRECT_MESSAGE_THREAD';

export type NotificationEventType =
  | 'REACTION_CREATED'
  | 'MESSAGE_CREATED'
  | 'THREAD_CREATED'
  | 'THREAD_EDITED'
  | 'CHANNEL_CREATED'
  | 'DIRECT_MESSAGE_THREAD_CREATED'
  | 'USER_JOINED_COMMUNITY'
  | 'USER_REQUESTED_TO_JOIN_PRIVATE_CHANNEL'
  | 'USER_APPROVED_TO_JOIN_PRIVATE_CHANNEL'
  | 'THREAD_LOCKED_BY_OWNER'
  | 'THREAD_DELETED_BY_OWNER'
  | 'COMMUNITY_INVITATION';

type NotificationPayload = {
  id: string,
  payload: string,
  type: NotificationPayloadType,
};
export type DBNotification = {
  id: string,
  actors: Array<NotificationPayload>,
  context: NotificationPayload,
  createdAt: Date,
  entities: Array<NotificationPayload>,
  event: NotificationEventType,
  modifiedAt: Date,
};

type ReactionType = 'like';
export type DBReaction = {
  id: string,
  messageId: string,
  timestamp: Date,
  type: ReactionType,
  userId: string,
};

export type DBRecurringPayment = {
  id: string,
  amount: number,
  canceledAt?: Date,
  createdAt: Date,
  currentPeriodEnd: Date,
  currentPeriodStart: Date,
  customerId: string,
  planId: 'beta-pro' | 'community-standard',
  planName: string,
  quantity: number,
  sourceBrand: string,
  sourceLast4: string,
  status: 'active' | 'canceled',
  subscriptionId: string,
  userId: string,
  communityId?: string,
};

export type DBReputationEvent = {
  communityId: string,
  id: string,
  score: number,
  timestamp: Date,
  type: string,
  userId: string,
};

export type DBSlackUser = {
  email: string,
  firstName: string,
  lastName: string,
};
export type DBSlackImport = {
  id: string,
  communityId: string,
  members?: Array<DBSlackUser>,
  senderId?: string,
  teamId: string,
  teamName: string,
  token: string,
};

type DBThreadAttachment = {
  attachmentType: 'photoPreview',
  data: {
    name: string,
    type: string,
    url: string,
  },
};

type DBThreadEdits = {
  attachment?: {
    photos: Array<DBThreadAttachment>,
  },
  content: {
    body?: any,
    title: string,
  },
  timestamp: Date,
};

export type DBThread = {
  id: string,
  channelId: string,
  communityId: string,
  content: {
    body?: any,
    title: string,
  },
  createdAt: Date,
  creatorId: string,
  isPublished: boolean,
  isLocked: boolean,
  lockedBy?: string,
  lockedAt?: Date,
  lastActive: Date,
  modifiedAt?: Date,
  attachments?: Array<DBThreadAttachment>,
  edits?: Array<DBThreadEdits>,
  watercooler?: boolean,
  type: string,
};

export type DBUser = {
  id: string,
  email?: string,
  createdAt: string,
  name: string,
  coverPhoto: string,
  profilePhoto: string,
  providerId?: ?string,
  githubProviderId?: ?string,
  githubUsername?: ?string,
  fbProviderId?: ?string,
  googleProviderId?: ?string,
  username: ?string,
  timezone?: ?number,
  isOnline?: boolean,
  lastSeen?: ?string,
  description?: ?string,
  website?: ?string,
  modifiedAt: ?string,
};

export type DBUsersChannels = {
  id: string,
  channelId: string,
  createdAt: Date,
  isBlocked: boolean,
  isMember: boolean,
  isModerator: boolean,
  isOwner: boolean,
  isPending: boolean,
  receiveNotifications: boolean,
  userId: string,
};

export type DBUsersCommunities = {
  id: string,
  communityId: string,
  createdAt: Date,
  isBlocked: boolean,
  isMember: boolean,
  isModerator: boolean,
  isOwner: boolean,
  receiveNotifications: boolean,
  reputation: number,
  userId: string,
};

export type DBUsersDirectMessageThreads = {
  id: string,
  createdAt: Date,
  lastActive?: Date,
  lastSeen?: Date,
  receiveNotifications: boolean,
  threadId: string,
  userId: string,
};

export type DBUsersNotifications = {
  id: string,
  createdAt: Date,
  entityAddedAt: Date,
  isRead: boolean,
  isSeen: boolean,
  notificationId: string,
  userId: string,
};

export type DBNotificationsJoin = {
  ...$Exact<DBUsersNotifications>,
  ...$Exact<DBNotification>,
};

type NotificationSetting = { email: boolean };
export type DBUsersSettings = {
  id: string,
  userId: string,
  notifications: {
    types: {
      dailyDigest: NotificationSetting,
      newDirectMessage: NotificationSetting,
      newMessageInThreads: NotificationSetting,
      newThreadCreated: NotificationSetting,
      weeklyDigest: NotificationSetting,
      newMention: NotificationSetting,
    },
  },
};

export type DBUsersThreads = {
  id: string,
  createdAt: Date,
  isParticipant: boolean,
  receiveNotifications: boolean,
  threadId: string,
  userId: string,
  lastSeen?: Date | number,
};

export type SearchThread = {
  channelId: string,
  communityId: string,
  creatorId: string,
  lastActive: number,
  messageContent: {
    body: ?string,
  },
  threadContent: {
    title: string,
    body: ?string,
  },
  createdAt: number,
  threadId: string,
  objectID: string,
};

export type SearchUser = {
  description: ?string,
  name: string,
  username: ?string,
  website: ?string,
  objectID: string,
};

export type SearchCommunity = {
  description: ?string,
  name: string,
  slug: string,
  website: ?string,
  objectID: string,
};

export type DBExpoPushSubscription = {
  id: string,
  token: string,
  userId: string,
};

export type DBStripeCustomer = {
  created: number,
  currency: ?string,
  customerId: string,
  email: string,
  metadata: {
    communityId?: string,
    communityName?: string,
  },
};

export type FileUpload = {
  filename: string,
  mimetype: string,
  encoding: string,
  stream: any,
};

export type EntityTypes = 'communities' | 'channels' | 'users' | 'threads';
