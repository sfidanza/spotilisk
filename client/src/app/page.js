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
	return spotify.initialize()
		.then(data => {
			page.data = data;
		});
};

page.login = function () {
	spotify.login();
};

page.logout = function () {
	spotify.logout();
	window.location.reload();
};

page.select = async function(event) {
	document.querySelector('.selected')?.classList.remove('selected');
	event.target.classList.add('selected');

	const playlistId = event.target.dataset.id;
	// const playlist = page.data.playlists.items.find(pl => pl.id === playlistId);
	const tracks = await spotify.getSpotifyData(`/playlists/${playlistId}/tracks`);
	page.templates.tracks.parse(tracks.items);
	page.templates.tracks.load('tracks');
};

page.createPlaylist = function () {
	const name = 'truc';
	spotify.createPlaylist(name);
};

page.refreshPlaylists = function () {
	Promise.all([
		spotify.getSpotifyData('/me/playlists'),
		spotify.getSpotifyData('/me/tracks')
	]).then(([playlists, tracks]) => {
		page.data.playlists = playlists;
		page.data.tracks = tracks;
		page.templates.main.parse(page.data);
		page.templates.main.load(page.config.area.content);
	});
};

page.syncIntoPlaylist = function () {
	const selected = document.querySelector('.selected');
	if (selected) {
		const playlistId = selected.dataset.id;
		const tracksUri = page.data.tracks.items.map(it => it.track.uri).slice(0, 3); // limit to 3 for testing
		console.log(playlistId, tracksUri);
		spotify.addTracksToPlaylist(playlistId, tracksUri);
	}
};

/**********************************************************/

window.addEventListener('load', function () {
	page.initialize();
});
window.addEventListener('unload', function () {
	page.destroy();
});
