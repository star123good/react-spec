// @flow
import * as React from 'react';
import {
  SourceContainer,
  SourceContentContainer,
  SourceText,
  SourceName,
  SourceExpiration,
} from '../style';
import Badge from '../../../components/badges';
import EditSource from './editSourceDropdown';
import type { GetCommunitySettingsType } from 'shared/graphql/queries/community/getCommunitySettings';

type Props = {
  community: GetCommunitySettingsType,
  canRemoveDefault: boolean,
  source: {
    id: string,
    card: {
      brand: string,
      last4: string,
      exp_month: number,
      exp_year: number,
    },
  },
};

const getCardImage = (brand: string) => {
  switch (brand) {
    case 'Visa':
      return '/img/payment-methods/visa.svg';
    case 'Discover':
      return '/img/payment-methods/discover.svg';
    case 'Diners Club':
      return '/img/payment-methods/diners-club.svg';
    case 'MasterCard':
      return '/img/payment-methods/mastercard.svg';
    case 'American Express':
      return '/img/payment-methods/amex.svg';
    case 'JCB':
      return '/img/payment-methods/jcb.svg';
    default:
      return '/img/payment-methods/card-unknown.svg';
  }
};

class Source extends React.Component<Props> {
  render() {
    const { source, community, canRemoveDefault } = this.props;
    const imageSrc = getCardImage(source.card.brand);
    return (
      <SourceContainer>
        <SourceContentContainer>
          <img src={imageSrc} alt={'Payment method icon'} width={48} />
          <SourceText>
            <SourceName>
              {source.card.brand} ending in {source.card.last4}
              {source.isDefault && <Badge type={'default-payment-method'} />}
            </SourceName>
            <SourceExpiration>
              Expires {source.card.exp_month}/{source.card.exp_year}
            </SourceExpiration>
          </SourceText>
        </SourceContentContainer>
        <React.Fragment>
          {!source.isDefault && (
            <EditSource community={community} source={source} />
          )}
          {source.isDefault &&
            canRemoveDefault && (
              <EditSource community={community} source={source} />
            )}
        </React.Fragment>
      </SourceContainer>
    );
  }
}

export default Source;
