import { Template } from '../frw/frw.Template.js';

export const main = new Template();

main.onCreate = function (pageRef, frwRef, i18nRepository) {
	this.i18n = i18nRepository;
	this.autoBindEvents = ['onclick'];
};

main.onParse = function (data) {
	if (data.tracks) {
		for (const item of data.tracks.items) {
			this.set('track', item.track);
			this.set('track.artist', item.track.artists.map(a => a.name).join(', '));
			this.set('track.img', item.track.album.images[2].url);
			this.parseBlock('track');
		}

		this.set('tracks.total', data.tracks.total);
		this.parseBlock('liked');
	}

	for (const playlist of data.playlists.items) {
		this.set('playlist', playlist);
		this.set('playlist.tracks.total', playlist.tracks.total);
		this.parseBlock('playlist');
	}
};

main.onLoad = function (container) {
	/**
	 * Experimental event binding for templates
	 *  `data-onclick="myMethod"` instead of `onclick="page.templates.whoAmI.myMethod()"`
	 * Benefits:
	 *  - compatible with CSP `script-src` directive to avoid `inline-script`
	 *  - simplifies calling template method from html
	 * Candidate to be included directly in `frw.Template.load`
	 *  `main.autoBindEvents = [ 'onclick' ];`
	 **/
	if (this.autoBindEvents?.includes('onclick')) {
		container.querySelectorAll('[data-onclick]').forEach(el => {
			el.onclick = this[el.dataset.onclick].bind(this);
		});
	}
};

main.toggleLikedSongs = function () {
	document.querySelector('.liked')?.classList.toggle('preview');
};