import { Template } from '../frw/frw.Template.js';

export const global = new Template();

global.onCreate = function (pageRef, frwRef, i18nRepository) {
	this.i18n = i18nRepository;
};

global.onParse = function () {
};
