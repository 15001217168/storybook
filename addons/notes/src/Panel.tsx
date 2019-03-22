import React, { ReactElement, Component, Fragment, ReactNode } from 'react';
import { types } from '@storybook/addons';
import { API, Consumer, Combo } from '@storybook/api';
import { styled } from '@storybook/theming';
import { PropTable } from '@storybook/components';
import { STORY_RENDERED } from '@storybook/core-events';

import {
  SyntaxHighlighter as SyntaxHighlighterBase,
  Placeholder,
  DocumentFormatting,
  Link,
} from '@storybook/components';
import Markdown from 'markdown-to-jsx';
import Giphy from './giphy';

import { PARAM_KEY, Parameters } from './shared';

const PropTableWrapper = styled.div({
  background: 'hotpink',
});

const propsMapper = ({ state, api }: Combo) => {
  const { storyId, storiesHash } = state;

  return { currentId: storyId, storiesHash, api };
};

interface In {
  currentId: string;
  api: API;
}

const PropTableConsumer = ({ id }: { id?: string }) => (
  <Consumer filter={propsMapper}>
    {({ currentId, api }: In) => {
      const component = api.getParameters(id || currentId, 'component');
      return (
        <PropTableWrapper>
          <PropTable
            type={PropTableWrapper}
            propDefinitions={component && component.propDefinitions}
            maxPropObjectKeys={10}
            maxPropArrayLength={10}
            maxPropStringLength={10}
          />
        </PropTableWrapper>
      );
    }}
  </Consumer>
);

const Panel = styled.div({
  padding: '3rem 40px',
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: 980,
  margin: '0 auto',
});

interface Props {
  active: boolean;
  api: API;
}

function read(param: Parameters | undefined): string | undefined {
  if (!param) {
    return undefined;
  }
  if (typeof param === 'string') {
    return param;
  }
  if ('disabled' in param) {
    return undefined;
  }
  if ('text' in param) {
    return param.text;
  }
  if ('markdown' in param) {
    return param.markdown;
  }
}

interface SyntaxHighlighterProps {
  className?: string;
  children: ReactElement;
  [key: string]: any;
}
export const SyntaxHighlighter = ({ className, children, ...props }: SyntaxHighlighterProps) => {
  // markdown-to-jsx does not add className to inline code
  if (typeof className !== 'string') {
    return <code>{children}</code>;
  }
  // className: "lang-jsx"
  const language = className.split('-');
  return (
    <SyntaxHighlighterBase language={language[1] || 'plaintext'} bordered copyable {...props}>
      {children}
    </SyntaxHighlighterBase>
  );
};

// use our SyntaxHighlighter component in place of a <code> element when
// converting markdown to react elements
const defaultOptions = {
  overrides: {
    code: SyntaxHighlighter,
    Giphy: {
      component: Giphy,
    },
    PropTable: {
      component: PropTableConsumer,
    },
  },
};

interface Overrides {
  overrides: {
    [type: string]: ReactNode;
  };
}
type Options = typeof defaultOptions & Overrides;

const mapper = ({ state, api }: Combo): { value?: string; options: Options } => {
  const extraElements = Object.entries(api.getElements(types.NOTES_ELEMENT)).reduce(
    (acc, [k, v]) => ({ ...acc, [k]: v.render }),
    {}
  );

  const options = {
    ...defaultOptions,
    overrides: { ...defaultOptions.overrides, ...extraElements },
  };

  const story = state.storiesHash[state.storyId];
  const value = read(story ? api.getParameters(story.id, PARAM_KEY) : undefined);

  return { options, value };
};

const NotesPanel = ({ active }: Props) => {
  if (!active) {
    return null;
  }

  return (
    <Consumer filter={mapper}>
      {({ options, value }: { options: Options; value?: string }) => {
        return value ? (
          <Panel className="addon-notes-container">
            <DocumentFormatting>
              <Markdown options={options}>{value}</Markdown>
            </DocumentFormatting>
          </Panel>
        ) : (
          <Placeholder>
            <Fragment>No notes yet</Fragment>
            <Fragment>
              Learn how to{' '}
              <Link
                href="https://github.com/storybooks/storybook/tree/master/addons/notes"
                target="_blank"
                withArrow
              >
                document components in Markdown
              </Link>
            </Fragment>
          </Placeholder>
        );
      }}
    </Consumer>
  );
};

export default NotesPanel;
