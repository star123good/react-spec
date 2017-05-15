const faker = require('faker');
const { v4: uuid } = require('uuid');
const {
  DEFAULT_COMMUNITIES,
  DEFAULT_USERS,
  DEFAULT_FREQUENCIES,
  DEFAULT_STORIES,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_DIRECT_MESSAGE_GROUPS,
} = require('./default');

const {
  randomAmount,
  generateUser,
  generateCommunity,
  generateFrequency,
  generateStory,
  generateDirectMessageGroup,
  generateMessage,
  generateReaction,
  generateStoryNotification,
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
      i => users[i].uid
    );
    return generateCommunity(members);
  }),
];

console.log('Generating frequencies...');
let frequencies = DEFAULT_FREQUENCIES;
communities.forEach(community => {
  randomAmount({ max: 10 }, () => {
    const subscribers = randomAmount(
      { max: community.members.length, min: 1 },
      i => community.members[i]
    );
    frequencies.push(generateFrequency(community.id, subscribers));
  });
});

communities.forEach(community => {
  const subscribers = randomAmount(
    { max: community.members.length, min: 1 },
    i => community.members[i]
  );
  frequencies.push({
    id: uuid(),
    community: community.id,
    createdAt: new Date(),
    modifiedAt: new Date(),
    name: 'General',
    description: 'General chatter',
    slug: 'general',
    subscribers,
    owners: [subscribers[0]],
    isPrivate: false,
    pendingUsers: [],
    blockedUsers: [],
  });
});

console.log('Generating stories...');
let stories = DEFAULT_STORIES;
frequencies.forEach(frequency => {
  if (!frequency.subscribers || frequency.subscribers.length === 0) return;
  randomAmount({ max: 10 }, () => {
    const author = faker.random.arrayElement(frequency.subscribers);
    const story = generateStory(frequency.community, frequency.id, author);
    stories.push(story);
    notifications.push(
      generateStoryNotification(story, frequency, frequency.community)
    );
  });
});

console.log('Generating direct message groups...');
let direct_message_groups = DEFAULT_DIRECT_MESSAGE_GROUPS;
randomAmount({ max: 100 }, () => {
  const group_users = randomAmount({ max: 5, min: 2 }, i => users[i]);
  direct_message_groups.push(generateDirectMessageGroup(group_users));
});

console.log('Generating messages...');
let messages = [];
stories.forEach(story => {
  const frequency = frequencies.find(
    frequency => frequency.id === story.frequency
  );
  const storyMessages = [];
  randomAmount({ max: 10 }, () => {
    const sender = faker.random.arrayElement(frequency.subscribers);
    const message = generateMessage(sender, story.id);
    messages.push(message);
    storyMessages.push(message);
  });
  // New message notifications
  storyMessages.forEach((message, index) => {
    notifications.push(
      generateMessageNotification(
        storyMessages.slice(0, index).map(message => message.sender),
        message,
        story,
        frequency.id,
        frequency.community
      )
    );
  });
});

console.log('Generating direct messages...');
let direct_messages = [];
direct_message_groups.forEach(group => {
  const groupMessages = [];
  const users = group.users;
  randomAmount({ max: 100 }, () => {
    const sender = faker.random.arrayElement(users);
    const message = generateMessage(sender, group.id);
    direct_messages.push(message);
    groupMessages.push(message);
  });
});

console.log('Generating reactions...');
let reactions = [];
messages.map(message => {
  randomAmount({ max: 5 }, () => {
    const user = faker.random.arrayElement(users);
    reactions.push(generateReaction(user.uid, message.id));
  });
});

console.log('Connecting to db...');
const db = require('rethinkdbdash')({
  db: 'spectrum',
});

console.log(
  `Inserting ${users.length} users, ${communities.length} communities, ${frequencies.length} frequencies, ${stories.length} stories, ${messages.length + direct_messages.length} messages, ${reactions.length} reactions, ${direct_message_groups.length} direct message groups, and ${notifications.length} notifications into the database... (this might take a while!)`
);
Promise.all([
  db.table('communities').insert(communities).run(),
  db.table('frequencies').insert(frequencies).run(),
  db.table('stories').insert(stories).run(),
  db.table('messages').insert(messages).run(),
  db.table('users').insert(users).run(),
  db.table('reactions').insert(reactions).run(),
  db.table('notifications').insert(notifications).run(),
  db.table('direct_message_groups').insert(direct_message_groups).run(),
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
