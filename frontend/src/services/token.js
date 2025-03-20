window.onload = function () {
	const ALLOWED_ORIGIN = '__CONFIG__ALLOWED_ORIGIN';
	if (window.opener) {
		window.opener.postMessage({ authenticated: true, token: '{token_str}' }, ALLOWED_ORIGIN);
		window.close();
	} else {
		window.location.href = '/';
	}
};
