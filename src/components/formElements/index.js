//@flow
import React, { Component } from 'react';

import { IconButton } from '../buttons';
import Icon from '../icons';
import {
  StyledLabel,
  StyledPrefixLabel,
  StyledInput,
  StyledTextArea,
  StyledUnderlineInput,
  StyledHiddenInput,
  StyledCheckboxWrapper,
  StyledError,
  ImageInputLabel,
  InputOverlay,
  ProfileImage,
  HiddenInput,
} from './style';

type InputProps = {
  children?: React$Element<any>,
  inputType?: String,
  defaultValue?: String,
  placeholder?: String,
  onChange?: Function,
  autofocus?: Boolean,
  checked?: Boolean,
  disabled: ?Boolean,
};

export const Input = (props: InputProps) => {
  return (
    <StyledLabel>
      {props.children}
      <StyledInput
        id={props.id}
        type={props.inputType}
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
        onChange={props.onChange}
        autofocus={props.autofocus}
      />
    </StyledLabel>
  );
};

// export const ImageInput = (props) => {
//   return(
//     <ImageInputLabel>
//       <InputOverlay>
//         <Icon glyph="photo" />
//       </InputOverlay>
//       {user.photoURL &&
//         <ProfileImage src={user.photoURL} role="presentation" />}
//       <HiddenInput
//         type="file"
//         id="file"
//         name="file"
//         accept=".png, .jpg, .jpeg, .gif, .mp4"
//         multiple={false}
//         onChange={this.stageProfilePhotoForUpload}
//       />
//     </ImageInputLabel>
//   )
// }

export const Checkbox = (props: InputProps) => {
  return (
    <StyledLabel>
      <StyledCheckboxWrapper>
        {props.checked
          ? <IconButton glyph="checkmark" color="success.default" />
          : <IconButton glyph="checkbox" />}
        <StyledHiddenInput
          type="checkbox"
          id={props.id}
          checked={props.checked}
          onChange={props.onChange}
        />
        {props.children}
      </StyledCheckboxWrapper>
    </StyledLabel>
  );
};

export const TextArea = (props: InputProps) => {
  return (
    <StyledLabel>
      {props.children}
      <StyledTextArea
        id={props.id}
        placeholder={props.placeholder}
        defaultValue={props.defaultValue}
        onChange={props.onChange}
        autofocus={props.autofocus}
      />
    </StyledLabel>
  );
};

export class UnderlineInput extends Component {
  render() {
    return (
      <StyledPrefixLabel disabled={this.props.disabled}>
        {this.props.children}
        <StyledUnderlineInput
          type="text"
          id={this.props.id}
          placeholder={this.props.placeholder}
          value={this.props.value || this.props.defaultValue}
          onChange={this.props.onChange}
          autofocus={this.props.autofocus}
          disabled={this.props.disabled}
        />
      </StyledPrefixLabel>
    );
  }
}

export const Error = props => {
  return <StyledError>{props.children}</StyledError>;
};
