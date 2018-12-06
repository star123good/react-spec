// @flow
const debug = require('debug')('chronos:queue:remove-seen-usersNotifications');
import Raven from 'shared/raven';
import type { DBUsersNotifications } from 'shared/types';
import {
  getSeenNotifications,
  deleteUsersNotifications,
} from 'chronos/models/usersNotifications';

const processJob = async () => {
  let after = 0;
  let limit = 10000;
  let done = false;

  const processDeleteRecords = async (arr: Array<DBUsersNotifications>) => {
    if (!arr || arr.length === 0) return;

    const filteredIds = arr
      .filter(rec => rec.isSeen)
      .filter(rec => {
        const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30; //ms
        const added = new Date(rec.entityAddedAt).getTime(); //ms
        const now = new Date().getTime(); //ms
        return now - added > THIRTY_DAYS;
      })
      .map(rec => rec.id);

    return await deleteUsersNotifications(filteredIds);
  };

  const processUsersNotificiations = async (
    arr: Array<DBUsersNotifications>
  ) => {
    if (done) {
      return await processDeleteRecords(arr);
    }

    if (arr.length < limit) {
      done = true;
      return await processDeleteRecords(arr);
    }

    return processDeleteRecords(arr).then(async () => {
      after = after + limit;
      const nextRecords = await getSeenNotifications(after, limit);
      return processUsersNotificiations(nextRecords);
    });
  };

  const initialRecords = await getSeenNotifications(after, limit);
  return processUsersNotificiations(initialRecords);
};

export default async () => {
  try {
    await processJob();
  } catch (err) {
    debug('❌ Error in job:\n');
    debug(err);
    Raven.captureException(err);
  }
};
