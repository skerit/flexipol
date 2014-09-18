document.addEventListener('DOMContentLoaded', function onDOMReady(event) {

	var called = 0,
	    links,
	    link,
	    i;

	// Do nothing on browsers that support flex
	if (typeof document.body.style.flex !== 'undefined') {
		return;
	}

	links = document.getElementsByTagName('link');

	function addClass(selectors, className, attributes, debug) {

		var elements,
		    name,
		    ori,
		    el,
		    i,
		    j;

		for (i = 0; i < selectors.length; i++) {

			elements = document.querySelectorAll(selectors[i]);

			for (j = 0; j < elements.length; j++) {
				ori = (elements[j].className||'').trim();
				ori = (ori + ' ' + className).trim();

				elements[j].className = ori;

				for (name in attributes) {
					elements[j].setAttribute('data-flex-' + name, attributes[name]);
				}
			}
		}
	};

	function whenDone() {

		var parents,
		    i;

		called++;

		if (called != links.length) {
			return;
		}

		parents = document.getElementsByClassName('js-p-flexParent');

		for (var i = 0; i < parents.length; i++) {
			new FlexParent(parents[i]);
		}
	}

	for (i = 0; i < links.length; i++) {
		(function(link) {

			var request = new XMLHttpRequest();

			request.onload = function loaded() {

				var i;

				code = ParseCSS(this.responseText);

				code.stylesheet.rules.forEach(function eachRule(rule) {

					if (rule.type !== 'rule') {
						return;
					}

					rule.declarations.forEach(function eachDeclaration(dec) {

						// Found one!
						if (dec.property == 'display' && dec.value == 'flex') {
							addClass(rule.selectors, 'js-p-flexParent');
						} else if (dec.property == 'flex') {
							addClass(rule.selectors, 'js-p-flexChild', {flex: dec.value}, true);
						} else if (dec.property == 'order') {
							addClass(rule.selectors, 'js-p-flexOrder', {order: dec.value});
						} else if (dec.property == 'flex-flow') {
							addClass(rule.selectors, 'js-p-flexFlow', {flow: dec.value});
						} else if (dec.property == 'justify-content') {
							addClass(rule.selectors, 'js-p-flexJustify', {justify: dec.value});
						} else if (dec.property == 'align-items') {
							addClass(rule.selectors, 'js-p-flexAlignItems', {'align-items': dec.value});
						}
					});
				});

				whenDone();
			};

			request.open('get', link.href, true);
			request.send();

		}(links[i]));
	}

});