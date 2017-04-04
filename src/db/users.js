import database from 'firebase/database';

/**
 * Create a new user
 *
 * Returns a Promise that resolves with the data
 */
export const createUser = user => {
  const db = database();
  const uid = user.uid;

  const updates = {
    [`users/${uid}/displayName`]: user.displayName,
    [`users/${uid}/uid`]: uid,
    [`users/${uid}/photoURL`]: user.photoURL,
    [`users/${uid}/created`]: database.ServerValue.TIMESTAMP,
    [`users/${uid}/frequencies/-KenmQHXnkUDN0S9UUsn`]: {
      //=> add `~Discover` to user's default frequencies
      id: '-KenmQHXnkUDN0S9UUsn',
      permission: 'subscriber',
      joined: database.ServerValue.TIMESTAMP,
    },
    [`users/${uid}/frequencies/-Kenmw8GUeJYnxXNc0WS`]: {
      //=> add `~Spectrum` to user's default frequencies
      id: '-Kenmw8GUeJYnxXNc0WS',
      permission: 'subscriber',
      joined: database.ServerValue.TIMESTAMP,
    },
  };

  if (user.email) {
    updates[`users/${uid}/email`] = true;
    updates[`users_private/${uid}/email`] = user.email;
  }

  return db
    .ref()
    .update(updates)
    .then(() => db.ref().update({
      [`frequencies/-KenmQHXnkUDN0S9UUsn/users/${uid}`]: {
        permission: 'subscriber',
        joined: database.ServerValue.TIMESTAMP,
      },
      [`frequencies/-Kenmw8GUeJYnxXNc0WS/users/${uid}`]: {
        permission: 'subscriber',
        joined: database.ServerValue.TIMESTAMP,
      },
    }))
    .then(() => db.ref(`users/${uid}`).once('value'))
    .then(snapshot => snapshot.val());
};

/**
 * Get the public information of a user
 *
 * Returns a Promise that resolves with the data
 */
export const getUserInfo = uid => {
  const db = database();

  return db.ref(`users/${uid}`).once('value').then(snapshot => {
    if (!snapshot.val()) {
      /* temporary hack to force a localstorage clear
      * this happened as a result of a bug introduced on March 14th
      * where a user could authenticate but a record would not be created in the users db
      * as a result they would be stuck in infinite loading
      * this snippet will force a localStorage clear when the user refreshes the page so that
      * they will at least be able to log in again with the new and proper auth method
      */
      localStorage.clear();
    }

    return snapshot.val();
  });
};

export const checkUniqueUsername = (name, uid) => {
  return new Promise((resolve, reject) => {
    database()
      .ref('users')
      .orderByChild('username')
      .equalTo(name)
      .once('value')
      .then(snapshot => {
        let val = snapshot.val();
        if (!val) return resolve(true); // if a user with this username doesn't exist, it's okay to use the new name
        if (val[uid]) return resolve(true); // and if we're looking at the current user (i.e. changing the username after creation), it's okay
        return resolve(false); // otherwise we can assume the username is taken
      });
  });
};

export const setUsernameAndEmail = ({ uid, username, email }) => {
  const db = database();

  const updates = {
    [`users/${uid}/username`]: username,
  };

  if (email) {
    updates[`users_private/${uid}/email`] = email;
    updates[`users/${uid}/email`] = true;
  }

  return db
    .ref()
    .update(updates)
    .then(() => db.ref(`users/${uid}`).once('value'))
    .then(snapshot => snapshot.val());
};

export const setlastSeen = uid => {
  const db = database();

  db
    .ref()
    .update({
      [`users/${uid}/lastSeen`]: database.ServerValue.TIMESTAMP,
    })
    .catch(err => {
      // Don't let setting the last activity crash the app
      console.log(err);
    });
};

export const createSubscription = (data, uid, plan) => {
  const db = database();
  const updates = {
    [`users_private/${uid}/customerId`]: data.customerId,
    [`users_private/${uid}/subscriptions/${data.subscriptionId}/customerId`]: data.customerId,
    [`users_private/${uid}/subscriptions/${data.subscriptionId}/subscriptionId`]: data.subscriptionId,
    [`users_private/${uid}/subscriptions/${data.subscriptionId}/tokenId`]: data.tokenId,
    [`users_private/${uid}/subscriptions/${data.subscriptionId}/customerEmail`]: data.customerEmail,
    [`users_private/${uid}/subscriptions/${data.subscriptionId}/plan`]: plan,
    [`users_private/${uid}/subscriptions/${data.subscriptionId}/name`]: data.subscriptionName,
    [`users_private/${uid}/subscriptions/${data.subscriptionId}/created`]: data.created,
    [`users_private/${uid}/subscriptions/${data.subscriptionId}/amount`]: data.amount,
  };

  return db
    .ref()
    .update(updates)
    .then(() =>
      db.ref(`users/${uid}/subscriptions/${data.subscriptionId}`).update({
        plan,
        name: data.subscriptionName,
        created: data.created,
        amount: data.amount,
      }))
    .then(() => db.ref(`users/${uid}`).once('value'))
    .then(snapshot => {
      return snapshot.val();
    })
    .catch(err => {
      console.log('error upgrading: ', err);
    });
};

export const deleteSubscription = (uid, subscriptionId) => {
  const db = database();

  return db
    .ref(`/users_private/${uid}/subscriptions/${subscriptionId}`)
    .remove()
    .then(() =>
      db.ref(`/users/${uid}/subscriptions/${subscriptionId}`).remove())
    .then(() => db.ref(`/users/${uid}`).once('value'))
    .then(snapshot => {
      return snapshot.val();
    })
    .catch(err => {
      console.log('error downgrading: ', err);
    });
};

/**
 * Given a current user, pass in a second userId to see if a message group exists or not between these two people
 *
 * In the future, we can add a new method to check an array of userIds to see if a group conversation exists
 */
export const getMessageGroups = uid => {
  const db = database();

  return db
    .ref(`/users/${uid}/messageGroups`)
    .once('value')
    .then(snapshot => snapshot.val());
};

export const checkMessageGroupForUsersMatch = (
  group,
  currentUser,
  checkingUser,
) => {
  const db = database();

  return db.ref(`/message_groups/${group}`).once('value').then(snapshot => {
    const messageGroupObj = snapshot.val();
    const users = Object.keys(messageGroupObj.users);
    const toCheck = [currentUser, checkingUser];
    if (users.sort().join('') === toCheck.sort().join('')) {
      return messageGroupObj.id;
    }
  });
};

export const listenToNewMessages = (uid, cb) => {
  const db = database();

  const handle = snapshot => {
    const messageGroups = snapshot.val();
    if (!messageGroups) return;
    return cb(messageGroups);
  };

  // Handle adding of unread messages
  db.ref(`/users/${uid}/messageGroups`).on('child_added', handle);
  // Handle changing of any messageGroups
  db.ref(`/users/${uid}/messageGroups`).on('child_changed', handle);
};
