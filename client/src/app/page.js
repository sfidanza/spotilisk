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

		// page.select(frw.history.getCurrentState() || page.config.defaultPage);
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

page.refreshUser = function (data, cb) {
	page.data.user = data && data.user;

	//	page.templates.main.parse(); // BREAKS!! Only bets depend on user - review solution!
	//	page.templates.main.load(page.config.area.main);

	page.templates.user.parse(data || {});
	page.templates.user.load(page.config.area.user);

	if (this.current === 'bet') {
		page.redrawView();
	}
	if (cb) cb();
};

page.getPageTitle = function (stateTitle) {
	return page.config.i18n.pageTitle(stateTitle);
};

page.getMenuItem = function (hash) {
	return document.querySelector(`a[href='${hash}']`);
};

page.highlight = function (link) {
	document.querySelectorAll('a.selected').forEach(item => {
		item.className = '';
	});
	link.className = 'selected';
	link.blur();
};

page.select = function (link, event) {
	if (event) event.preventDefault();

	let target;
	if (typeof link === 'string') {
		target = link;
		link = page.getMenuItem('#' + target);
	} else {
		target = link.href.split('#')[1];
	}
	if (target) {
		if (link) {
			page.highlight(link);
			// frw.history.pushState(target, page.getPageTitle(link.title || link.innerHTML));
		}
		page.view(target);
		this.current = target;
	}
};

page.redrawView = function () {
	page.view(this.current);
};

page.view = function (viewName) {
	page.scoreEditor.unplug();
	page.show(...viewName.split(','));
};

page.show = function (viewName, ...option) {
	switch (viewName) {
		case 'schedule': page.showSchedule(...option); break;
		case 'history': page.showPage('history', ...option); break;
		case 'notes': page.showPage('notes'); break;
		case 'login': page.showPage('login', ...option); break;
		case 'register': page.showPage('register', ...option); break;
		case 'bet': page.showPage('bet', ...option); break;
	}
	document.getElementById(page.config.area.contents).className = 'page-' + viewName;
};

page.showSchedule = function (phase) {
	const matches = (phase == 1) ? page.data.matches.filter(m => m.phase == 'G') :
		((phase == 2) ? page.data.matches.filter(m => m.group == null) : page.data.matches);

	const data = {
		teams: page.data.teams,
		matches: matches,
		stadiums: page.data.stadiums
	};

	page.templates.schedule.parse(data);
	page.templates.schedule.load(page.config.area.contents);
	page.scoreEditor.plug();
};

page.showPage = function (tplId, options) {
	const tpl = page.templates[tplId];
	tpl.parse(options);
	tpl.load(page.config.area.contents);
};

/**********************************************************/

window.addEventListener('load', function () {
	page.initialize();
});
window.addEventListener('unload', function () {
	page.destroy();
});
