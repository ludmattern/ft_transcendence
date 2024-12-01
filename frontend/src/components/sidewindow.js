import { createElement } from '../utils/mini_react.js';

// Generates a nav item with a link
function createNavItem(label, active = false) {
  return createElement(
    'li',
    { className: 'nav-item' },
    createElement(
      'span',
      { className: `nav-link ${active ? 'active' : ''}` },
      createElement('a', { href: '#' }, label)
    )
  );
}

// Generates a tab panel with multiple panel items
function createTabPanel(items) {
  return createElement(
    'div',
    { className: 'tab-panel active' },
    items.map((item) => createPanelItem(item))
  );
}

// Generates a panel item
function createPanelItem(item) {
  return createElement(
    'div',
    { className: 'panel-item' },
    createElement(
      'span',
      {},
      `New tournament invite from : `,
      createElement('b', {}, item.inviter)
    ),
    item.actions
      ? createElement(
          'div',
          { className: 'actions' },
          createElement('button', { className: 'btn bi bi-check' }, 'accept'),
          createElement('button', { className: 'btn bi bi-x' }, 'refuse')
        )
      : null
  );
}

// Generates the tab content section (multiple tabs)
function createTabContent(infoItems, commItems) {
  return [
    createElement(
      'div',
      { className: 'tab-content info-content d-none' },
      createTabPanel(infoItems)
    ),
    createElement(
      'div',
      { className: 'tab-content comm-content' },
      createTabPanel(commItems),
      createElement('span', { className: 'panel-end' })
    ),
  ];
}

// Generates the entire side window
export function SideWindow() {
  const infoItems = [
    { inviter: 'LOSSALOS', actions: true },
    { inviter: 'LOSSALOS', actions: true },
    { inviter: 'LOSSALOS', actions: false },
    { inviter: 'LOSSALOS', actions: false },
    { inviter: 'LOSSALOS', actions: true },
    { inviter: 'LOSSALOS', actions: true },
    {
      inviter:
        'LOSSALOSLOSSALOSLOSSALOSLOSSALOSLOSSALOSLOSSALOSLOSSALOSLOSSALOSLOSSALOS',
      actions: true,
    },
    { inviter: 'LOSSALOS', actions: true },
  ];

  const commItems = [
    { inviter: 'LOSSALOS', actions: true },
    { inviter: 'LOSSALOS', actions: true },
    { inviter: 'LOSSALOS', actions: false },
    { inviter: 'LOSSALOS', actions: false },
    { inviter: 'LOSSALOS', actions: true },
    { inviter: 'LOSSALOS', actions: true },
    {
      inviter:
        'LOSSALOSLOSSALOSLOSSALOSLOSSALOSLOSSALOSLOSSALOSLOSSALOSLOSSALOSLOSSALOS',
      actions: true,
    },
    { inviter: 'LOSSALOS', actions: true },
  ];

  return createElement(
    'div',
    { className: 'side-window left-side-window' },
    createElement(
      'ul',
      { className: 'nav nav-tabs' },
      createNavItem('INFO', true),
      createNavItem('COMM', false),
      createElement(
        'li',
        { className: 'nav-item' },
        createElement(
          'div',
          { className: 'container' },
          createElement(
            'div',
            { className: 'side-window-expander active', id: 'l-sw-expander' },
            createElement('span', { className: 'line' }),
            createElement('span', { className: 'line' }),
            createElement('span', { className: 'line' })
          )
        )
      )
    ),
    ...createTabContent(infoItems, commItems)
  );
}
