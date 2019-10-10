import React from 'react';
import Translate from '../Translate/Translate.react';
import SettingsTabWrapper from './SettingsTabWrapper';
import PropTypes from 'prop-types';
import TextToSpeechSettings from './TextToSpeechSettings.react';
import Switch from '@material-ui/core/Switch';
import { FlexContainer } from '../shared/Container';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { bindActionCreators } from 'redux';
import settingActions from '../../redux/actions/settings';
import uiActions from '../../redux/actions/ui';
import { connect } from 'react-redux';
import { TabHeading } from './SettingStyles';
import { setUserSettings } from '../../apis';

class SpeechTab extends React.Component {
  constructor(props) {
    super(props);
    const {
      speechOutput,
      speechOutputAlways,
      ttsLanguage,
      speechPitch,
      speechRate,
    } = this.props;
    this.state = {
      speechOutput,
      speechOutputAlways,
      ttsLanguage,
      speechPitch,
      speechRate,
      loading: false,
    };

    if ('speechSynthesis' in window) {
      this.TTSBrowserSupport = true;
    } else {
      this.TTSBrowserSupport = false;
      console.warn(
        'The current browser does not support the SpeechSynthesis API.',
      );
    }
  }

  // Handle change to speech output on speech input settings
  handleSpeechOutput = (event, isInputChecked) => {
    this.setState({
      speechOutput: isInputChecked,
    });
  };

  // Handle change to speech output always settings
  handleSpeechOutputAlways = (event, isInputChecked) => {
    this.setState({
      speechOutputAlways: isInputChecked,
    });
  };

  // Save new TTS settings
  handleNewTextToSpeech = settings => {
    this.setState({
      speechRate: settings.speechRate,
      speechPitch: settings.speechPitch,
      ttsLanguage: settings.ttsLanguage,
    });
  };

  handleSubmit = async () => {
    const {
      speechOutput,
      speechOutputAlways,
      ttsLanguage,
      speechPitch,
      speechRate,
    } = this.state;
    const { actions, userEmailId } = this.props;
    let payload = {
      speechOutput,
      speechOutputAlways,
      ttsLanguage,
      speechPitch,
      speechRate,
    };
    payload = userEmailId !== '' ? { ...payload, email: userEmailId } : payload;
    this.setState({ loading: true });
    try {
      let data = await setUserSettings(payload);
      if (data.accepted) {
        actions.openSnackBar({
          snackBarMessage: 'Settings updated',
        });
        actions.setUserSettings(payload);
        this.setState({ loading: false });
      } else {
        actions.openSnackBar({
          snackBarMessage: 'Failed to save Settings',
        });
        this.setState({ loading: false });
      }
    } catch (error) {
      actions.openSnackBar({
        snackBarMessage: 'Failed to save Settings',
      });
    }
  };

  render() {
    const {
      speechOutput,
      speechOutputAlways,
      ttsLanguage,
      speechPitch,
      speechRate,
      loading,
    } = this.state;
    const {
      speechOutput: _speechOutput,
      speechOutputAlways: _speechOutputAlways,
      ttsLanguage: _ttsLanguage,
      speechPitch: _speechPitch,
      speechRate: _speechRate,
    } = this.props;
    const disabled =
      (speechOutput === _speechOutput &&
        speechOutputAlways === _speechOutputAlways &&
        ttsLanguage === _ttsLanguage &&
        speechPitch === _speechPitch &&
        speechRate === _speechRate) ||
      loading;
    return (
      <SettingsTabWrapper heading="Speech Output">
        <FlexContainer>
          <div>
            <Translate text="Enable speech output only for speech input" />
          </div>
          <div>
            <Switch
              color="primary"
              disabled={!this.TTSBrowserSupport}
              onChange={this.handleSpeechOutput}
              checked={speechOutput}
            />
          </div>
        </FlexContainer>
        <div>
          <TabHeading>
            <Translate text="Speech Output Always ON" />
          </TabHeading>
          <FlexContainer>
            <div>
              <Translate text="Enable speech output regardless of input type" />
            </div>
            <div>
              <Switch
                color="primary"
                disabled={!this.TTSBrowserSupport}
                onChange={this.handleSpeechOutputAlways}
                checked={speechOutputAlways}
              />
            </div>
          </FlexContainer>
        </div>
        <div>
          <TextToSpeechSettings
            rate={speechRate}
            pitch={speechPitch}
            lang={ttsLanguage}
            newTtsSettings={this.handleNewTextToSpeech}
          />
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={this.handleSubmit}
          disabled={disabled}
          style={{ marginTop: '1.5rem', width: '10rem' }}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <Translate text="Save Changes" />
          )}
        </Button>
      </SettingsTabWrapper>
    );
  }
}

SpeechTab.propTypes = {
  handleNewTextToSpeech: PropTypes.func,
  speechOutput: PropTypes.bool,
  speechOutputAlways: PropTypes.bool,
  speechPitch: PropTypes.number,
  speechRate: PropTypes.number,
  ttsLanguage: PropTypes.string,
  actions: PropTypes.object,
  userEmailId: PropTypes.string,
};

function mapStateToProps(store) {
  const userSettingsViewedByAdmin = store.settings.userSettingsViewedByAdmin;
  const { email } = userSettingsViewedByAdmin;
  const settings = email !== '' ? userSettingsViewedByAdmin : store.settings;
  return {
    speechOutput: settings.speechOutput,
    speechOutputAlways: settings.speechOutputAlways,
    ttsLanguage: settings.ttsLanguage,
    speechPitch: settings.speechPitch,
    speechRate: settings.speechRate,
    userEmailId: email, // Admin access : email Id of the user being accesed
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...settingActions, ...uiActions }, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SpeechTab);
