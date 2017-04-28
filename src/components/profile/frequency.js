// @flow
import React from 'react';
import Card from '../card';
import {
  ProfileHeader,
  ProfileHeaderMeta,
  Title,
  Subtitle,
  Description,
  Actions,
  ActionOutline,
} from './style';
import { FrequencyMetaData } from './metaData';

type FrequencyProps = {
  size?: 'mini' | 'small' | 'medium' | 'large' | 'full',
  data: {
    title: string,
    subtitle: string,
    description?: string,
    id?: string,
  },
  meta: Array<any>,
};

const Frequency = (props: FrequencyProps): React$Element<any> => {
  const size = props.size || 'mini';
  return (
    <Card {...props}>
      <ProfileHeader justifyContent={'flex-start'} alignItems={'center'}>
        <ProfileHeaderMeta direction={'column'} justifyContent={'center'}>
          <Title>{props.data.title}</Title>
          <Subtitle>{props.data.subtitle}</Subtitle>
        </ProfileHeaderMeta>
      </ProfileHeader>

      {size !== 'mini' &&
        size !== 'small' &&
        <Description>
          {props.data.description}
        </Description>}

      {size !== 'mini' &&
        <Actions>
          <ActionOutline>Follow</ActionOutline>
        </Actions>}

      {size !== 'mini' &&
        size !== 'small' &&
        size !== 'medium' &&
        <FrequencyMetaData type="frequency" id={props.data.id} />}
    </Card>
  );
};

export default Frequency;
