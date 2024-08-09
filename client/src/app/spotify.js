import * as auth from './auth.js';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export async function initialize() {
	// On page load, try to fetch auth code from current browser search URL
	const params = new URLSearchParams(window.location.search);
	const code = params.get('code');

	// If we find a code, we're in a callback, do a token exchange
	if (code) {
		await auth.getToken(code);

		// Remove code from URL so we can refresh correctly.
		const url = new URL(window.location.href);
		url.searchParams.delete('code');
		window.history.replaceState({}, document.title, url.toString());
	}

	const data = {};
	if (auth.currentToken.access_token) {
		// If we have a token, we're logged in, so fetch user data
		data.loggedIn = true;
		await auth.checkTokenExpiry();
		data.user = await getSpotifyData('/me');
		data.playlists = await getSpotifyData('/me/playlists');
		data.tracks = await getSpotifyData('/me/tracks');
	} else {
		// Otherwise we're not logged in
		data.loggedIn = false;
	}
	return data;
}

export async function login() {
	auth.redirectToAuthCodeFlow();
}

async function getSpotifyData(endpoint) {
	const response = await fetch(SPOTIFY_API_BASE + endpoint, {
		method: 'GET',
		headers: { Authorization: `Bearer ${auth.currentToken.access_token}` }
	});
	const result = await response.json();
	if (result.error) {
		console.error(result.error.message);
	}
	return result;
}
