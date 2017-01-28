import React, { Component } from 'react';
import { Column, Avatar, UserHeader, UserMeta, Name, Username, TopicSearch } from './style';
import { AvatarMask } from './svg';
import Login from '../Login';
// import TagButton from './TagButton';

// class SideBar extends Component{
//   constructor(props){
//     super(props);
//     this.state = {
//       tags: []
//     }
//   }
//   componentDidMount(){
//     let postRef = firebase.database().ref('tags');
//     let that = this;
//     postRef.on('value', function(snapshot){
//       that.setState({ tags: snapshot.val() });
//     })
//   }
//   setCurrentUser(user){
//     this.props.setCurrentUser(user);
//   }
//   selectTag(tag){
//     console.log(tag);
//     this.props.selectTag(tag);
//   }
//   renderTags(){
//     let that = this;
//     return this.state.tags.map(function(tag){
//       let current = tag == that.props.currentTag;
//       return (<TagButton current={current} key={tag} name={tag} clickHandler={that.selectTag.bind(that, tag)} />);
//     });
//   }
// 	render() {
//     let that = this;
// 		return (
// 	    	<div className="col-4 min-x8 bg-primary">
// 	    		<div className="flex y10 justify-center items-center">
// 		    		<img src="/img/logo-mark.png" className="x3 y3" role="presentation"/>
// 	    		</div>
// 	    		<div className="flex y10 justify-center items-center flex-column">
//             { that.props.currentUser ? this.renderTags() : <Login setUser={that.setCurrentUser.bind(that)} currentUser={that.props.currentUser} /> }
//           </div>
// 	    	</div>
// 	  );
// 	}
// }

export default class NavBar extends Component{
  render() {
    return(
      <Column>
        <AvatarMask />
        <UserHeader>
          {/* <Avatar src="./img/avatar.jpg" title="Bryn Jackson"></Avatar>
          <UserMeta>
            <Name>Bryn Jackson</Name>
            <Username>@uberbryn</Username>
          </UserMeta> */}
          <div className="flex y10 justify-center items-center flex-column">
            { this.props.currentUser ? <p>LoggedIn!</p> : <Login /> }
          </div>
        </UserHeader>
        <TopicSearch type='text' placeholder='Search'></TopicSearch>
      </Column>
    )
  }
};