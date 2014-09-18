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

	this.isChild = false;

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
	    childSize,
	    rowPieces,
	    rowCount,
	    unitSize,
	    newSize,
	    offset,
	    curRow,
	    result,
	    child,
	    space,
	    rows,
	    used,
	    base,
	    row,
	    i;

	childTotal = 0;
	childPieces = 0;
	rowCount = [];
	rowPieces = [];
	rows = [];

	// Total available width or height for the children per-row
	amount = this.getSize();

	console.log(this, amount, this.dimension)

	// Get the total amount of pieces + total space taken by base size
	for (i = 0; i < this.children.length; i++) {
		child = this.children[i];

		if (i == 0) {
			curRow = 0;

			// Row size tally
			rows[0] = 0;

			// Row piece tally
			rowPieces[0] = 0;

			// Children per row count
			rowCount[0] = 0;
		}

		child.maxedSize = false;
		rowCount[0]++;
		childSize = child.getBaseSize();

		childPieces += child.grow;

		// Add this childSize to the total
		childTotal += childSize;

		// If we've gone over the total available space, go to the next row
		if (childTotal > amount && this.wrap) {

			// Reset the total for this new line
			childTotal = childSize;

			// Create new row entries
			rows[++curRow] = 0;
			rowPieces[curRow] = 0;
		}

		// Set the child's row
		child.row = curRow;

		// Increase the pieces on this row
		rowPieces[curRow] += child.grow;

		rows[curRow] += childSize;
	}

	// Apply every row
	for (row = 0; row < rows.length; row++) {

		if (this.wrap) {
			spaceLeft = amount - rows[row];
			unitSize = ~~(spaceLeft / Math.max(rowPieces[row], 1));
		} else {
			spaceLeft = 0;
			unitSize = 0;
		}

		// Tally for used size per row
		used = 0;

		// Go over every child of this row
		for (i = 0; i < this.children.length; i++) {
			child = this.children[i];

			// Skip children of other rows
			if (child.row < row) {
				continue;
			} else if (child.row > row) {
				break;
			}

			// Only continue if the child isn't maxed out
			if (!child.maxedSize) {

				base = child.getBaseSize();

				// The new size for this child
				newSize = base + (child.grow * unitSize);

				// Set it and return the actual new size
				result = child.setSize(newSize, this.dimension);

				if (newSize > result) {

					// Indicate this child is maxed out
					child.maxedSize = true;

					// Remove the pieces this child takes
					rowPieces[curRow] -= child.grow;

					// Calculate the new sizes to share
					spaceLeft -= result;
					unitSize = ~~(spaceLeft / Math.max(rowPieces[curRow], 1));

					// Reset the loop
					i = 0;
					used = 0;
				}
			}

			used += child.getSize();
		}

		// Calculate the space we have left on this row
		spaceLeft = amount - used;

		console.log(this.justify, ':', amount, '-', used, '=', spaceLeft, this.element)

		// Calculate the space left again
		if (this.justify == 'space-between' && spaceLeft > 0) {
			space = (spaceLeft / Math.max(rowCount[row], 1));

			for (i = 1; i <= rowCount[row]; i++) {
				child = this.children[i];

				if (child.row < row) {
					continue;
				} else if (child.row > row) {
					break;
				}

				// #todo: column support (top)
				child.element.style['left'] = space + 'px';
			}
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