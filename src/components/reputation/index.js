// @flow
import React from 'react';
import Icon from '../icons';
import { ReputationIcon, ReputationIconMini, Circle } from './style';

export default () => (
  <ReputationIcon>
    <Icon glyph="rep" size="24" />
  </ReputationIcon>
);

export const ReputationMini = () => (
  <ReputationIconMini>
    <Icon glyph="rep" size="20" />
  </ReputationIconMini>
);
