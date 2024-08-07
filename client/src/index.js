import * as login from './app/login.js';
import { AUTH_CLIENT_ID, AUTH_REDIRECT_URL } from './app/config.js';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

const currentToken = {
    get access_token() { return localStorage.getItem('access_token') || null; },
    get refresh_token() { return localStorage.getItem('refresh_token') || null; },
    get expires_in() { return localStorage.getItem('refresh_in') || null },
    get expires() { return localStorage.getItem('expires') || null },

    save: function (response) {
        const { access_token, refresh_token, expires_in } = response;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('expires_in', expires_in);

        const now = new Date();
        const expiry = new Date(now.getTime() + (expires_in * 1000));
        localStorage.setItem('expires', expiry);
    }
};

// On page load, try to fetch auth code from current browser search URL
const params = new URLSearchParams(window.location.search);
const code = params.get('code');

// If we find a code, we're in a callback, do a token exchange
if (code) {
    const token = await login.getToken(code, AUTH_CLIENT_ID, AUTH_REDIRECT_URL);
    currentToken.save(token);

    // Remove code from URL so we can refresh correctly.
    const url = new URL(window.location.href);
    url.searchParams.delete('code');

    const updatedUrl = url.search ? url.href : url.href.replace('?', '');
    window.history.replaceState({}, document.title, updatedUrl);
}

// If we have a token, we're logged in, so fetch user data and render logged in template
if (currentToken.access_token) {
    const userData = await getSpotifyData('/me');
    console.log(userData);
    const playlists = await getSpotifyData('/me/playlists');
    console.log(playlists);
    const tracks = await getSpotifyData('/me/tracks');
    console.log(tracks);
    // renderTemplate('main', 'logged-in-template', userData);
    // renderTemplate('oauth', 'oauth-template', currentToken);
}

// Otherwise we're not logged in, so render the login template
if (!currentToken.access_token) {
    // renderTemplate('main', 'login');
    login.redirectToAuthCodeFlow(AUTH_CLIENT_ID, AUTH_REDIRECT_URL);
}

async function getSpotifyData(endpoint) {
    const result = await fetch(SPOTIFY_API_BASE + endpoint, {
        method: 'GET',
        headers: { Authorization: `Bearer ${currentToken.access_token}` }
    });
    return await result.json();
}
