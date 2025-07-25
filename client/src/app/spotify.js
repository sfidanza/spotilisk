import * as auth from './auth.js';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/**
 * @param {object} config
 * @param {String} config.AUTH_CLIENT_ID - Spotify client ID for OAuth identification
 * @param {String} config.AUTH_REDIRECT_URL - url for Spotify to redirect to this application
 */
export async function initialize(config) {
	// On page load, try to fetch auth code from current browser search URL
	const params = new URLSearchParams(window.location.search);
	const code = params.get('code');

	// Set OAuth credentials in auth library
	auth.initialize(config);

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
	} else {
		// Otherwise we're not logged in
		data.loggedIn = false;
	}
	return data;
}

export async function login() {
	auth.redirectToAuthCodeFlow();
}

export async function logout() {
	auth.currentToken.clear();
}

async function fetchWebApi(url, method, body) {
	const response = await fetch(url, {
		headers: { Authorization: `Bearer ${auth.currentToken.access_token}` },
		method,
		body: JSON.stringify(body)
	});
	const result = await response.json();
	if (result.error) {
		console.error(result.error.message);
	}
	return result;
}

export async function getSpotifyData(endpoint) {
	return await fetchWebApi(SPOTIFY_API_BASE + endpoint, 'GET');
}

export async function getFullSpotifyData(endpoint) {
	let next = SPOTIFY_API_BASE + endpoint;
	const results = { items: [] };
	while (next) {
		const result = await fetchWebApi(next, 'GET');
		if (result.error) break;
		results.items.push(...result.items);
		results.total = result.total;
		next = result.next;
	}
	return results;
}

export async function createPlaylist(name) {
	const endpoint = '/me/playlists';
	const result = await fetchWebApi(SPOTIFY_API_BASE + endpoint, 'POST', {
		name: name,
		public: false
	});
	return result;
}

export async function addTracksToPlaylist(playlistId, tracksUri) {
	const endpoint = `/playlists/${playlistId}/tracks`;
	// split `tracksUri` by groups of 100 items, as supported by spotify api
	let start = 0;
	while (start < tracksUri.length) {
		const batchUri = tracksUri.slice(start, start + 100);
		const result = await fetchWebApi(SPOTIFY_API_BASE + endpoint, 'POST', {
			uris: batchUri
		});
		if (result.error) break;
		start += 100;
	}
}

export async function findTrack(name) {
	const endpoint = `/search?q=${encodeURIComponent(name)}&type=track&market=FR`;
	const result = await fetchWebApi(SPOTIFY_API_BASE + endpoint, 'GET');
	const track = result.tracks.items[0];
	const trackName = `${track.artists[0].name} - ${track.name}`;
	if (trackName.toLowerCase() !== name.toLowerCase()) {
		console.warn(`Requested: ${name}, found: ${trackName}`);
	}
	return track;
}