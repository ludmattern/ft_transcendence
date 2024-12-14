import { createElement } from '/src/utils/mini_react.js';

export function SocialForm() {
  return createElement(
    'div',
    { id: 'social-form', className: 'form-container' },
    createElement('h5', { className: 'text-center' }, 'Social'),
    createElement(
      'span',
      {
        className: 'background-central-span d-flex flex-column align-items-center flex-grow-1 p-4',
      },
      // Friend List
      createElement(
        'div',
        { className: 'social-friend-list w-100 d-flex flex-column p-4 mb-4' },
        createElement(
          'h6',
          { className: 'friend-list-title d-flex justify-content-center mb-4' },
          createElement('span', { className: 'bi bi-people me-2' }),
          'Friend List'
        ),
        createElement(
          'div',
          {
            className: 'friend-list-container d-flex flex-column',
            style: 'max-height: 18vh; overflow-y: auto;',
          },
          // Friend Item
          createElement(
            'div',
            {
              className:
                'friend-item d-flex justify-content-between align-items-center px-3',
            },
            createElement(
              'div',
              { className: 'd-flex align-items-center' },
              createElement('span', {
                className: 'status-indicator bi bi-circle-fill text-success me-2',
              }),
              createElement('span', { className: 'profile-pseudo fw-bold' }, 'Pseudo')
            ),
            createElement(
              'div',
              { className: 'd-flex' },
              createElement(
                'button',
                {
                  className: 'btn btn-sm bi bi-person me-2',
                  id: 'other-profile-link',
                },
                'Profile'
              ),
              createElement(
                'button',
                { className: 'btn btn-sm bi bi-person-dash danger', id: 'remove-link' },
                'Remove'
              )
            )
          )
        )
      ),
      createElement('span', { className: 'panel-mid' }),
      // Pilot List
      createElement(
        'div',
        { className: 'social-pilot-list w-100 d-flex flex-column p-4 mt-4' },
        createElement(
          'h6',
          { className: 'pilot-list-title d-flex justify-content-center mb-4' },
          createElement('span', { className: 'bi bi-card-list me-2' }),
          'Pilot List'
        ),
        // Search Bar
        createElement(
          'div',
          {
            className: 'd-flex justify-content-center mb-4',
            style: 'flex-wrap: wrap;',
          },
          createElement('input', {
            type: 'text',
            id: 'search-bar',
            name: 'search-bar',
            className: 'form-control w-50 me-2',
            placeholder: 'Search for a pilot',
            required: true,
          }),
          createElement(
            'button',
            { className: 'btn btn-sm bi bi-search', id: 'search-link' },
            'Search'
          )
        ),
        createElement(
          'div',
          {
            className: 'pilot-list-container d-flex flex-column',
            style: 'max-height: 18vh; overflow-y: auto;',
          },
          // Pilot Item
          createElement(
            'div',
            {
              className:
                'pilot-item d-flex justify-content-between align-items-center px-3',
            },
            createElement(
              'div',
              { className: 'd-flex align-items-center' },
              createElement('span', {
                className: 'status-indicator bi bi-circle-fill text-success me-2',
              }),
              createElement('span', { className: 'profile-pseudo fw-bold' }, 'Pseudo')
            ),
            createElement(
              'div',
              { className: 'd-flex' },
              createElement(
                'button',
                { className: 'btn btn-sm bi bi-person me-2', id: 'profile-link' },
                'Profile'
              ),
              createElement(
                'button',
                { className: 'btn btn-sm bi bi-person-add', id: 'add-link' },
                'Add'
              )
            )
          )
        )
      )
    )
  );
}
