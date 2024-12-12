import { createElement } from '../utils/mini_react.js';

export function LoginForm() {
  return createElement(
    'div',
    { id: 'login-form', className: 'form-container flex-column justify-content-around text-center active' },
    createElement('h5', {}, 'PILOT IDENTIFICATION - LOG IN'),
    createElement(
      'span',
      { className: 'background-central-span' },
      createElement(
        'form',
        { action: '#', method: 'post', className: 'w-100' },
        createElement(
          'div',
          { className: 'form-group' },
          createElement('label', { className: 'mb-3', htmlFor: 'pilot-id' }, 'ID'),
          createElement('input', {
            type: 'text',
            id: 'pilot-id',
            name: 'pilot-id',
            className: 'form-control',
            required: true,
          })
        ),
        createElement(
          'div',
          { className: 'form-group' },
          createElement('label', { className: 'mb-3', htmlFor: 'password' }, 'Password'),
          createElement('input', {
            type: 'password',
            id: 'password',
            name: 'password',
            className: 'form-control',
            required: true,
          })
        ),
        createElement('button', { className: 'btn bi bi-check' }, 'accept')
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
            'New pilot? ',
            createElement('a', { href: '#', id: 'enlist-link', className: 'text-info' }, 'Enlist')
          )
        )
      )
    )
  );
}
