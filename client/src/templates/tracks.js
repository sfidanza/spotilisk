import { Template } from '../frw/frw.Template.js';

export const tracks = new Template();

tracks.onCreate = function (pageRef, frwRef, i18nRepository) {
	this.i18n = i18nRepository;
};

tracks.onParse = function (list) {
	for (const item of list) {
		this.set('track', item.track);
		this.set('track.artist', item.track.artists.map(a => a.name).join(', '));
		this.set('track.img', item.track.album.images[2].url);
		this.parseBlock('track');
	}
	this.parseBlock('separator');
};
