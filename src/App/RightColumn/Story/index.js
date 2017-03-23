import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Markdown from '../../../shared/Markdown';
import { openGallery } from '../../../actions/gallery';
import { timeDifference } from '../../../helpers/utils';

import { StoryContainer, Header, StoryTitle, Byline } from './style';

class Story extends Component {
  componentDidMount() {
    this.addEventListeners();
  }

  componentDidUpdate() {
    this.addEventListeners();
  }

  addEventListeners = () => {
    // loop through all the dom nodes of the story
    // attach event listeners to all links to open in new tab
    // attach event listeners to all images to open the gallery
    let story = this.refs.story;
    let imageNodes = story.querySelectorAll('img');
    let linkNodes = story.querySelectorAll('a');

    for (let link of linkNodes) {
      link.setAttribute('target', '_blank');
    }

    for (let image of imageNodes) {
      image.addEventListener('click', this.openGallery, false);
    }
  };

  openGallery = e => {
    this.props.dispatch(openGallery(e));
  };

  render() {
    const { story, frequency, communities } = this.props;
    const timestamp = timeDifference(Date.now(), story.timestamp);
    const community = frequency &&
      communities.find(community => community.id === frequency.community);

    return (
      <StoryContainer>
        <Header>
          {!frequency
            ? // this is required to account for async loading of the frequency data if a user hits a url like /~everything/{storyId}
              <Byline>{story.creator.displayName} · Posted {timestamp}</Byline>
            : <Byline>
                {story.creator.displayName}
                {' '}· Posted in{' '}
                <Link to={`/${community.slug}/~${frequency.slug}`}>
                  ~{frequency.slug}
                </Link>
                {' '}
                {timestamp}
              </Byline>}

          <StoryTitle>{story.content.title}</StoryTitle>
        </Header>

        <div className="markdown" ref="story">
          <Markdown>{story.content.description}</Markdown>
        </div>
      </StoryContainer>
    );
  }
}

const mapStateToProps = state => ({
  communities: state.communities.communities,
});

export default connect(mapStateToProps)(Story);
