import React from 'react';
import PropTypes from 'prop-types';
import ThumbUp from '@material-ui/icons/ThumbUp';
import ThumbDown from '@material-ui/icons/ThumbDown';
import CircularProgress from '@material-ui/core/CircularProgress';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import messageActions from '../../../redux/actions/messages';
import uiActions from '../../../redux/actions/ui';
import _ from 'lodash';
import { FlexContainer } from '../../shared/Container';

const styles = {
  feedbackButton: {
    height: '16px',
    cursor: 'pointer',
  },
};

class Feedback extends React.Component {
  static propTypes = {
    message: PropTypes.object,
    actions: PropTypes.object,
    skillFeedbackByMessageId: PropTypes.object,
    countryCode: PropTypes.string,
    countryName: PropTypes.string,
    theme: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      feedbackInProgress: false,
      skill: this.parseSkill(),
    };
  }

  parseSkill = () => {
    const { message } = this.props;
    let skillObj = {};
    if (message && message.response && message.authorName === 'SUSI') {
      const skillData = _.get(message, 'response.answers.0.skills.0', '');
      if (skillData) {
        let parsedData = skillData.split('/');
        if (parsedData.length === 7) {
          skillObj.model = parsedData[3];
          skillObj.group = parsedData[4];
          skillObj.language = parsedData[5];
          skillObj.skill = parsedData[6].split('.')[0];
        }
      }
    }
    return skillObj;
  };

  removeFeedback = () => {
    this.setState({ feedbackInProgress: false });
  };

  postSkillReplyFeedback = async feedback => {
    const skillInfo = this.state.skill;
    const { actions, message, countryCode, countryName } = this.props;
    const query = _.get(message, 'response.query', '');
    const reply = _.get(message, 'text', '');

    this.setState({
      feedbackInProgress: true,
    });
    try {
      let payload = await actions.postSkillFeedback({
        ...skillInfo,
        feedback,
        query,
        reply,
        countryName,
        countryCode,
      });
      if (payload.accepted) {
        this.saveSkillFeedback(feedback);
      } else {
        this.removeFeedback();
      }
    } catch (error) {
      this.removeFeedback();
      actions.openSnackBar({
        snackBarMessage: 'Could not give feedback to the reply',
        snackBarDuration: 2000,
      });
    }
  };

  saveSkillFeedback = async feedback => {
    const { actions, message } = this.props;
    await actions.saveSkillFeedback({ messageId: message.id, feedback });
    this.setState({
      feedbackInProgress: false,
    });
  };

  render() {
    const { message, skillFeedbackByMessageId, theme } = this.props;
    let feedback = skillFeedbackByMessageId[message.id]
      ? skillFeedbackByMessageId[message.id]
      : '';
    const defaultFeedbackColor = theme === 'light' ? '#90a4ae' : '#7eaaaf';

    if (this.state.feedbackInProgress) {
      return (
        <span style={styles.feedbackContainer}>
          <CircularProgress size={12} />
        </span>
      );
    }

    return (
      <span>
        {message && message.authorName === 'SUSI' ? (
          <FlexContainer>
            <ThumbUp
              onClick={() => this.postSkillReplyFeedback('positive')}
              style={{
                ...styles.feedbackButton,
                color:
                  feedback === 'positive' ? '#00ff7f' : defaultFeedbackColor,
              }}
            />
            <ThumbDown
              onClick={() => this.postSkillReplyFeedback('negative')}
              style={{
                ...styles.feedbackButton,
                color:
                  feedback === 'negative' ? '#f23e3e' : defaultFeedbackColor,
              }}
            />
          </FlexContainer>
        ) : null}
      </span>
    );
  }
}

function mapStateToProps({ messages, app, settings }) {
  return {
    skillFeedbackByMessageId: messages.skillFeedbackByMessageId,
    countryCode: _.get(app, 'location.countryCode', ''),
    countryName: _.get(app, 'location.countryName', ''),
    theme: settings.theme,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...messageActions, ...uiActions }, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Feedback);
