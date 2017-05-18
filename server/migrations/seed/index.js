// @flow
const faker = require('faker');
const { v4: uuid } = require('uuid');
const {
  DEFAULT_COMMUNITIES,
  DEFAULT_USERS,
  DEFAULT_CHANNELS,
  DEFAULT_THREADS,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_DIRECT_MESSAGE_THREADS,
} = require('./default');

const {
  randomAmount,
  generateUser,
  generateCommunity,
  generateChannel,
  generateThread,
  generateDirectMessageThread,
  generateMessage,
  generateReaction,
  generateThreadNotification,
  generateMessageNotification,
} = require('./generate');

const notifications = DEFAULT_NOTIFICATIONS;
const userAmount = faker.random.number(1000);
const users = [
  ...DEFAULT_USERS,
  ...randomAmount({ max: userAmount, min: 1 }, generateUser),
];

console.log('\nGenerating communities...');
const communities = [
  ...DEFAULT_COMMUNITIES,
  ...randomAmount({ max: 10 }, () => {
    const members = randomAmount(
      { max: users.length - 1, min: 1 },
      i => users[i].id
    );
    return generateCommunity(members);
  }),
];

console.log('Generating channels...');
let channels = DEFAULT_CHANNELS;
communities.forEach(community => {
  randomAmount({ max: 10 }, () => {
    const members = randomAmount(
      { max: community.members.length, min: 1 },
      i => community.members[i]
    );
    channels.push(generateChannel(community.id, members));
  });
});

communities.forEach(community => {
  const members = randomAmount(
    { max: community.members.length, min: 1 },
    i => community.members[i]
  );
  channels.push({
    id: uuid(),
    communityId: community.id,
    createdAt: new Date(),
    modifiedAt: new Date(),
    name: 'General',
    description: 'General chatter',
    slug: 'general',
    members,
    owners: [members[0]],
    isPrivate: false,
    pendingUsers: [],
    blockedUsers: [],
  });
});

console.log('Generating threads...');
let threads = DEFAULT_THREADS;
channels.forEach(channel => {
  if (!channel.members || channel.members.length === 0) return;
  randomAmount({ max: 10 }, () => {
    const creator = faker.random.arrayElement(channel.members);
    const thread = generateThread(channel.community, channel.id, creator);
    threads.push(thread);
    notifications.push(
      generateThreadNotification(thread, channel, channel.community)
    );
  });
});

console.log('Generating direct message threads...');
let directMessageThreads = DEFAULT_DIRECT_MESSAGE_THREADS;
randomAmount({ max: 100 }, () => {
  const thread_users = randomAmount({ max: 5, min: 2 }, i => users[i]);
  directMessageThreads.push(generateDirectMessageThread(thread_users));
});

console.log('Generating messages...');
let messages = [];
threads.forEach(thread => {
  const channel = channels.find(channel => channel.id === thread.channelId);
  const threadMessages = [];
  randomAmount({ max: 10 }, () => {
    const sender = faker.random.arrayElement(channel.members);
    const message = generateMessage(sender, thread.id, 'story');
    messages.push(message);
    threadMessages.push(message);
  });
  // New message notifications
  threadMessages.forEach((message, index) => {
    notifications.push(
      generateMessageNotification(
        threadMessages.slice(0, index).map(message => message.sender),
        message,
        thread,
        channel.id,
        channel.community
      )
    );
  });
});

console.log('Generating direct messages...');
let direct_messages = [];
directMessageThreads.forEach(thread => {
  const threadMessages = [];
  const users = thread.users;
  randomAmount({ max: 100 }, () => {
    const sender = faker.random.arrayElement(users);
    const message = generateMessage(sender, thread.id, 'directMessageThread');
    direct_messages.push(message);
    threadMessages.push(message);
  });
});

console.log('Generating reactions...');
let reactions = [];
messages.map(message => {
  randomAmount({ max: 5 }, () => {
    const user = faker.random.arrayElement(users);
    reactions.push(generateReaction(user.id, message.id));
  });
});

console.log('Connecting to db...');
// $FlowFixMe
const db = require('rethinkdbdash')({
  db: 'spectrum',
});

console.log(
  `Inserting ${users.length} users, ${communities.length} communities, ${channels.length} channels, ${threads.length} threads, ${messages.length + direct_messages.length} messages, ${reactions.length} reactions, ${directMessageThreads.length} direct message threads, and ${notifications.length} notifications into the database... (this might take a while!)`
);
Promise.all([
  db.table('communities').insert(communities).run(),
  db.table('channels').insert(channels).run(),
  db.table('threads').insert(threads).run(),
  db.table('messages').insert(messages).run(),
  db.table('users').insert(users).run(),
  db.table('reactions').insert(reactions).run(),
  db.table('notifications').insert(notifications).run(),
  db.table('directMessageThreads').insert(directMessageThreads).run(),
  db.table('messages').insert(direct_messages).run(),
])
  .then(() => {
    console.log('Finished seeding database! 🎉');
    process.exit();
  })
  .catch(err => {
    console.log(
      'Encountered error while inserting data (see below), please run yarn run db:drop and yarn run db:migrate to restore tables to original condition, then run this script again.'
    );
    console.log(err);
  });
