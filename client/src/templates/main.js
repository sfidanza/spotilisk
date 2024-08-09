import { Template } from '../frw/frw.Template.js';

export const main = new Template();

main.onCreate = function (pageRef, frwRef, i18nRepository) {
	this.i18n = i18nRepository;
};

main.onParse = function (data) {
	if (data.tracks) {
		this.set('tracks.total', data.tracks.total);
		this.parseBlock('tracks');
	}

	for (const playlist of data.playlists.items) {
		console.log(playlist);
		this.set('playlist', playlist);
		this.set('playlist.tracks.total', playlist.tracks.total);
		this.parseBlock('playlist');
	}
};
