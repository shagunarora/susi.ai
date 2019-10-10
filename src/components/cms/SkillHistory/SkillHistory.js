import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fetchCommitHistory, fetchSkillByCommitId } from '../../../apis/index';
import { Link } from 'react-router-dom';
import AceEditor from 'react-ace';
import Diff from 'react-diff-viewer';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import uiActions from '../../../redux/actions/ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import 'brace/mode/markdown';
import 'brace/theme/github';
import 'brace/theme/monokai';
import 'brace/theme/tomorrow';
import 'brace/theme/kuroir';
import 'brace/theme/twilight';
import 'brace/theme/xcode';
import 'brace/mode/java';
import 'brace/theme/textmate';
import 'brace/theme/solarized_dark';
import 'brace/theme/solarized_light';
import 'brace/theme/terminal';
import 'brace/ext/searchbox';

import styled, { css } from 'styled-components';
import { Title } from '../../shared/Typography';
import CircularLoader from '../../shared/CircularLoader';

const ErrorNotification = () => {
  return this.props.actions.openSnackBar({
    snackBarMessage: 'Failed to fetch data. Please Try Again',
    snackBarPosition: { vertical: 'top', horizontal: 'right' },
    variant: 'error',
  });
};

export const VersionContainer = styled.div`
  margin-top: 20px;
  text-align: center;
  ${props =>
    props.floatLeft &&
    css`
      width: 50%;
      float: left;
      @media (max-width: 768px) {
        float: none;
        width: 100%;
      }
    `}
`;

const styles = {
  homeStyle: {
    width: '100%',
    padding: '80px 30px 30px',
  },
  codeEditorStyle: {
    width: '100%',
    marginTop: '20px',
  },
  compareBtnStyle: {
    margin: '20px',
    position: 'absolute',
    right: '24',
    top: '70',
  },
  paperStyle: {
    width: '100%',
    padding: '10px',
  },
};

let rightEditorWidth = '50%';
if (window.matchMedia('only screen and (max-width: 768px)').matches) {
  rightEditorWidth = '100%';
}

class SkillHistory extends Component {
  constructor(props) {
    super(props);
    let commits = [];
    const parsePath = this.props.location.pathname.split('/');
    commits.push(parsePath[4]);
    if (parsePath.length === 6) {
      commits.push(parsePath[5]);
    }
    this.state = {
      code:
        '::name <Skill_name>\n::author <author_name>\n::author_url <author_url>\n::description <description> \n::dynamic_content <Yes/No>\n::developer_privacy_policy <link>\n::image <image_url>\n::terms_of_use <link>\n\n\nUser query1|query2|quer3....\n!example:<The question that should be shown in public skill displays>\n!expect:<The answer expected for the above example>\nAnswer for the user query',
      skillMeta: {
        modelValue: 'general',
        groupValue: parsePath[1],
        languageValue: parsePath[4],
        skillName: parsePath[2],
      },
      commits: commits,
      commitData: [],
      allCommitsData: [],
    };
  }

  async componentDidMount() {
    document.title = 'SUSI.AI - Skill History';
    const {
      modelValue: model,
      groupValue: group,
      languageValue: language,
      skillName: skill,
    } = this.state.skillMeta;
    try {
      let commitsData = await fetchCommitHistory({
        model,
        group,
        language,
        skill,
      });
      if (commitsData.accepted) {
        let commits = commitsData.commits ? commitsData.commits : [];
        if (commits.length > 0) {
          commits[0].latest = true;
        }
        this.setState({
          allCommitsData: commits,
        });
        this.getCommitFiles();
      }
    } catch (error) {
      return <ErrorNotification />;
    }
  }

  getCommitMeta = commitID => {
    let allCommits = this.state.allCommitsData;
    for (let i = 0; i < allCommits.length; i++) {
      let commitData = allCommits[i];
      if (commitData.commitId === commitID) {
        return commitData;
      }
    }
  };

