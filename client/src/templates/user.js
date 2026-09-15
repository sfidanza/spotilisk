import { frw } from '@sfidanza/tahr';

export const user = new frw.Template();

user.onCreate = function (i18nRepository) {
	this.i18n = i18nRepository;
	this.autoBindEvents = ['onclick'];
};

user.onParse = function (data) {
	if (data.user) {
		this.set('user', data.user.display_name);
		this.set('profile', data.user.images[0]?.url || '../img/user.png');
		this.parseBlock('login_info');
	} else {
		this.set('user', 'User');
		this.set('profile', '../img/user.png');
		this.parseBlock('login_form');
	}
};

user.toggleMenu = function () {
	const menu = document.getElementById('profile-menu');
	if (menu) {
		menu.style.display == 'none' ? menu.style.display = 'block' : menu.style.display = 'none';
	}
};
