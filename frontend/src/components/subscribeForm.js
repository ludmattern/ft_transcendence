import { createElement } from '../utils/mini_react.js';
import { loadComponent } from '../utils/dom_utils.js';
import { LoginForm } from './loginForm.js';

export function SubscribeForm() {
  return createElement(
    'div',
    { id: 'subscribe-form', className: 'form-container' },
    createElement('h5', {}, 'PILOT IDENTIFICATION - REGISTER'),
    createElement(
      'span',
      { className: 'background-central-span' },
      createElement(
        'form',
        { action: '#', method: 'post', className: 'w-100' },
        createElement(
          'div',
          { className: 'form-group' },
          createElement('label', { className: 'mb-3', htmlFor: 'new-pilot-id' }, 'ID'),
          createElement('input', {
            type: 'text',
            id: 'new-pilot-id',
            name: 'new-pilot-id',
            className: 'form-control',
            required: true,
          })
        ),
        createElement(
          'div',
          { className: 'form-group' },
          createElement('label', { className: 'mb-3', htmlFor: 'new-password' }, 'Password'),
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
          createElement('label', { className: 'mb-3', htmlFor: 'confirm-password' }, 'Confirm Password'),
          createElement('input', {
            type: 'password',
            id: 'confirm-password',
            name: 'confirm-password',
            className: 'form-control',
            required: true,
          })
        ),
        createElement(
          'div',
          { className: 'form-group' },
          createElement('label', { className: 'mb-3', htmlFor: 'email' }, 'Email'),
          createElement('input', {
            type: 'email',
            id: 'email',
            name: 'email',
            className: 'form-control',
            required: true,
          })
        ),
        createElement(
          'div',
          { className: 'form-group' },
          createElement('label', { className: 'mb-3', htmlFor: 'confirm-email' }, 'Confirm Email'),
          createElement('input', {
            type: 'email',
            id: 'confirm-email',
            name: 'confirm-email',
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
          { type: 'submit', className: 'btn btn-block bi bi-check2-square' },
          'Register'
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
            'Already flown? ',
            createElement('a', { href: '#', id: 'login-link', className: 'text-info' }, 'Log In')
          )
        )
      )
    )
  );
}

// Event listener for the Log In link
document.addEventListener("DOMContentLoaded", () => {
	const loginLink = document.getElementById("login-link");
  
	if (loginLink) {
	  loginLink.addEventListener("click", function (e) {
		e.preventDefault();
		// Replace #central-window content with the LoginForm component
		loadComponent("#central-window", LoginForm, "", () => {
		  console.debug("LoginForm loaded on click.");
		});
	  });
	}
  });