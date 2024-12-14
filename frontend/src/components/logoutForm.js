import { createElement } from '/src/utils/mini_react.js';

export function LogoutForm() {
  return createElement(
    'div',
    { id: 'logout-form', className: 'form-container' },
    createElement('h5', {}, 'LOG OUT'),
    createElement(
      'span',
      { className: 'background-central-span' },
      createElement('p', {}, 'Are you sure you want to logout ?'),
      createElement(
        'div',
        { className: 'd-flex justify-content-center' },
        createElement(
          'button',
          {
            className: 'btn bi bi-x',
            id: 'confirm-delete',
          },
          'No'
        ),
        createElement(
          'button',
          {
            className: 'btn bi bi-check danger',
            id: 'cancel-delete',
          },
          'Yes'
        )
      )
    )
  );
}
