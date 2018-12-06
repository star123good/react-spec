// @flow
import React from 'react';
import styled from 'styled-components';
import { FlexCol } from '../globals';
import { Tagline, Copy } from 'src/views/pages/style';
import ViewSegment from '../../components/themedSection';

const Emoji = styled.div`
  font-size: 3em;
  text-align: center;
  line-height: 1.5em;
  margin-bottom: 0.25em;
`;

const Wrapper = styled(FlexCol)`
  margin: 0 auto;
  text-align: center;
`;
const Text = styled(Copy)`
  font-size: 20px;
  line-height: 1.3;
  font-weight: 500;
  opacity: 0.95;
  margin: 0 auto;
  max-width: none;

  a {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    font-size: 20px;
    text-align: center;
  }
`;

const MaintenanceDowntime = () => {
  const timeInUTC = 'September 25, 2017 15:00:00 UTC';
  return (
    <ViewSegment background="constellations">
      <Wrapper>
        <Emoji>🛠</Emoji>
        <Tagline>Spectrum is currently undergoing maintenance</Tagline>
        <Text>
          We'll be back by 3pm UTC (
          {new Date(timeInUTC)
            .toLocaleTimeString()
            .replace(/:\d\d:\d\d\s/, '')
            .toLowerCase()}{' '}
          your time), check{' '}
          <a href="https://twitter.com/withspectrum">
            @withspectrum on Twitter
          </a>{' '}
          for updates.
        </Text>
      </Wrapper>
    </ViewSegment>
  );
};

export default MaintenanceDowntime;
