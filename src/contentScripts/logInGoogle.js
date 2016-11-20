/*eslint-disable */
(function () {
	'use strict';
	setTimeout(function () {
		const buttons = Array.from(document.getElementsByTagName('button'));
		const google = buttons.find(b => Array.from(b.attributes).find(attr => String(attr.nodeValue).indexOf('google') !== -1));
		google.click();
	}, 1000);
}());
