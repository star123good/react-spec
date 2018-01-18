// @flow
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import channelInfoFragment from '../../fragments/channel/channelInfo';

type EditChannelInput = {
  channelId: string,
  name: string,
  description: string,
  slug: string,
  isPrivate: Boolean,
};

const editChannelMutation = gql`
  mutation editChannel($input: EditChannelInput!) {
    editChannel(input: $input) {
      ...channelInfo
    }
  }
  ${channelInfoFragment}
`;

const editChannelOptions = {
  props: ({ input, mutate }) => ({
    editChannel: (input: EditChannelInput) =>
      mutate({
        variables: {
          input,
        },
      }),
  }),
};

export default graphql(editChannelMutation, editChannelOptions);
