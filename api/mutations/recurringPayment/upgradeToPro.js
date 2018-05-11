// @flow
import type { GraphQLContext } from '../../';
import UserError from '../../utils/UserError';
import {
  getUserRecurringPayments,
  updateRecurringPayment,
  createRecurringPayment,
} from '../../models/recurringPayment';
import {
  getStripeCustomer,
  createStripeCustomer,
  updateStripeCustomer,
  createStripeSubscription,
} from './utils';
import { getUserById } from '../../models/user';
import { isAuthedResolver as requireAuth } from '../../utils/permissions';
import { events } from 'shared/analytics';
import { trackQueue } from 'shared/bull/queues';

type Input = {
  input: {
    plan: string,
    token: string,
  },
};

export default requireAuth(
  async (_: any, args: Input, { user }: GraphQLContext) => {
    if (!user.email) {
      trackQueue.add({
        userId: user.id,
        event: events.USER_UPGRADED_TO_PRO_FAILED,
        properties: {
          reason: 'no email address',
        },
      });

      return new UserError(
        'Please add an email address in your settings before upgrading to Pro'
      );
    }

    // gql should have caught this, but just in case not token or plan
    // was specified, return an error
    if (!args.input.plan || !args.input.token) {
      trackQueue.add({
        userId: user.id,
        event: events.USER_UPGRADED_TO_PRO_FAILED,
        properties: {
          reason: 'no token provided',
        },
      });

      return new UserError(
        'Something went wrong upgrading you to Pro. Please try again.'
      );
    }

    const handleProUpgrade = async () => {
      // parse the token string into an object
      let token = JSON.parse(args.input.token);
      const { input: { plan } } = args;

      // get any recurring payments for the current user
      const rPayments = await getUserRecurringPayments(user.id);

      // only evaluate pro subscriptions, and not community subscriptions
      const proSubscriptions =
        // if payments were found, make sure to select the first community-standard plan to update, otherwise return null and we will be creating a new payment
        rPayments && rPayments.filter(pmt => pmt.planId === 'beta-pro');

      const recurringPaymentToEvaluate =
        proSubscriptions && proSubscriptions.length > 0
          ? proSubscriptions[0]
          : null;

      // we still want to know globally if a user has a customerId already so that we avoid create duplicate customers in Stripe
      const hasCustomerId = rPayments && rPayments.length > 0;

      // if no recurringPaymentToEvaluate is found, it means the user has never been pro and we can go ahead and create a new subscription
      if (!recurringPaymentToEvaluate && user.email) {
        const customer = hasCustomerId
          ? await getStripeCustomer(rPayments[0].customerId)
          : await createStripeCustomer(user.email, token.id);

        const stripeData = await createStripeSubscription(customer.id, plan, 1);

        return await createRecurringPayment({
          userId: user.id,
          stripeData: {
            ...stripeData,
            sourceBrand: customer.sources.data[0].brand,
            sourceLast4: customer.sources.data[0].last4,
          },
        });
      }

      if (
        recurringPaymentToEvaluate &&
        recurringPaymentToEvaluate.status === 'active'
      ) {
        trackQueue.add({
          userId: user.id,
          event: events.USER_UPGRADED_TO_PRO_FAILED,
          properties: {
            reason: 'already pro',
          },
        });

        return new UserError("You're already a Pro member - thank you!");
      }

      if (recurringPaymentToEvaluate && user.email) {
        const customer = await updateStripeCustomer(
          recurringPaymentToEvaluate.customerId,
          user.email,
          token.id
        );

        const subscription = await createStripeSubscription(
          customer.id,
          plan,
          1
        );

        trackQueue.add({
          userId: user.id,
          event: events.USER_UPGRADED_TO_PRO,
        });

        return await updateRecurringPayment({
          id: recurringPaymentToEvaluate.id,
          stripeData: {
            ...subscription,
            sourceBrand: customer.sources.data[0].brand,
            sourceLast4: customer.sources.data[0].last4,
          },
        });
      }
    };

    // handle pro upgrade logic
    return (
      handleProUpgrade()
        // return the user record to update the cilent side cache for isPro
        .then(() => getUserById(user.id))
        .catch(err => {
          console.error('Error upgrading to Pro: ', err.message);

          trackQueue.add({
            userId: user.id,
            event: events.USER_UPGRADED_TO_PRO_FAILED,
            properties: {
              reason: 'unknown error',
              error: err.message,
            },
          });

          return new UserError(
            "We weren't able to upgrade you to Pro: " + err.message
          );
        })
    );
  }
);
