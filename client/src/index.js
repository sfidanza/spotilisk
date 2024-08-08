import * as auth from './app/auth.js';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

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

// If we have a token, we're logged in, so fetch user data and render logged in template
if (auth.currentToken.access_token) {
    await auth.checkTokenExpiry();
    const userData = await getSpotifyData('/me');
    console.log(userData);
    const playlists = await getSpotifyData('/me/playlists');
    console.log(playlists);
    const tracks = await getSpotifyData('/me/tracks');
    console.log(tracks);
    // renderTemplate('main', 'logged-in-template', userData);
    // renderTemplate('oauth', 'oauth-template', auth.currentToken);
}

// Otherwise we're not logged in, so render the login template
if (!auth.currentToken.access_token) {
    // renderTemplate('main', 'login');
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
