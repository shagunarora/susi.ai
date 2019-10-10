import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DialogActions from '@material-ui/core/DialogActions';
import CloseButton from '../shared/CloseButton';
import Button from '@material-ui/core/Button';
import Translate from '../Translate/Translate.react';
import OutlinedTextField from '../shared/OutlinedTextField';
import { Col, Row } from 'react-flexbox-grid';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import uiActions from '../../redux/actions/ui';
import settingActions from '../../redux/actions/settings';
import PropTypes from 'prop-types';
import PreviewThemeChat from './PreviewThemeChat';
import { setUserSettings } from '../../apis';
import _ from 'lodash';
import styled from 'styled-components';
import ColorPickerComponent from '../shared/ColorPickerComponent';

const Container = styled.div`
  display: flex;
  padding: 0.625rem;
  height: 35rem;
  justify-content: space-evenly;
  align-items: center;
  @media (max-width: 520px) {
    display: block;
  }
`;

const PreviewChatContainer = styled.div`
  overflow: hidden;
  right: 0px;
  padding: 0.625rem;
  @media (max-width: 520px) {
    width: 90%;
    margin: 0 auto;
  }
`;

const ThemeChangerContainer = styled.div`
  width: 62%;
  @media (max-width: 520px) {
    width: 100%;
  }
`;

const ThemePropertyContainer = styled.div`
  margin: 0 auto;
  position: relative;
  text-align: left;
`;

const componentsList = [
  { id: 1, component: 'pane', name: 'Change Background' },
  { id: 2, component: 'header', name: 'Chat Header' },
  { id: 3, component: 'body', name: 'Chat Body' },
  { id: 4, component: 'composer', name: 'Message Composer' },
  { id: 5, component: 'textarea', name: 'User Textarea' },
  { id: 6, component: 'button', name: 'User Button' },
];

class ThemeChanger extends Component {
  constructor(props) {
    super(props);
    const {
      header,
      pane,
      body,
      composer,
      textarea,
      button,
      messageBackgroundImage,
    } = this.props.customThemeValue;
    const showMessageBackgroundImage = messageBackgroundImage !== '';
    this.state = {
      header,
      pane,
      body,
      composer,
      textarea,
      button,
      backgroundImage: '',
      messageBackgroundImage,
      showMessageBackgroundImage,
    };

    this.initialValue = {
      header,
      pane,
      body,
      composer,
      textarea,
      button,
      backgroundImage: '',
      messageBackgroundImage,
      showMessageBackgroundImage,
    };
  }

  handleChangeMessageBackgroundImage = name => e => {
    const { value } = e.target;
    this.setState({ [name]: value });
  };

  // get the selected custom colour
  handleChangeComplete = (name, color) => {
    if (color) {
      this.setState({ currTheme: 'custom' });
      if (!color.startsWith('#')) {
        color = '#' + color;
      }
      // Send these Settings to Server
      let state = this.state;

      if (name === 'header') {
        state.header = color;
        this.customTheme.header = state.header.substring(1);
      } else if (name === 'body') {
        state.body = color;
        this.customTheme.body = state.body.substring(1);
      } else if (name === 'pane') {
        state.pane = color;
        this.customTheme.pane = state.pane.substring(1);
      } else if (name === 'composer') {
        state.composer = color;
        this.customTheme.composer = state.composer.substring(1);
      } else if (name === 'textarea') {
        state.textarea = color;
        this.customTheme.textarea = state.textarea.substring(1);
      } else if (name === 'button') {
        state.button = color;
        this.customTheme.button = state.button.substring(1);
      }
      this.setState(state);
      document.body.style.setProperty('background-color', this.state.body);
    }
  };

  handleReset = () => {
    const { actions } = this.props;
    this.setState(prevState => ({ ...prevState, ...this.initialValue }));
    actions.openSnackBar({ snackBarMessage: 'Custom theme settings reset' });
  };

  // Send data to server, update settings
  handleSubmit = async () => {
    const { actions } = this.props;
    let {
      header,
      pane,
      body,
      composer,
      textarea,
      button,
      backgroundImage,
      messageBackgroundImage,
    } = this.state;

    const payloadToStore = {
      messageBackgroundImage,
      backgroundImage,
      customThemeValue: {
        header,
        pane,
        body,
        composer,
        textarea,
        button,
      },
    };

    const customThemeValue = `${header.substring(1)},${pane.substring(
      1,
    )},${body.substring(1)},${composer.substring(1)},${textarea.substring(
      1,
    )},${button.substring(1)}`;

    const payloadToServer = {
      ...payloadToStore,
      customThemeValue,
    };
    try {
      let data = await setUserSettings(payloadToServer);
      if (data.accepted) {
        actions.openSnackBar({
          snackBarMessage: 'Settings updated',
        });
        actions.closeModal();
        actions.setUserSettings(payloadToStore);
      } else {
        actions.openSnackBar({
          snackBarMessage: 'Failed to save Settings',
        });
      }
    } catch (error) {
      actions.openSnackBar({
        snackBarMessage: 'Failed to save Settings',
      });
    }
  };

