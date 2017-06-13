'use strict';

exports.up = function(r, conn) {
  return (
    // Create new tables, update old ones with receiveNotifications
    Promise.all([
      r
        .table('usersChannels')
        .filter({ isBlocked: false })
        .update({ receiveNotifications: true })
        .run(conn)
        .catch(err => {
          console.log(err);
          throw err;
        }),
      r
        .table('usersCommunities')
        .filter({ isBlocked: false })
        .update({ receiveNotifications: true })
        .run(conn)
        .catch(err => {
          console.log(err);
          throw err;
        }),
      r.tableCreate('usersThreads').run(conn).catch(err => {
        console.log(err);
        throw err;
      }),
      r.tableCreate('usersNotifications').run(conn).catch(err => {
        console.log(err);
        throw err;
      }),
    ])
      // Add secondary indexes to new tables
      .then(() =>
        Promise.all([
          r.table('usersThreads').indexCreate('userId').run(conn).catch(err => {
            console.log(err);
            throw err;
          }),
          r
            .table('usersThreads')
            .indexCreate('threadId')
            .run(conn)
            .catch(err => {
              console.log(err);
              throw err;
            }),
          r
            .table('usersNotifications')
            .indexCreate('userId')
            .run(conn)
            .catch(err => {
              console.log(err);
              throw err;
            }),
        ])
      )
      // Insert data into new tables that should be there
      .then(() =>
        Promise.all([
          // Thread creators -> usersThreads
          r
            .table('threads')
            .filter(r.row.hasFields('deletedAt').not())
            .pluck(['creatorId', 'id'])
            .forEach(thread =>
              r
                .table('usersThreads')
                .insert({
                  createdAt: r.now(),
                  isParticipant: true,
                  receiveNotifications: true,
                  threadId: thread('id'),
                  userId: thread('creatorId'),
                })
                .run(conn)
            )
            .run(conn)
            .catch(err => {
              console.log(err);
              throw err;
            }),
          // Thread participants -> usersThreads
          r
            .table('threads')
            .filter(r.row.hasFields('deletedAt').not())
            .run(conn)
            .catch(err => {
              console.log(err);
              throw err;
            })
            .then(cursor => cursor._data[0])
            .then(threads =>
              Promise.all(
                threads.map(thread => {
                  return Promise.all([
                    r
                      .table('messages')
                      .filter({ threadId: thread.id })
                      .map(message => message('senderId'))
                      .run(conn)
                      .then(cursor => cursor._data[0])
                      .catch(err => {
                        console.log(err);
                        throw err;
                      }),
                    thread,
                  ]);
                })
              )
            )
            .then(threadsMessages =>
              Promise.all(
                threadsMessages.map(([threadSenders, thread]) => {
                  if (!threadSenders) return Promise.resolve();

                  return Promise.all(
                    threadSenders.map(sender => {
                      return r
                        .table('usersThreads')
                        .insert({
                          createdAt: r.now(),
                          isParticipant: true,
                          receiveNotifications: true,
                          threadId: thread.id,
                          userId: sender,
                        })
                        .run(conn)
                        .catch(err => {
                          console.log(err);
                          throw err;
                        });
                    })
                  );
                })
              )
            ),
        ])
      )
      .catch(err => {
        console.log(err);
        throw err;
      })
  );
};

exports.down = function(r, conn) {
  return Promise.all([
    r.tableDrop('usersThreads'),
    r.tableDrop('usersNotifications'),
    r
      .table('usersCommunities')
      .update({ receiveNotifications: r.literal() })
      .run(conn),
    r
      .table('usersCommunities')
      .update({ receiveNotifications: r.literal() })
      .run(conn),
  ]);
};
