// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Link from '../../components/link';
import ViewError from '../../components/viewError';
import { Button, OutlineButton, ButtonRow } from '../../components/buttons';
import {
  SectionsContainer,
  SectionCard,
  SectionTitle,
  SectionSubtitle,
  SectionCardFooter,
  Column,
} from '../../components/settingsViews/style';
import type { GetCommunitySettingsType } from 'shared/graphql/queries/community/getCommunitySettings';
import { openModal } from '../../actions/modals';
import { AddCardSection } from './style';
import StripeCardForm from '../../components/stripeCardForm';
import Subscription from './components/subscription';
import AdministratorEmailForm from './components/administratorEmailForm';
import Source from './components/source';
import Invoice from './components/invoice';
import type { Dispatch } from 'redux';
import { ErrorBoundary, SettingsFallback } from 'src/components/error';

type Props = {
  currentUser: Object,
  community: GetCommunitySettingsType,
  dispatch: Dispatch<Object>,
  match: Object,
  history: Object,
};

class CommunityMembersSettings extends React.Component<Props> {
  triggerCancel = () => {
    const message = (
      <div>
        <p>Are you sure you want to cancel this subscription?</p>{' '}
        <p>This action cannot be undone.</p>
      </div>
    );
    return this.props.dispatch(
      openModal('DELETE_DOUBLE_CHECK_MODAL', {
        id: this.props.community.id,
        entity: 'community-subscription',
        message,
        slug: this.props.community.slug,
      })
    );
  };

  render() {
    const { community } = this.props;

    if (community && community.id && community.communityPermissions.isOwner) {
      if (!community.billingSettings.administratorEmail) {
        return (
          <SectionsContainer data-cy="community-settings-billing-admin-email-form">
            <Column>
              <ErrorBoundary fallbackComponent={SettingsFallback}>
                <AdministratorEmailForm
                  community={community}
                  id={community.id}
                  data
                />
              </ErrorBoundary>
            </Column>
          </SectionsContainer>
        );
      }

      return (
        <SectionsContainer data-cy="community-settings-billing">
          <Column>
            <ErrorBoundary fallbackComponent={SettingsFallback}>
              <SectionCard>
                <SectionTitle>Your subscription</SectionTitle>
                {(community.billingSettings.subscriptions.length === 0 ||
                  (community.billingSettings.subscriptions.length > 0 &&
                    community.billingSettings.subscriptions[0].items.length ===
                      0)) && (
                  <React.Fragment>
                    <SectionSubtitle>
                      You have no active subscriptions. As soon as you add
                      moderators, private channels, or analytics to this
                      community, your subscription information will appear here.
                    </SectionSubtitle>
                    <SectionSubtitle>
                      <Link to={'/pricing'}>
                        Learn more about Spectrum features
                      </Link>
                    </SectionSubtitle>
                  </React.Fragment>
                )}
                {community.billingSettings.subscriptions.map(
                  subscription =>
                    subscription &&
                    subscription.items.length > 0 && (
                      <Subscription
                        key={subscription.id}
                        subscription={subscription}
                        community={community}
                      />
                    )
                )}
              </SectionCard>
            </ErrorBoundary>
          </Column>

          <Column>
            <ErrorBoundary fallbackComponent={SettingsFallback}>
              <SectionCard>
                <SectionTitle>Payment methods</SectionTitle>
                <SectionSubtitle>
                  {community.billingSettings.sources.length === 0
                    ? 'Saved payment methods will appear here'
                    : `You can manage your payment information here or change your
                    default card. To remove your default payment method, you'll need to first cancel any active subscriptions.`}
                </SectionSubtitle>
                {community.billingSettings.sources.map(
                  source =>
                    source && (
                      <Source
                        key={source.id}
                        source={source}
                        community={community}
                        canRemoveDefault={
                          community.billingSettings.subscriptions.length === 0
                        }
                      />
                    )
                )}
                <AddCardSection>
                  <SectionTitle>Add new card</SectionTitle>
                  <StripeCardForm
                    community={community}
                    render={({ isLoading }) => (
                      <Button loading={isLoading}>Save</Button>
                    )}
                  />
                </AddCardSection>
              </SectionCard>
            </ErrorBoundary>

            <ErrorBoundary fallbackComponent={SettingsFallback}>
              <SectionCard>
                <SectionTitle>Payment history</SectionTitle>
                {community.billingSettings.invoices.length === 0 && (
                  <SectionSubtitle>
                    Receipts will appear here each time a payment occurs.
                  </SectionSubtitle>
                )}
                {community.billingSettings.invoices.map(
                  invoice =>
                    invoice && <Invoice key={invoice.id} invoice={invoice} />
                )}
              </SectionCard>
            </ErrorBoundary>

            <ErrorBoundary fallbackComponent={SettingsFallback}>
              {community.billingSettings.subscriptions.length > 0 &&
                community.billingSettings.subscriptions[0].items.length > 0 && (
                  <SectionCard>
                    <SectionTitle>Cancel your subscription</SectionTitle>
                    <SectionSubtitle>
                      Canceling your subscription will immediately remove access
                      to all paid features, including private channels and
                      moderator seats.
                    </SectionSubtitle>
                    <SectionCardFooter>
                      <Button
                        gradientTheme={'warn'}
                        onClick={this.triggerCancel}
                      >
                        Cancel subscription
                      </Button>
                    </SectionCardFooter>
                  </SectionCard>
                )}
            </ErrorBoundary>
          </Column>
        </SectionsContainer>
      );
    }

    return (
      <ViewError
        heading={'You don’t have permission to manage this community.'}
        subheading={
          'If you want to create your own community, you can get started below.'
        }
      >
        <ButtonRow>
          <Link to={'/'}>
            <OutlineButton large>Take me back</OutlineButton>
          </Link>

          <Link to={'/new/community'}>
            <Button large>Create a community</Button>
          </Link>
        </ButtonRow>
      </ViewError>
    );
  }
}

const map = state => ({ currentUser: state.users.currentUser });
export default compose(
  // $FlowIssue
  connect(map)
)(CommunityMembersSettings);
