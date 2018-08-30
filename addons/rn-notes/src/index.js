import addons, { makeDecorator } from '@storybook/addons';

export const withNotes = makeDecorator({
  name: 'withNotes',
  parameterName: 'notes',
  allowDeprecatedUsage: true,
  wrapper: (getStory, context, { options, parameters }) => {
    const channel = addons.getChannel();

    const storyOptions = parameters || options;

    if (!storyOptions) {
      setTimeout(() => channel.emit('storybook/notes/add_notes', ''), 0);

      return getStory(context);
    }

    const { text, markdown } =
      typeof storyOptions === 'string' ? { text: storyOptions } : storyOptions;

    if (!text && !markdown) {
      throw new Error('You must set of one of `text` or `markdown` on the `notes` parameter');
    }

    setTimeout(() => channel.emit('storybook/notes/add_notes', text || markdown), 0);

    return getStory(context);
  },
});

export const withMarkdownNotes = (text, options) =>
  withNotes({
    markdown: text,
    markdownOptions: options,
  });
