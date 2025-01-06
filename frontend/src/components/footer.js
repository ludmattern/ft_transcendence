import { createElement } from '/src/utils/mini_react.js';

export function Footer() {
  console.debug('creating Footer component');
  return createElement(
    'footer',
    { className: 'hud-footer' },
    createElement(
      'div',
      { className: 'row' },
      createElement(
        'div',
        { className: 'col-12' },
        createElement(
          'div',
          { className: 'd-flex justify-content-center' },
          createElement(
            'button',
            { className: 'btn bi mb-4 pb-4 pe-auto', id: 'free-view' },
            'free view'
          )
        ),
        createElement(
          'div',
          { className: 'body' },
          createElement(
            'div',
            { className: 'compass' },
            createElement('div', { className: 'points', id: 'points' }, ...createCompassPoints())
          )
        )
      )
    )
  );
}

function createCompassPoints() {
  const points = [
    'N', '', '15', '', '30', '', 'NE', '', '60', '', '75', '', 'E', '', '105', '', '120', '',
    'SE', '', '150', '', '165', '', 'S', '', '195', '', '210', '', 'SW', '', '240', '', '255', '',
    'W', '', '285', '', '300', '', 'NW', '', '330', '', '345', '', 'N'
  ];

  return points.map((text, index) =>
    createElement(
      'div',
      { className: `point${isBold(text) ? ' fw-bold' : ''}` },
      text
    )
  );
}

function isBold(text) {
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].includes(text);
}
