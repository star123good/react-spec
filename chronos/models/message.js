// @flow
const { db } = require('shared/db');

export const getTotalMessageCount = (threadId: string): Promise<number> => {
  return db
    .table('messages')
    .getAll(threadId, { index: 'threadId' })
    .filter(db.row.hasFields('deletedAt').not())
    .count()
    .run();
};

export const getNewMessageCount = (
  threadId: string,
  timeframe: string
): Promise<number> => {
  let range;
  switch (timeframe) {
    case 'daily': {
      range = 60 * 60 * 24;
      break;
    }
    case 'weekly': {
      range = 60 * 60 * 24 * 7;
      break;
    }
    default: {
      range = 60 * 60 * 24 * 7;
    } // default to weekly
  }

  return db
    .table('messages')
    .between([threadId, db.now().sub(range)], [threadId, db.now()], {
      index: 'threadIdAndTimestamp',
    })
    .filter(db.row.hasFields('deletedAt').not())
    .count()
    .run();
};
