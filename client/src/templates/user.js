import { Template } from '../frw/frw.Template.js';

export const user = new Template();

user.onCreate = function (pageRef, frwRef, i18nRepository) {
	this.i18n = i18nRepository;
	this.autoBindEvents = ['onclick'];
};

user.onParse = function (data) {
	if (data.user) {
		this.set('user', data.user.display_name);
		this.set('profile', data.user.images[0].url);
		this.parseBlock('login_info');
	} else {
		this.set('user', 'User');
		this.set('profile', '../img/user.png');
		this.parseBlock('login_form');
	}
};

user.onLoad = function (container) {
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

user.toggleMenu = function () {
	const menu = document.getElementById('profile-menu');
	if (menu) {
		menu.style.display == 'none' ? menu.style.display = 'block' : menu.style.display = 'none';
	}
};
