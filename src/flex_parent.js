/**
 * The Flex Parent Class
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {DOMElement}   element
 *
 * @return   {Object}
 */
function FlexParent(element) {

	// The dimension to use (width or height)
	this.dimension = null;

	FlexElement.call(this, element);

	// Array of children, wrapped in FlexElement instance
	this.children = this.getChildren('js-p-flexChild');

	window.p = this;

	// Calculate the dimensions
	this.calculate();
}

// Make FlexChild inherit the FlexElement methods
for (var name in FlexElement.prototype) {
	FlexParent.prototype[name] = FlexElement.prototype[name];
}

/**
 * Get the parent configuration
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 */
FlexParent.prototype.getConfig = function getConfig() {

	var direction,
	    temp,
	    wrap,
	    flow;

	// Direction & wrap
	direction = this.element.getAttribute('data-flex-direction');
	wrap = this.element.getAttribute('data-flex-wrap');

	// If no direction or wrap is given, get the combined flow setting
	if (!direction || !wrap) {
		flow = this.element.getAttribute('data-flex-flow') || 'row nowrap';
		temp = flow.split(' ');

		direction = temp[0];
		wrap = temp[1];
	}

	this.direction = direction;
	this.wrap = wrap;

	// Justify content along the main axis
	this.justify = this.element.getAttribute('data-flex-justify') || 'flex-start';

	// Align items along the cross axis
	this.alignItems = this.element.getAttribute('data-flex-align-items') || 'stretch';

	// Align multiple lines
	this.alignContent = this.element.getAttribute('data-flex-align-content') || 'stretch';

	if (this.direction == 'column') {
		this.dimension = 'height';
	} else {
		this.dimension = 'width';
	}
};

/**
 * Get the available content size
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 */
FlexParent.prototype.getSize = function getSize(dimension) {
	return this.getWidthOrHeight(dimension || this.dimension, 'content');
};

/**
 * Start!
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 */
FlexParent.prototype.calculate = function calculate() {

	var amount,
	    childTotal,
	    childPieces,
	    spaceLeft,
	    unitSize,
	    newSize,
	    result,
	    child,
	    space,
	    used,
	    i;

	childTotal = 0;
	childPieces = 0;

	// Total available width or height for the children
	amount = this.getSize();

	console.log(this, amount, this.dimension)
return;
	// Get the total amount of pieces + total space taken by base size
	for (i = 0; i < this.children.length; i++) {
		child = this.children[i];

		child.maxedSize = false;

		childPieces += child.grow;
		childTotal += child.getBaseSize();
	}

	spaceLeft = amount - childTotal;
	unitSize = ~~(spaceLeft / Math.max(childPieces, 1));
	used = 0;

	// Now share the units
	for (i = 0; i < this.children.length; i++) {
		child = this.children[i];

		if (!child.maxedSize) {

			// The new size for this child
			newSize = child.getBaseSize() + (child.grow * unitSize);

			// Set it and return the actual new size
			result = child.setSize(newSize, this.dimension);

			console.log(child, newSize, result);

			if (newSize > result) {

				// Indicate this child is maxed out
				child.maxedSize = true;

				// Remove the pieces this child takes
				childPieces -= child.grow;

				// Calculate the new sizes to share
				spaceLeft -= result;
				unitSize = ~~(spaceLeft / Math.max(childPieces, 1));

				// Reset the loop
				i = 0;
				used = 0;
			}
		}

		used += child.getSize();
	}

	spaceLeft = amount - used;

	console.log(this.justify, ':', amount, '-', used, '=', spaceLeft, this.element)

	// Calculate the space left again
	if (this.justify == 'space-between' && spaceLeft > 0) {
		space = ~~(spaceLeft / Math.max(this.children.length -1, 1));

		for (i = 0; i < this.children.length - 1; i++) {
			this.children[i].element.style['margin-right'] = space + 'px';
		}
	}

};

/**
 * Get direct descendants of this item
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   className
 *
 * @return   {Array}
 */
FlexParent.prototype.getChildren = function getChildren(className) {

	var children,
	    result,
	    i;

	children = this.element.getElementsByClassName(className);
	result = [];

	for (i = 0; i < children.length; i++) {
		if (children[i].parentElement == this.element) {
			result.push(new FlexChild(children[i], i, this));
		}
	}

	return result;
};