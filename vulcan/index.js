// $FlowFixMe
const debug = require('debug')('vulcan');
const PORT = process.env.PORT || 3007;
import listenForNewThreads from './models/thread';
import createServer from './server';

console.log('\n✉️ Vulcan, the search worker, is starting...');
debug('Logging with debug enabled!');
console.log('');

console.log(
  `🗄 Vulcan open for business ${(process.env.NODE_ENV === 'production' &&
    `at ${process.env.COMPOSE_REDIS_URL}:${process.env.COMPOSE_REDIS_PORT}`) ||
    'locally'}`
);

listenForNewThreads();

const server = createServer();
server.listen(PORT, 'localhost', () => {
  console.log(
    `💉 Healthcheck server running at ${server.address()
      .address}:${server.address().port}`
  );
});
