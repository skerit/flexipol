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

	// Make this parent relative
	element.style.position = 'relative';

	// Array of children, wrapped in FlexElement instance
	this.children = this.getChildren('js-p-flexChild');

	// Get the maximum sizes this parent can be on the inside
	this.peakWidth = this.calculateMaxSize('width', 'content');
	this.peakHeight = this.calculateMaxSize('height', 'content');

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
 * Return the maximum size this parent can be.
 * It does this by maxing out the children.
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 */
FlexParent.prototype.getMaxSize = function getMaxSize(dimension) {

	if (!dimension) {
		dimension = this.dimension;
	}

	if (dimension == 'height') {
		return this.peakHeight;
	} else {
		return this.peakWidth;
	}
};

/**
 * Calculate the maximum size this parent can be.
 * It does this by maxing out the children.
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 */
FlexParent.prototype.calculateMaxSize = function calculateMaxSize(dimension, type) {

	var result,
	    child,
	    i;

	// Float all of the children
	for (i = 0; i < this.children.length; i++) {
		child = this.children[i].element;

		child.style.float = 'left';

		if (dimension == 'width') {
			child.style.clear = '';
		} else {
			child.style.clear = 'both';
		}
	}

	// Make sure to push it over the threshhold
	if (dimension == 'width') {
		this.children[i-1].element.style.marginRight = '50000px';
	} else {
		this.children[i-1].element.style.marginBottom = '50000px';
	}

	// Get the result
	result = this.getWidthOrHeight(dimension, type);

	// Unfloat all of the children
	for (i = 0; i < this.children.length; i++) {
		child = this.children[i].element;
		child.style.float = '';
		child.style.clear = '';
	}

	// Reset the silly margins
	this.children[i-1].element.style.marginRight = '';
	this.children[i-1].element.style.marginBottom = '';

	return result;
};

function FlexCollection(children, direction, parent) {

	var grouped,
	    i;

	if (children.length && Array.isArray(children[0])) {
		grouped = [];
		for (i = 0; i < children.length; i++) {
			grouped[i] = new FlexCollection(children[i], direction, parent);
		}
		children = grouped;
	}

	// The children in this collection (can be only 1)
	this.children = children;

	// The direction to calculate
	this.direction = direction;

	// The parent container of this collection
	this.parent = parent;

	// The direction of the actual container
	this.parentDirection = parent.direction;

	// Is this going to be a nested calculation?
	this.nested == !(direction == this.parentDirection);

	if (this.nested) {
		this.grow = 1;
	} else {
		this.grow = children[0].grow;
	}

	// Set the properties of interest
	if (direction == 'column') {
		this.S = 'Width';
		this.s = 'width';
		this.a = 'left';
		this.b = 'right';
	} else {
		this.S = 'Height';
		this.s = 'height';
		this.a = 'top';
		this.b = 'bottom';
	}

	// And also of the original direction
	if (this.parentDirection == 'column') {
		this.So = 'Width';
		this.so = 'width';
		this.ao = 'left';
		this.bo = 'right';
	} else {
		this.So = 'Height';
		this.so = 'height';
		this.ao = 'top';
		this.bo = 'bottom';
	}

	this.dimension = this.s;

};

/**
 * Return the base size of this collection
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 */
FlexCollection.prototype.getBaseSize = function getBaseSize() {

	var result,
	    child,
	    temp;

	result = 0;

	for (i = 0; i < this.children.length; i++) {
		child = this.children[i];

		// For nested ones, just get the current size
		if (this.nested) {
			temp = child.getWidthOrHeight(this.so);
		} else {
			temp = child.getBaseSize(this.so);
		}

		if (temp > result) {
			result = temp;
		}
	}

	return result;
};

FlexCollection.prototype.setSize = function setSize(size, dimension, type) {

	var i;

	// Only set the size if stretch is true!
	if (this.parent.alignItems == 'stretch') {
		for (i = 0; i < this.children.length; i++) {
			this.children[i].setSize(size, dimension, type);
		}

		return this.getWidthOrHeight(dimension, type);
	}

	// If we don't change the size, we'll probably need to align it
	this.setAlignItems(size, dimension, type);

	return size;
};

/**
 * If no stretching is wanted: align the items
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 */
FlexCollection.prototype.setAlignItems = function setAlignItems(size, dimension, type) {

	var temp;

	temp = this.getWidthOrHeight(dimension, type);

	if (this.direction == 'column' && this.parent.alignItems == 'center') {
		this.addMargin('Top', (size-temp)/2);
		this.addMargin('Bottom', (size-temp)/2);
	}
};

