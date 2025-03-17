window.onload = function () {
    if (window.opener) {
        window.opener.postMessage({ authenticated: true, token: '{token_str}' }, '*');
        window.close();
    } else {
        window.location.href = '/';
    }
};
