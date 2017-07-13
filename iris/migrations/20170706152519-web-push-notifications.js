'use strict';

exports.up = function(r, conn) {
  return r
    .tableCreate('webPushSubscriptions')
    .run(conn)
    .catch(err => {
      throw new Error(err);
    })
    .then(() => r.table('webPushSubscriptions').indexCreate('userId'))
    .then(() => r.table('webPushSubscriptions').indexCreate('endpoint'));
};

exports.down = function(r, conn) {
  return r.tableDrop('webPushSubscriptions').run(conn).catch(err => {
    throw new Error(err);
  });
};