/**
 * Set the top margin
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   sizeType
 */
FlexCollection.prototype.addMargin = function addMargin(tb, amount) {

	var style,
	    child,
	    temp,
	    i;

	for (i = 0; i < this.children.length; i++) {
		child = this.children[i];

		// First reset the style
		child.element.style['margin'+tb] = '';

		style = getStyles(this.children[i].element);
		temp = child.calc(style['margin-' + tb.toLowerCase()]) || 0;
		temp += amount;

		child.element.style['margin'+tb] = temp + 'px';
	}
};

/**
 * Get the size as it is now,
 * for the direction of the parent.
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   sizeType
 */
FlexCollection.prototype.getSize = function getSize(sizeType) {
	return this.getWidthOrHeight(this.dimension, sizeType);
};

/**
 * Get the grow count
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 */
FlexCollection.prototype.getGrow = function getGrow() {

	if (this.parent.alignItems == 'stretch') {
		return 1;
	}

	// We actually use setSize to set the center when it shouldn't grow,
	// so always return 1
	return 1;
};

/**
 * Set the clear
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   clear
 */
FlexCollection.prototype.setClear = function setClear(clear) {
	if (!this.nested) {
		this.children[0].element.style.clear = clear;
	}
};

/**
 * Get the width or height of the collection
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   dimension   width or height
 * @param    {String}   sizeType    margin, border, padding, content or all
 *
 * @return   {Number|Object}
 */
FlexCollection.prototype.getWidthOrHeight = function getWidthOrHeight(dimension, sizeType) {

	var result,
	    child,
	    temp;

	result = 0;

	for (i = 0; i < this.children.length; i++) {
		child = this.children[i];

		temp = child.getWidthOrHeight(dimension, sizeType);

		if (temp > result) {
			result = temp;
		}

		console.log('GWOH:', dimension, result)
	}

	return result;
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

FlexParent.prototype.calculateGroup = function calculateGroup(children, direction, simulated) {

	var alignedChildren,
	    childPieces,
	    collection,
	    childTotal,
	    peakAmount,
	    sDirection,
	    rowPieces,
	    dimension,
	    rowCount,
	    amount,
	    child,
	    rows,
	    temp,
	    i;

	childTotal = 0;
	childPieces = 0;
	alignedChildren = [];
	rowCount = [];
	rowPieces = [];
	rows = [];

	if (!direction) {
		direction = this.direction;
	}

	if (direction == 'column') {
		dimension = 'height';
	} else {
		dimension = 'width';
	}

	// Peak amount of available with or height. Used for calculating rows/columns
	peakAmount = this.getMaxSize(dimension);

	// Total available width or height for the children per-row
	amount = this.getWidthOrHeight(dimension);

	console.log('Maximum size of container is', amount);

	collection = new FlexCollection(children, direction, this);

	for (i = 0; i < collection.children.length; i++) {
		child = collection.children[i];

		if (i == 0) {
			curRow = 0;

			// Row size tally
			rows[0] = 0;

			// Row piece tally
			rowPieces[0] = 0;

			// Children per row count
			rowCount[0] = 0;

			// Grouping the children per row/column/line
			alignedChildren[0] = [];
		}

		child.maxedSize = false;
		rowCount[0]++;
		childSize = child.getBaseSize();

		childPieces += child.getGrow();

		// Add this childSize to the total
		childTotal += childSize;

		// If we've gone over the total available space, go to the next row
		if (childTotal > peakAmount && this.wrap) {

			// Reset the total for this new line
			childTotal = childSize;

			// Create new row entries
			rows[++curRow] = 0;
			rowPieces[curRow] = 0;
			alignedChildren[curRow] = [];
		}

		// Set the child's row
		child.row = curRow;

		// Add this child to this grouped line
		alignedChildren[curRow].push(child);

		// Increase the pieces on this row
		rowPieces[curRow] += child.getGrow();

		rows[curRow] += childSize;
	}

	console.log('Amount of free space:', amount);
	console.log('New: ', rows, rowPieces);

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
		for (i = 0; i < collection.children.length; i++) {
			child = collection.children[i];

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
				newSize = base + (child.getGrow() * unitSize);

				console.log('Setting childsize: ', newSize, dimension, 'Grow:', child.getGrow())
				console.log('Base', base, 'unit:', unitSize)
//if (simulated) return;
				// Set it and return the actual new size
				result = child.setSize(newSize, dimension);

				if (newSize > result) {

					// Indicate this child is maxed out
					child.maxedSize = true;

					// Remove the pieces this child takes
					rowPieces[curRow] -= child.getGrow();

					// Calculate the new sizes to share
					spaceLeft -= result;
					unitSize = ~~(spaceLeft / Math.max(rowPieces[curRow], 1));

					// Reset the loop
					i = 0;
					used = 0;
				}
			}

			// Apply the correct clearing (for row or column)
			if (direction == 'column') {
				console.log('Setting clear')
				child.setClear('both');
			}

			used += child.getSize();
		}

		// Calculate the space we have left on this row
		spaceLeft = amount - used;

		console.log(this.justify, ':', amount, '-', used, '=', spaceLeft, this.element)

		// Calculate the space left again
		// if (this.justify == 'space-between' && spaceLeft > 0) {
		// 	space = (spaceLeft / Math.max(rowCount[row], 1));

		// 	for (i = 1; i <= rowCount[row]; i++) {
		// 		child = this.children[i];

		// 		if (child.row < row) {
		// 			continue;
		// 		} else if (child.row > row) {
		// 			break;
		// 		}

		// 		// #todo: column support (top)
		// 		child.element.style['left'] = space + 'px';
		// 	}
		// }
	}

	if (simulated || !alignedChildren.length) {
		return;
	}

	if (direction == 'column') {
		sDirection = 'row';
	} else {
		sDirection = 'column';
	}

	// temp = [];

	// for (i = 0; i < alignedChildren.length; i++) {
	// 	temp[i] = new FlexCollection
	// }
