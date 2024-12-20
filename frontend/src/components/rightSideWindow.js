import { createElement } from '/src/utils/mini_react.js';

// Generates a nav item with a link
function createNavItem(label, value, active = false) {
  return createElement(
    'li',
    { className: 'nav-item', 'nav': value },
    createElement(
      'span',
      { className: `nav-link ${active ? 'active' : ''}` },
      createElement('a', { href: '#', 'data-tab': label.toLowerCase() }, label)
    )
  );
}

export function RightSideWindow() {
  return createElement(
    'div',
    { className: 'col-md-2-5 d-flex flex-column' },
    createElement(
      'div',
      { className: 'r-side-window right-side-window' },
      createElement(
        'ul',
        { className: 'nav nav-tabs' },
        createNavItem('OVERVIEW', 1, true),
        createElement(
          'li',
          { className: 'nav-item' },
          createElement(
            'div',
            { className: 'container' },
            createElement(
              'div',
              {
                className: 'right-side-window-expander active',
                id: 'r-sw-expander',
              },
              createElement('span', { className: 'r-line' }),

              createElement('span', { className: 'r-line' }),
              createElement('span', { className: 'r-line' })
            )
          )
        )
      ),
      createElement('div', { className: 'r-tab-content', id: 'r-tab-content' },
        createElement('div', {className: 'wireframe', id: 'wireframe'}),
      )
      
    )
  );
}

