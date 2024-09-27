/**********************************************************
 * Page
 **********************************************************/
import * as frw from '../frw/frw.js';
import * as spotify from './spotify.js';

export const page = {
	config: {
		url: {
			templates: 'app.json',
		},
		area: {
			global: 'global-container',
			pwl: 'app-pwl',
			content: 'content',
			user: 'user-area'
		}
	},
	data: {}
};
window.page = page; // make page callable from global scope so it can be used from html

page.initialize = function () {
	// retrieve templates and data
	page.notify('Loading data...', true);
	Promise.all([
		frw.ssa.loadTemplates(page.config.url.templates, page.templates, page, frw),
		page.getData()
	]).then(() => {
		console.log(page.data);
		// display
		page.templates.global.parse();
		page.templates.global.load(page.config.area.global);

		page.templates.user.parse(page.data);
		page.templates.user.load(page.config.area.user);

		if (page.data.loggedIn) {
			page.templates.main.parse(page.data);
			page.templates.main.load(page.config.area.content);
		}

		page.notify(null);
	});
};

page.destroy = function () {
	this.pwl = null;
	for (const id in page.templates) {
		const tpl = page.templates[id];
		if (tpl.destroy) tpl.destroy();
	}
};

page.notify = function (message, init) {
	if (!this.pwl) this.pwl = document.getElementById(page.config.area.pwl);
	if (message) {
		this.pwl.innerHTML = message;
	} else {
		this.pwl.innerHTML = '';
		this.pwl.style.display = 'none';
	}
	if (init) {
		this.pwl.style.display = 'block';
		frw.dom.center(this.pwl);
	}
};

page.getData = async function () {
	page.data = await spotify.initialize();
	if (page.data.loggedIn) {
		[ page.data.user, page.data.playlists, page.data.tracks ] = await Promise.all([
			spotify.getSpotifyData('/me'),
			spotify.getSpotifyData('/me/playlists'),
			// spotify.getSpotifyData('/me/tracks')
			spotify.getFullSpotifyData('/me/tracks?limit=50')
		]);
	}
};

page.login = function () {
	spotify.login();
};

page.logout = function () {
	spotify.logout();
	window.location.reload();
};

page.select = async function (event) {
	page.notify('Fetching playlist...', true);
	document.querySelector('.selected')?.classList.remove('selected');
	event.target.classList.add('selected');

	const playlistId = event.target.dataset.id;
	page.data.selected = playlistId;
	const playlist = page.data.playlists.items.find(pl => pl.id === playlistId);
	const tracks = await spotify.getFullSpotifyData(`/playlists/${playlistId}/tracks`);
	playlist.tracks.items = tracks.items;
	page.templates.tracks.parse(tracks.items);
	page.templates.tracks.load('tracks');
	page.notify(null);
};

page.createPlaylist = function () {
	const name = 'truc';
	spotify.createPlaylist(name);
};

page.refreshPlaylists = async function () {
	page.notify('Refreshing data...', true);
	page.data.selected = null;
	[ page.data.playlists, page.data.tracks ] = await Promise.all([
		spotify.getSpotifyData('/me/playlists'),
		// spotify.getSpotifyData('/me/tracks')
		spotify.getFullSpotifyData('/me/tracks?limit=50')
	]);
	page.templates.main.parse(page.data);
	page.templates.main.load(page.config.area.content);
	page.notify(null);
};

/**
 * Returns the list of tracks present in Liked Songs and not in the playlist with id `playlistId`
 * @param {String} playlistId 
 */
page.getTrackDiff = function (playlistId) {
	const playlist = page.data.playlists.items.find(pl => pl.id === playlistId);
	const tracks = playlist.tracks.items;
	if (!tracks) {
		console.error('Playlist has not been selected, so its tracks have not been retrieved yet');
	}
	const trackDiff = page.data.tracks.items.filter((li) => tracks.every(pi => pi.track.id !== li.track.id));
	return [ trackDiff, tracks ];
};

page.previewTrackDiff = function () {
	const playlistId = page.data.selected;
	if (playlistId) {
		const [ toBeAdded, originalTracks ] = page.getTrackDiff(playlistId);
		console.log(toBeAdded.map(it => it.track.name));

		page.templates.tracks.parse(toBeAdded);
		page.templates.tracks.parse(originalTracks);
		page.templates.tracks.load('tracks');
	}
};

page.syncIntoPlaylist = function () {
	const playlistId = page.data.selected;
	if (playlistId) {
		const toBeAdded = page.getTrackDiff(playlistId);
		if (toBeAdded.length) {
			spotify.addTracksToPlaylist(playlistId, toBeAdded.map(it => it.track.uri));
		}
	}
};

/**********************************************************/

window.addEventListener('load', function () {
	page.initialize();
});
window.addEventListener('unload', function () {
	page.destroy();
});