  handleClickColorBox = id => {
    document.getElementById(`colorPicker${id}`).click();
  };

  showMessageBackgroundImageToggle = () => {
    this.setState(prevState => ({
      showMessageBackgroundImage: !prevState.showMessageBackgroundImage,
    }));
  };

  render() {
    const { actions } = this.props;
    const {
      header,
      pane,
      body,
      composer,
      textarea,
      button,
      showMessageBackgroundImage,
      messageBackgroundImage,
      backgroundImage,
    } = this.state;

    const disabled = _.isEqual(
      {
        header,
        pane,
        body,
        composer,
        textarea,
        button,
        showMessageBackgroundImage,
        messageBackgroundImage,
        backgroundImage,
      },
      this.initialValue,
    );
    const components = componentsList.map(component => {
      return (
        <ThemePropertyContainer key={component.id}>
          <Row style={{ marginBottom: '15px' }}>
            <Col xs={6} md={6} lg={6}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    fontSize: '18px',
                    paddingTop: '12px',
                    fontWeight: '400',
                    color: 'rgba(0,0,0,.85)',
                  }}
                >
                  {component.name}
                </div>
                {component.id === 1 && (
                  <div style={{ marginTop: '-1px' }}>
                    <span
                      style={{ paddingRight: '0.7rem' }}
                      onClick={this.showMessageBackgroundImageToggle}
                    >
                      Color
                    </span>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showMessageBackgroundImage}
                          onChange={this.showMessageBackgroundImageToggle}
                        />
                      }
                      label="Image"
                    />
                  </div>
                )}
              </div>
            </Col>
            <Col xs={6} md={6} lg={6} style={{ marginTop: '10px' }}>
              {(component.id !== 1 ||
                (component.id === 1 && !showMessageBackgroundImage)) && (
                <ColorPickerComponent
                  component={component.component}
                  id={component.id}
                  handleChangeColor={this.handleChangeComplete}
                  backgroundColor={this.state[component.component]}
                  handleClickColorBox={this.handleClickColorBox}
                />
              )}
              {component.id === 1 && showMessageBackgroundImage && (
                <OutlinedTextField
                  margin="dense"
                  name="messageImg"
                  onChange={this.handleChangeMessageBackgroundImage(
                    'messageBackgroundImage',
                  )}
                  value={messageBackgroundImage}
                  label={'Message Image URL'}
                />
              )}
            </Col>
          </Row>
        </ThemePropertyContainer>
      );
    });
    return (
      <div>
        <div style={{ overflowY: 'auto' }}>
          <Container>
            <ThemeChangerContainer>{components}</ThemeChangerContainer>
            <PreviewChatContainer>
              <PreviewThemeChat
                header={header}
                pane={pane}
                messageBackgroundImage={messageBackgroundImage}
                body={body}
                bodyBackgroundImage={backgroundImage}
                composer={composer}
                textarea={textarea}
                button={button}
              />
            </PreviewChatContainer>
          </Container>
          <CloseButton onClick={actions.closeModal} />
        </div>
        <DialogActions>
          <Button
            onClick={this.handleSubmit}
            style={{ margin: '0 5px' }}
            variant="contained"
            color="primary"
            disabled={disabled}
          >
            <Translate text="Save" />
          </Button>
          <Button
            onClick={this.handleReset}
            style={{ margin: '0 5px' }}
            variant="contained"
            color="primary"
          >
            <Translate text="Reset" />
          </Button>
        </DialogActions>
      </div>
    );
  }
}

ThemeChanger.propTypes = {
  actions: PropTypes.object,
  customThemeValue: PropTypes.object,
  backgroundImage: PropTypes.string,
  messageBackgroundImage: PropTypes.string,
};

function mapStateToProps(store) {
  return {
    customThemeValue: store.settings.customThemeValue,
    backgroundImage: store.settings.backgroundImage,
    messageBackgroundImage: store.settings.messageBackgroundImage,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...uiActions, ...settingActions }, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ThemeChanger);
