import React, { Component } from 'react';
import NavBar from '../NavBar';
import styled from 'styled-components';
import PostList from '../PostList';
import Chat from '../Chat';
import ListDetail from '../ListDetail';
import * as firebase from 'firebase';
import FIREBASE_CONFIG from '../../config/FirebaseConfig'
const fbconfig = {
  apiKey: FIREBASE_CONFIG.API_KEY,
  authDomain: FIREBASE_CONFIG.AUTH_DOMAIN,
  databaseURL: FIREBASE_CONFIG.DB_URL,
  storageBucket: FIREBASE_CONFIG.STORAGE_BUCKET,
  messagingSenderId: FIREBASE_CONFIG.MESSAGING_SENDER_ID
};

export default class App extends Component {
	constructor() {
    super()
    this.state = {
      currentUser: null,
      currentTag: "",
      currentPost: {
        id: 1
      }
    }
  }

  selectTag = (tag) => {
    this.setState({ currentTag: tag });
  }

  setCurrentUser = (user) => {
    this.setState({
      currentUser: user
    });
  }

  componentWillMount(){
    firebase.initializeApp(fbconfig);
  }

  selectPost(){
  }

  render() {
    return(
      <Body>
        <NavBar></NavBar>
        <ListDetail>
					<PostList 
						currentTag={this.state.currentTag} 
						selectPost={this.selectPost} 
						currentData={{currentPost: this.state.currentPost, currentUser: this.state.currentUser }} />
					<Chat currentData={{currentPost: this.state.currentPost}} />
				</ListDetail>
      </Body>
    )
  }
}

const Body = styled.div`
  display: flex;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
`;