import { createElement } from '/src/utils/mini_react.js';

export function SettingsForm() {
  return createElement(
    'div',
    { id: 'settings-form', className: 'form-container' },
    createElement('h5', {}, 'SETTINGS'),
    createElement(
      'span',
      { className: 'background-central-span' },
      createElement(
        'form',
        { action: '#', method: 'post', className: 'w-100' },
        createElement(
          'div',
          { className: 'form-group' },
          createElement('label', { className: 'mb-3', htmlFor: 'old-password' }, 'Old password'),
          createElement('input', {
            type: 'password',
            id: 'old-password',
            name: 'old-password',
            className: 'form-control',
            required: true,
          })
        ),
        createElement(
          'div',
          { className: 'form-group' },
          createElement('label', { className: 'mb-3', htmlFor: 'new-password' }, 'New Password'),
          createElement('input', {
            type: 'password',
            id: 'new-password',
            name: 'new-password',
            className: 'form-control',
            required: true,
          })
        ),
        createElement(
          'div',
          { className: 'form-group' },
          createElement(
            'label',
            { className: 'mb-3', htmlFor: 'confirm-new-password' },
            'Confirm new password'
          ),
          createElement('input', {
            type: 'password',
            id: 'confirm-new-password',
            name: 'confirm-new-password',
            className: 'form-control',
            required: true,
          })
        ),
        createElement(
          'div',
          { className: 'form-group' },
          createElement('label', { className: 'mb-3', htmlFor: 'new-email' }, 'New Email'),
          createElement('input', {
            type: 'email',
            id: 'new-email',
            name: 'new-email',
            className: 'form-control',
            required: true,
          })
        ),
        createElement(
          'div',
          { className: 'form-group' },
          createElement(
            'label',
            { className: 'mb-3', htmlFor: 'confirm-new-email' },
            'Confirm new Email'
          ),
          createElement('input', {
            type: 'email',
            id: 'confirm-new-email',
            name: 'confirm-new-email',
            className: 'form-control',
            required: true,
          })
        ),
        createElement(
          'div',
          { className: 'form-group' },
          createElement('label', { className: 'mb-3', htmlFor: 'language' }, 'Language'),
          createElement(
            'select',
            {
              id: 'language',
              name: 'language',
              className: 'form-control p-3',
              required: true,
            },
            createElement('option', { value: 'french' }, 'French'),
            createElement('option', { value: 'english' }, 'English'),
            createElement('option', { value: 'german' }, 'German')
          )
        ),
        createElement(
          'button',
          { className: 'btn bi bi-arrow-repeat' },
          'update'
        )
      ),
      createElement(
        'div',
        {},
        createElement(
          'span',
          {},
          createElement(
            'p',
            {},
            'Delete Account? ',
            createElement(
              'a',
              { href: '#', id: 'delete-account-link', className: 'text-info' },
              'resign'
            )
          )
        )
      )
    )
  );
}
