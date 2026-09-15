import { frw } from '@sfidanza/tahr';

export const tracks = new frw.Template();

tracks.onParse = function (list, type) {
	for (const item of list) {
		this.set('track', item.track);
		this.set('track.type', type ?? 'playlist');
		this.set('track.artist', item.track.artists.map(a => a.name).join(', '));
		this.set('track.img', item.track.album.images[2].url);
		this.parseBlock('track');
	}
};
