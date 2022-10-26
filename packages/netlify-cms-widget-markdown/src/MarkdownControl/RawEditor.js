import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import styled from '@emotion/styled';
import { ClassNames } from '@emotion/core';
import { debounce } from 'lodash';
import Plain from 'slate-plain-serializer';
import isHotkey from 'is-hotkey';
import { lengths, fonts } from 'netlify-cms-ui-default';

import { markdownToHtml } from '../serializers';
import { editorStyleVars, EditorControlBar } from '../styles';
import Toolbar from './Toolbar';

function rawEditorStyles({ minimal }) {
  return `
  position: relative;
  resize: auto;
  overflow-x: auto;
  min-height: ${minimal ? 'auto' : lengths.richTextEditorMinHeight};
  font-family: ${fonts.mono};
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-top: 0;
  margin-top: -${editorStyleVars.stickyDistanceBottom};
`;
}

const RawEditorContainer = styled.div`
  position: relative;
`;

export default class RawEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value || '',
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.value !== nextState.value ||
      nextProps.value !== nextState.value
    );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  componentDidMount() {
    if (this.props.pendingFocus) {
      this.editor.focus();
      this.props.pendingFocus();
    }
  }

  handleChange = e => {
    const val = e.target.value;
    if (this.state.value !== val) {
      this.handleDocumentChange(val);
    }
    this.setState({ value: val });
  };

  /**
   * When the document value changes, pass that up as the new value.
   */
  handleDocumentChange = debounce(value => {
    this.props.onChange(value);
  }, 150);

  handleToggleMode = () => {
    this.props.onMode('rich_text');
  };

  processRef = ref => {
    this.editor = ref;
  };

  render() {
    const { className, field, isShowModeToggle, t } = this.props;
    return (
      <RawEditorContainer>
        <EditorControlBar>
          <Toolbar
            onToggleMode={this.handleToggleMode}
            buttons={field.get('buttons')}
            disabled
            rawMode
            isShowModeToggle={isShowModeToggle}
            t={t}
          />
        </EditorControlBar>
        <ClassNames>
          {({ css, cx }) => (
            <textarea
              ref={this.processRef}
              className={cx(
                className,
                css`
                  ${rawEditorStyles({ minimal: field.get('minimal') })}
                `,
              )}
              value={this.state.value}
              onChange={this.handleChange}
            />
          )}
        </ClassNames>
      </RawEditorContainer>
    );
  }
}

RawEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
  onMode: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
  value: PropTypes.string,
  field: ImmutablePropTypes.map.isRequired,
  isShowModeToggle: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};