  getCommitFiles = async () => {
    const {
      modelValue: model,
      groupValue: group,
      languageValue: language,
      skillName: skill,
    } = this.state.skillMeta;
    const { commits } = this.state;
    if (commits.length === 2) {
      try {
        let data1 = await fetchSkillByCommitId({
          model,
          group,
          language,
          skill,
          commitID: commits[0],
        });
        try {
          let data2 = await fetchSkillByCommitId({
            model,
            group,
            language,
            skill,
            commitID: commits[1],
          });

          this.updateData([
            {
              code: data1.file,
              commit: this.getCommitMeta(commits[0]),
            },
            {
              code: data2.file,
              commit: this.getCommitMeta(commits[1]),
            },
          ]);
        } catch (error) {
          return <ErrorNotification />;
        }
      } catch (error) {
        return <ErrorNotification />;
      }
    }
  };

  updateData = commitData => {
    this.setState({
      commitData: commitData,
    });
  };

  render() {
    const { commitData, skillMeta, allCommitsData } = this.state;
    const { homeStyle, codeEditorStyle, paperStyle, compareBtnStyle } = styles;
    return (
      <div>
        {commitData.length === 0 && <CircularLoader />}
        <div style={homeStyle}>
          {commitData.length === 2 && (
            <div style={{ display: 'block' }}>
              <Paper style={paperStyle} zDepth={1}>
                <div>
                  <div>
                    Currently Viewing :{' '}
                    <Link
                      to={{
                        pathname:
                          '/' +
                          skillMeta.groupValue +
                          '/' +
                          skillMeta.skillName +
                          '/' +
                          skillMeta.languageValue,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        style={compareBtnStyle}
                      >
                        Back
                      </Button>
                    </Link>
                  </div>
                  <h3 style={{ textTransform: 'capitalize' }}>
                    {skillMeta.skillName.split('_').join(' ')}
                  </h3>
                </div>
              </Paper>
              <VersionContainer floatLeft>
                <span>
                  commitID: <b>{commitData[0].commit.commitId}</b>
                </span>
                <br />
                <span>
                  {commitData[0].commit.latest && 'Latest '}
                  Revision as of <b>{commitData[0].commit.commitDate}</b>
                </span>
                <div style={codeEditorStyle}>
                  <AceEditor
                    mode="java"
                    readOnly={true}
                    theme="github"
                    width="100%"
                    fontSize={14}
                    height="400px"
                    value={commitData[0].code}
                    showPrintMargin={false}
                    name="skill_code_editor"
                    scrollPastEnd={false}
                    wrapEnabled={true}
                    editorProps={{ $blockScrolling: true }}
                    style={{
                      resize: 'vertical',
                      overflowY: 'auto',
                      minHeight: '200px',
                    }}
                  />
                </div>
              </VersionContainer>
              <VersionContainer>
                <span>
                  commitID: <b>{commitData[1].commit.commitId}</b>
                </span>
                <br />
                <span>
                  {commitData[1].commit.latest && 'Latest '}
                  Revision as of <b>{commitData[1].commit.commitDate}</b>
                  <b style={{ marginLeft: '5px' }}>
                    (
                    <Link
                      to={{
                        pathname:
                          '/' +
                          skillMeta.groupValue +
                          '/' +
                          skillMeta.skillName +
                          '/edit/' +
                          skillMeta.languageValue +
                          '/' +
                          allCommitsData[0].commitId +
                          '/' +
                          commitData[0].commit.commitId,
                      }}
                    >
                      Undo
                    </Link>
                    )
                  </b>
                </span>
                <div style={codeEditorStyle}>
                  <AceEditor
                    mode="java"
                    readOnly={true}
                    theme="github"
                    width={rightEditorWidth}
                    fontSize="14"
                    height="400px"
                    value={commitData[1].code}
                    showPrintMargin={false}
                    name="skill_code_editor"
                    scrollPastEnd={false}
                    wrapEnabled={true}
                    editorProps={{ $blockScrolling: true }}
                    style={{
                      resize: 'vertical',
                      overflowY: 'auto',
                      minHeight: '200px',
                    }}
                  />
                </div>
              </VersionContainer>
              <div>
                <Title marginTop>Changes</Title>
                {/* latest code should be inputB */}
                <Diff
                  inputA={commitData[0].code}
                  inputB={commitData[1].code}
                  type="chars"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

SkillHistory.propTypes = {
  location: PropTypes.object,
  actions: PropTypes.object,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(uiActions, dispatch),
  };
}

export default connect(
  null,
  mapDispatchToProps,
)(SkillHistory);