console.log('\n\n»»»»» ' + direction, '»»»', sDirection + '\n\n');
	this.calculateGroup(alignedChildren, sDirection, true);

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

	return this.calculateGroup(this.children, this.direction);

	childTotal = 0;
	childPieces = 0;
	rowCount = [];
	rowPieces = [];
	rows = [];

	// Total available width or height for the children per-row
	amount = this.getSize();

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

	
	console.log('Original: ', rows, rowPieces);
return;

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

		//Calculate the space left again
		// if (this.justify == 'space-between' && spaceLeft > 0) {
		// 	space = (spaceLeft / Math.max(rowCount[row], 1));

		// 	for (i = 1; i <= rowCount[row]; i++) {
		// 		child = this.children[i];

		// 		if (child.row < row) {
		// 			continue;
		// 		} else if (child.row > row) {
		// 			break;
		// 		}

		// 		// #todo: column support (top)
		// 		child.element.style['left'] = space + 'px';
		// 	}
		// }
	}
return;
	this.doAlignItems(this.children, rows, rowPieces, rowCount);
};

/**
 * Align the items
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Array}   children
 * @param    {Array}   lines
 * @param    {Array}   pieces
 * @param    {Array}   count
 */
FlexParent.prototype.doAlignItems = function doAlignItems(children, lines, pieces, count) {

	var parentSize,
	    lineCount,
	    childSize,
	    lineSize,
	    child,
	    line, // Rows or columns
	    i,
	    S,
	    s,
	    a,
	    b;

	// For aligning the width and height properties are switched
	if (this.direction == 'column') {
		S = 'Width';
		s = 'width';
		a = 'left';
		b = 'right';
	} else {
		S = 'Height';
		s = 'height';
		a = 'top';
		b = 'bottom';
	}

	// Get the content size of the parent
	parentSize = this.getSize(s);

	// Calculate the size a line can be
	lineSize = ~~(parentSize / lines.length);

	for (line = 0; line < lines.length; line++) {

		lineCount = 0;

		for (i = 0; i < children.length; i++) {
			child = children[i];

			// Skip children not on the current line
			if (child.row < line) {
				continue;
			} else if (child.line > line) {
				break;
			}

			if (this.direction == 'row' && lineCount == 0) {
				child.element.style.clear = 'left';
			}

			lineCount++;

			// Get the complete size of the child
			childSize = child.getWidthOrHeight(s, 'margin');

			// This should actually do a "calculate" on the entire line for the other dimension
			if (this.alignItems == 'stretch') {
				child.setSize(lineSize, s, 'margin');
			} else if (this.alignItems == 'center') {

				child.element.style[a] = ~~((line * (lineSize/2)) + ((lineSize/2) - (childSize / 2))) + 'px';
				console.log('Setting chld style', a)
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