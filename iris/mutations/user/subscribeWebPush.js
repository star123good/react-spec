// @flow
import type { GraphQLContext } from '../../';
import type { WebPushSubscription } from './';
import UserError from '../../utils/UserError';
import { storeSubscription } from '../../models/web-push-subscription';
import { sendWebPushNotification } from '../../utils/web-push';

export default (
  _: any,
  { subscription }: { subscription: WebPushSubscription },
  { user }: GraphQLContext
) => {
  if (!user || !user.id)
    throw new UserError(
      'Can only subscribe to web push notifications when logged in.'
    );

  return storeSubscription(subscription, user.id)
    .then(() => {
      return sendWebPushNotification(
        subscription,
        {
          title: 'A notification from Spectrum',
          body: 'Yay, notifications are enabled! 🚀',
        },
        {
          TTL: 300, // If the user doesn't go online for five minutes don't send him this notification anymore
        }
      ).catch(err => {
        console.log(err);
      });
    })
    .then(() => true)
    .catch(err => {
      throw new UserError("Couldn't store web push subscription.");
    });
};
