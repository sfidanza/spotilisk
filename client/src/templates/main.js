import { frw } from '@sfidanza/tahr';

export const main = new frw.Template();

main.onCreate = function (i18nRepository) {
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

main.toggleLikedSongs = function () {
	document.querySelector('.liked')?.classList.toggle('preview');
};

main.toggleNamingInput = function () {
	const namingInput = document.getElementById('naming-input');
	if (namingInput) {
		namingInput.style.display == 'none' ? namingInput.style.display = 'block' : namingInput.style.display = 'none';
	}
};