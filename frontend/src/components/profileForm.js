import { createElement } from '../utils/mini_react.js';

export function ProfileForm() {
  return createElement(
    'div',
    { id: 'profile-form', className: 'form-container' },
    createElement('h5', { className: 'text-center' }, 'Pilot Profile'),
    createElement(
      'span',
      {
        className: 'background-central-span d-flex flex-column align-items-center flex-grow-1 p-4',
      },
      // Profile Information
      createElement(
        'div',
        {
          className:
            'profile-info d-flex justify-content-evenly align-items-center w-100 m-3 pb-3',
        },
        // Profile Picture
        createElement(
          'div',
          { className: 'profile-pic-container' },
          createElement(
            'a',
            { href: '#' },
            createElement('img', {
              src: 'https://via.placeholder.com/150',
              alt: 'Profile Picture',
              className: 'profile-pic rounded-circle',
            })
          )
        ),
        // Profile Details
        createElement(
          'div',
          { className: 'profile-details modifiable-pilot text-start' },
          // Profile Status
          createElement(
            'div',
            { className: 'profile-status mb-2' },
            createElement('span', {
              className: 'status-indicator bi bi-circle-fill text-success',
            }),
            createElement(
              'form',
              { action: '#', method: 'post', className: 'd-inline-block' },
              createElement('input', {
                type: 'text',
                className:
                  'profile-pseudo-input form-control form-control-sm d-inline-block w-auto fw-bold',
                name: 'profile-pseudo',
                value: 'Pseudo',
                required: true,
              })
            )
          ),
          // Profile Statistics
          createElement(
            'div',
            { className: 'profile-stats' },
            createElement(
              'div',
              { className: 'stat-item d-flex align-items-center mb-1' },
              createElement('span', { className: 'bi bi-trophy me-2' }),
              createElement('span', { className: 'stat-title' }, 'Winrate:'),
              createElement('span', { className: 'stat-value ms-1' }, '50%')
            ),
            createElement(
              'div',
              { className: 'stat-item d-flex align-items-center' },
              createElement('span', { className: 'bi bi-award me-2' }),
              createElement('span', { className: 'stat-title' }, 'Rank:'),
              createElement('span', { className: 'stat-value ms-1' }, '1')
            )
          )
        )
      ),
      createElement('span', { className: 'panel-mid' }),
      // Match History
      createElement(
        'div',
        { className: 'profile-match-history mt-2 w-100 d-flex flex-column' },
        createElement(
          'h6',
          { className: 'match-history-title d-flex justify-content-center m-3' },
          createElement('span', { className: 'bi bi-journal me-2' }),
          'Match History'
        ),
        createElement(
          'div',
          {
            className: 'match-history-container d-flex flex-column',
            style: 'max-height: 40vh; overflow-y: auto;',
          },
          // Match History Header
          createElement(
            'div',
            { className: 'match-history-header d-flex fw-bold' },
            createElement('span', { className: 'col-2' }, 'Outcome'),
            createElement('span', { className: 'col-2' }, 'Game Mode'),
            createElement('span', { className: 'col-2' }, 'Duration'),
            createElement('span', { className: 'col-2' }, 'Date'),
            createElement('span', { className: 'col-4' }, 'Opponents')
          ),
          // Match Items
          createElement(
            'div',
            { className: 'match-item d-flex' },
            createElement('span', { className: 'col-2 text-success fw-bold' }, 'Win'),
            createElement('span', { className: 'col-2' }, '1v1'),
            createElement('span', { className: 'col-2' }, '10min'),
            createElement('span', { className: 'col-2' }, '01/01/2022'),
            createElement('span', { className: 'col-4' }, 'Opponent')
          ),
          createElement(
            'div',
            { className: 'match-item d-flex' },
            createElement('span', { className: 'col-2 text-danger fw-bold' }, 'Loss'),
            createElement('span', { className: 'col-2' }, '2v2'),
            createElement('span', { className: 'col-2' }, '20min'),
            createElement('span', { className: 'col-2' }, '01/01/2022'),
            createElement('span', { className: 'col-4' }, 'Opponent 1, Opponent 2')
          ),
          createElement(
            'div',
            { className: 'match-item d-flex' },
            createElement('span', { className: 'col-2 text-danger fw-bold' }, 'Loss'),
            createElement('span', { className: 'col-2' }, '2v2'),
            createElement('span', { className: 'col-2' }, '20min'),
            createElement('span', { className: 'col-2' }, '01/01/2022'),
            createElement('span', { className: 'col-4' }, 'Opponent 1, Opponent 2')
          )
        )
      )
    )
  );
}
