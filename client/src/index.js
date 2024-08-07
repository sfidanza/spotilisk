import * as login from './app/login.js';

const AUTH_CLIENT_ID = 'xxxxxxxxxxxx';
const AUTH_REDIRECT_URL = 'http://localhost:8090/index.html';

const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    login.redirectToAuthCodeFlow(AUTH_CLIENT_ID, AUTH_REDIRECT_URL);
} else {
    const accessToken = await login.getAccessToken(AUTH_CLIENT_ID, code, AUTH_REDIRECT_URL);
    console.log(accessToken);
    const profile = await fetchProfile(accessToken);
    console.log(profile);
    const playlists = await getPlaylists(accessToken);
    console.log(playlists);
    const tracks = await getSavedTracks(accessToken);
    console.log(tracks);
}

async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

async function getPlaylists(token) {
    const result = await fetch("https://api.spotify.com/v1/me/playlists", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

async function getSavedTracks(token) {
    const result = await fetch("https://api.spotify.com/v1/me/tracks", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}