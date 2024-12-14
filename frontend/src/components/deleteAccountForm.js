import { createElement } from '/src/utils/mini_react.js';

export function DeleteAccountForm() {
  return createElement(
    'div',
    { id: 'delete-account-form', className: 'form-container' },
    createElement('h5', {}, 'RESIGN'),
    createElement(
      'span',
      { className: 'background-central-span' },
      createElement(
        'p',
        {},
        "Are you sure you want to delete your account ?"
      ),
      createElement(
        'p',
        {},
        "This action can't be reversed."
      ),
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
