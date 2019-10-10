import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import appActions from '../../../redux/actions/app';
import uiActions from '../../../redux/actions/ui';
import Card from '@material-ui/core/Card';
import _CardContent from '@material-ui/core/CardContent';
import Add from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import CircularLoader from '../../shared/CircularLoader';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import _Paper from '@material-ui/core/Paper';
import _EditBtn from '@material-ui/icons/Edit';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import getImageSrc from '../../../utils/getImageSrc';

const Container = styled.div`
  margin: 0rem 0.625rem;
  padding: 1.25rem 1.875rem 1.875rem;

  @media (max-width: 480px) {
    padding: 1.25rem 1rem 1.875rem;
  }
`;

const Paper = styled(_Paper)`
  width: 100%;
  padding: 0.938rem;
  margin-top: 1.25rem;
`;

const SkillCardWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  margin: 0.625rem;
`;

const CardContent = styled(_CardContent)`
  color: white;
  font-family: Helvetica;
  font-size: 1rem;
  padding-top: 1.25rem;
  width: 100%;
  text-align: center;
`;

const SkillActions = styled.div`
  display: none;
  margin-top: 2.5rem;

  @media (max-width: 1025px) {
    display: block;
    text-align: right;
    width: 100%;
  }
`;

const SkillCard = styled(Card)`
  display: block;
  margin: 0.625rem;
  width: 16.25rem;
  height: 11.188rem;
  padding: 4.125rem 0.625rem 0.625rem;
  position: relative;
  justify-content: center;
  text-align: center;

  &:hover ${SkillActions} {
    display: block;
    text-align: right;
    width: 100%;
  }

  @media (max-width: 480px) {
    margin: 0rem 0rem 0.625rem 0rem;
  }

  @media (max-width: 320px) {
    width: 13.75rem;
  }
`;

const SkillNameButton = styled(Button)`
  width: auto;
  max-width: 100%;
  display: flex;
  margin: 0rem auto;
`;

const EditBtn = styled(_EditBtn)`
  cursor: pointer;
`;

const H1 = styled.h1`
  color: rgba(0, 0, 0, 0.65);
  padding-left: 1.25rem;
`;

const SkillDraftWrap = styled.div`
  margin: 0.625rem;
  padding-left: 0.625rem;
`;

class SkillCreator extends Component {
  state = {
    loading: true,
    drafts: [],
  };

  componentDidMount() {
    this.loadSkills();
  }

  loadSkills = async () => {
    const { actions } = this.props;
    let dataObj = {
      filterName: 'ascending',
      filterType: 'lexicographical',
    };
    try {
      await actions.getUserSkills(dataObj);
      this.setState({
        loading: false,
      });
    } catch (error) {
      this.setState({
        loading: false,
      });
      actions.openSnackBar({
        snackBarMessage: "Error. Couldn't fetch skills.",
        snackBarDuration: 2000,
      });
    }
  };

  showSkills = () => {
    let skillsArray = [];
    let skills = this.props.userSkills;
    if (skills.length > 0) {
      skills.forEach(skill => {
        const { group, skillTag, language, image, skillName } = skill;
        const imageUrl = getImageSrc({
          relativePath: `model=general&language=${language}&group=${group.replace(
            / /g,
            '%20',
          )}&image=/${image}`,
        });
        skillsArray.push(
          <SkillCard
            key={skillName}
            style={{
              backgroundImage: 'url(' + imageUrl + ')',
              backgroundSize: 'cover',
              backgroundColor: '#000',
              opacity: '0.6',
            }}
          >
            <Link
              to={{
                pathname: `/${group}/${skillTag
                  .toLowerCase()
                  .replace(/ /g, '_')}/${language}`,
              }}
            >
              <SkillNameButton variant="contained" color="primary">
                <Typography noWrap={true}>{skillName}</Typography>
              </SkillNameButton>
            </Link>
            <SkillActions>
              <Link
                to={{
                  pathname: `/${group}/${skillTag
                    .toLowerCase()
                    .replace(/ /g, '_')}/edit/${language}`,
                }}
              >
                <EditBtn />
              </Link>
            </SkillActions>
          </SkillCard>,
        );
      });
    }
    return skillsArray;
  };

  render() {
    const { loading, drafts } = this.state;
    const { showTitle = true } = this.props;
    return (
      <Container>
        <Paper>
          {showTitle && (
            <H1>
              My Skills
              <br />
            </H1>
          )}
          <H1>Created Skills</H1>
          {loading ? (
            <CircularLoader height={5} />
          ) : (
            <SkillCardWrap>
              {this.showSkills()}
              <Link to="/skillWizard">
                <SkillCard
                  style={{
                    backgroundImage: 'url(/botTemplates/chat-bot.jpg)',
                    backgroundSize: 'cover',
                    backgroundColor: '#000',
                    opacity: '0.9',
                  }}
                >
                  <Fab
                    color="primary"
                    size="small"
                    style={{
                      boxShadow:
                        'rgba(0, 0, 0, 0.12) 0rem 0.063rem 0.375rem, rgba(0, 0, 0, 0.12) 0rem 0.063rem 0.25rem',
                    }}
                  >
                    <Add
                      style={{
                        height: '2.5rem',
                      }}
                    />
                  </Fab>
                  <CardContent>Create a new skill</CardContent>
                </SkillCard>
              </Link>
            </SkillCardWrap>
          )}
          <br />
          <H1>Drafts</H1>
          <SkillDraftWrap>
            {drafts.length > 0 ? (
              drafts
            ) : (
              <Typography>No drafts to display.</Typography>
            )}
          </SkillDraftWrap>
        </Paper>
      </Container>
    );
  }
}

SkillCreator.propTypes = {
  userSkills: PropTypes.array,
  actions: PropTypes.object,
  showTitle: PropTypes.bool,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...appActions, ...uiActions }, dispatch),
  };
}

function mapStateToProps({ app }) {
  const { userSkills } = app;
  return {
    userSkills,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SkillCreator);
