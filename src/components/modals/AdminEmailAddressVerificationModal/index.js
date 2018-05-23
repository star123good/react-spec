// @flow
import * as React from 'react';
import Modal from 'react-modal';
import compose from 'recompose/compose';
import ModalContainer from '../modalContainer';
import { closeModal } from '../../../actions/modals';
import { connect } from 'react-redux';
import { modalStyles } from '../styles';
import { Loading } from 'src/components/loading';
import { Section, Title } from './style';
import addCommunityModerator from 'shared/graphql/mutations/communityMember/addCommunityModerator';
import getCommunitySettings, {
  type GetCommunitySettingsType,
} from 'shared/graphql/queries/community/getCommunitySettings';
import AdministratorEmailForm from 'src/views/communityBilling/components/administratorEmailForm';
import viewNetworkHandler from 'src/components/viewNetworkHandler';
import ViewError from 'src/components/viewError';
import type { Dispatch } from 'redux';

type Props = {
  dispatch: Dispatch<Object>,
  isOpen: boolean,
  currentUser: Object,
  input: Object,
  data: {
    community: GetCommunitySettingsType,
  },
  addCommunityModerator: Function,
};

class AdminEmailAddressVerificationModal extends React.Component<Props> {
  closeModal = () => {
    this.props.dispatch(closeModal());
  };

  render() {
    const { isOpen, data: { community } } = this.props;

    if (community) {
      return (
        <Modal
          /* TODO(@mxstbr): Fix this */
          ariaHideApp={false}
          isOpen={isOpen}
          contentLabel={'Administrator email required'}
          onRequestClose={this.closeModal}
          shouldCloseOnOverlayClick={true}
          style={modalStyles(420)}
          closeTimeoutMS={330}
        >
          <ModalContainer
            noHeader={true}
            title={null}
            closeModal={this.closeModal}
          >
            <div
              style={{ marginBottom: '-16px' }}
              data-cy="admin-email-address-verification-modal"
            >
              <AdministratorEmailForm id={community.id} community={community} />
            </div>
          </ModalContainer>
        </Modal>
      );
    }

    if (this.props.isLoading) {
      return (
        <Modal
          /* TODO(@mxstbr): Fix this */
          ariaHideApp={false}
          isOpen={isOpen}
          contentLabel={'Add admin email address'}
          onRequestClose={this.closeModal}
          shouldCloseOnOverlayClick={true}
          style={modalStyles(420)}
          closeTimeoutMS={330}
        >
          <ModalContainer
            noHeader={true}
            title={null}
            closeModal={this.closeModal}
          >
            <Section>
              <Title>Add admin email address</Title>
              <Section>
                <Loading />
              </Section>
            </Section>
          </ModalContainer>
        </Modal>
      );
    }

    return (
      <Modal
        /* TODO(@mxstbr): Fix this */
        ariaHideApp={false}
        isOpen={isOpen}
        contentLabel={'Add admin email address'}
        onRequestClose={this.closeModal}
        shouldCloseOnOverlayClick={true}
        style={modalStyles(420)}
        closeTimeoutMS={330}
      >
        <ModalContainer
          noHeader={true}
          title={null}
          closeModal={this.closeModal}
        >
          <Section>
            <Title>Add admin email address</Title>

            <ViewError
              emoji={' '}
              refresh
              small
              heading={`We had trouble loading this community’s billing settings.`}
            />
          </Section>
        </ModalContainer>
      </Modal>
    );
  }
}

const map = state => ({
  isOpen: state.modals.isOpen,
});
export default compose(
  // $FlowIssue
  connect(map),
  getCommunitySettings,
  addCommunityModerator,
  viewNetworkHandler
)(AdminEmailAddressVerificationModal);
