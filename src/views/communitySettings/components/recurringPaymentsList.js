//@flow
import React from 'react';
//$FlowFixMe
import { connect } from 'react-redux';
//$FlowFixMe
import compose from 'recompose/compose';
import { BillingListItem } from '../../../components/listItems';
import { IconButton } from '../../../components/buttons';
import { UpsellUpgradeCommunity } from '../../../components/upsell';
import { openModal } from '../../../actions/modals';
import { convertTimestampToDate } from '../../../helpers/utils';
import { getCommunityRecurringPayments } from '../../../api/community';
import { displayLoadingCard } from '../../../components/loading';
import {
  StyledCard,
  LargeListHeading,
  ListHeader,
  ListContainer,
} from '../../../components/listItems/style';

const RecurringPaymentsList = ({ community, currentUser, dispatch }) => {
  console.log('community  a', community);

  const openProModal = () => {
    dispatch(openModal('UPGRADE_MODAL', { user: currentUser }));
  };

  if (!community || community === undefined) return null;

  // make sure to only display active subs for now
  const filteredRecurringPayments =
    community.recurringPayments && community.recurringPayments.length > 0
      ? community.recurringPayments.filter(
          subscription => subscription.status === 'active'
        )
      : [];

  if (filteredRecurringPayments.length > 0) {
    console.log('1');
    return (
      <StyledCard>
        <ListHeader>
          <LargeListHeading>Billing</LargeListHeading>
        </ListHeader>
        <ListContainer>
          {filteredRecurringPayments.map(payment => {
            const amount = payment.amount / 100;
            const timestamp = new Date(payment.createdAt * 1000).getTime();
            const created = convertTimestampToDate(timestamp);
            const meta = `$${amount}/month · Upgraded on ${created}`;
            return (
              <BillingListItem
                key={payment.createdAt}
                contents={{ name: payment.plan }}
                withDescription={false}
                meta={meta}
              >
                <IconButton glyph="settings" onClick={openProModal} />
              </BillingListItem>
            );
          })}
        </ListContainer>
      </StyledCard>
    );
  } else {
    console.log('2');
    return (
      <UpsellUpgradeCommunity community={community} currentUser={currentUser} />
    );
  }
};

const map = state => ({
  currentUser: state.users.currentUser,
});
export default compose(connect(map))(RecurringPaymentsList);
