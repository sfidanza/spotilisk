import { AUTH_CLIENT_ID, AUTH_REDIRECT_URL } from './config.js';

const authorizationEndpoint = 'https://accounts.spotify.com/authorize';
const tokenEndpoint = 'https://accounts.spotify.com/api/token';
const scope = 'user-read-private user-read-email user-library-read';

export const currentToken = {
	get access_token() { return localStorage.getItem('access_token') || null; },
	get refresh_token() { return localStorage.getItem('refresh_token') || null; },
	get expires_in() { return localStorage.getItem('refresh_in') || null; },
	get expires() { return localStorage.getItem('expires') || null; },

	save: function (response) {
		const { access_token, refresh_token, expires_in } = response;
		localStorage.setItem('access_token', access_token);
		localStorage.setItem('refresh_token', refresh_token);
		localStorage.setItem('expires_in', expires_in);

		const now = new Date();
		const expiry = new Date(now.getTime() + (expires_in * 1000));
		localStorage.setItem('expires', expiry);
	},

	clear: function () {
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		localStorage.removeItem('expires_in');
		localStorage.removeItem('expires');
	}
};

export async function redirectToAuthCodeFlow() {
	const verifier = generateCodeVerifier(128);
	const challenge = await generateCodeChallenge(verifier);

	localStorage.setItem('verifier', verifier);

	const authUrl = new URL(authorizationEndpoint);
	authUrl.search = new URLSearchParams({
		'client_id': AUTH_CLIENT_ID,
		'response_type': 'code',
		'redirect_uri': AUTH_REDIRECT_URL,
		'scope': scope,
		'code_challenge_method': 'S256',
		'code_challenge': challenge
	}).toString();

	window.location = authUrl.toString();
}

function generateCodeVerifier(length) {
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const randomValues = crypto.getRandomValues(new Uint8Array(length));
	const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], '');

	return randomString;
}

async function generateCodeChallenge(codeVerifier) {
	const data = new TextEncoder().encode(codeVerifier);
	const digest = await crypto.subtle.digest('SHA-256', data);
	return btoa(String.fromCharCode(...new Uint8Array(digest)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

export async function getToken(code) {
	const verifier = localStorage.getItem('verifier');

	const response = await fetch(tokenEndpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			'client_id': AUTH_CLIENT_ID,
			'grant_type': 'authorization_code',
			'code': code,
			'redirect_uri': AUTH_REDIRECT_URL,
			'code_verifier': verifier
		})
	});
	const token = await response.json();
	if (response.ok) {
		currentToken.save(token);
		checkTokenExpiry();
	} else {
		console.error('getToken failed. Check logs.');
	}

	return token;
}

export async function refreshToken() {
	const response = await fetch(tokenEndpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: AUTH_CLIENT_ID,
			grant_type: 'refresh_token',
			refresh_token: currentToken.refresh_token
		}),
	});
	const token = await response.json();
	if (response.ok) {
		currentToken.save(token);
		checkTokenExpiry();
	} else {
		// TODO: handle case where refresh token is expired
		console.error('refreshToken failed. Clear localStorage and reload page to sign in again.');
	}

	return token;
}

let rtTimeoutId = null;

export async function checkTokenExpiry() {
	const now = new Date();
	const expireDelay = new Date(currentToken.expires).getTime() - now.getTime();
	if (expireDelay < 60 * 1000) { // if less than 1mn remaining, refresh now
		await refreshToken();
	} else {
		if (rtTimeoutId) clearTimeout(rtTimeoutId);
		rtTimeoutId = setTimeout(refreshToken, expireDelay - 60 * 1000);
		console.log(`refreshToken planned in ${expireDelay / 1000 - 60} seconds.`);
	}
}
