import { types } from '@storybook/addons';

export function ensurePanel(panels, selectedPanel, currentPanel) {
  const keys = Object.keys(panels);

  if (keys.indexOf(selectedPanel) >= 0) {
    return selectedPanel;
  }

  if (keys.length) {
    return keys[0];
  }
  return currentPanel;
}

export default function initPanels({ store, provider }) {
  // getters
  function getPanels() {
    return provider
      .getElements(types.PANEL)
      .reduce((acc, { id, ...item }) => ({ ...acc, [id]: item }), {});
  }

  function getSelectedPanel() {
    const { selectedPanelValue } = store.getState();
    const panels = getPanels();
    return ensurePanel(panels, selectedPanelValue, selectedPanelValue);
  }

  // setters
  function setSelectedPanel(value) {
    store.setState({ selectedPanelValue: value });
  }

  function selectPanel(panelName) {
    store.setState({ selectedPanel: panelName });
  }

  return {
    getSelectedPanel,
    setSelectedPanel,
    getPanels,
    selectPanel,
  };
}
