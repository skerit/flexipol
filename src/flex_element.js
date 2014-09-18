/**
 * Return an object containing the computed styles
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {DOMElement}   element
 *
 * @return   {Object}
 */
function getStyles(element) {

	if (element && element.currentStyle) {
		return element.currentStyle;
	}

	return getComputedStyle(element);
}

/**
 * The basic element class
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {DOMElement}   element
 */
function FlexElement(element) {

	// Store the element
	this.element = element;

	// Get the computed styles
	this.computed = getStyles(element);

	// Get the config
	this.getConfig();
}

/**
 * Should be overwritten
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 */
FlexElement.prototype.getConfig = function getConfig() {};

/**
 * Calculate a size string
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   stringSize
 * @param    {Number}   def
 *
 * @return   {Number}
 */
FlexElement.prototype.calc = function calc(stringSize, def) {

	var parsed,
	    styles,
	    result,
	    root,
	    str = String(stringSize);

	if (str.indexOf('px') > -1) {
		return parseInt(str) || 0;
	}

	if (str.indexOf('rem') > -1) {
		str = parseFloat(str);

		styles = getStyles(document.body.parentElement);
		root = parseInt(styles['font-size']);

		return (root * str) || 0;
	}

	if (str.indexOf('em') > -1) {
		str = parseFloat(str);

		styles = getStyles(this.element.parentElement);
		root = parseInt(styles['font-size']);

		return (root * str) || 0;
	}

	parsed = parseInt(str);

	if (parsed == parsed) {
		return parsed;
	}

	if (typeof def !== 'undefined') {
		return def;
	}

	return 0;
};

/**
 * Set the size of the element
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   size        The size to set (px, em, rem)
 * @param    {String}   dimension   width or height
 * @param    {String}   type        margin, border, padding or content [margin]
 *
 * @return   {Number}
 */
FlexElement.prototype.setSize = function setSize(size, dimension, type) {

	var newSize,
	    sizes;

	sizes = this.getWidthOrHeight(dimension, 'all');
	newSize = this.getSizeToSet(this.calc(size), sizes, dimension, type);

	if (dimension == 'width') {
		this.element.style.width = newSize + 'px';
	} else {
		this.element.style.height = newSize + 'px';
	}

	return this.getSize(dimension);
};

/**
 * Get the correct size to set on an element's width
 * for the wanted target type width.
 *
 * For example: You want to set the content width of an element,
 * but the browser is in border-box mode.
 * In that situation you need to add the padding & border size.
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   newSize     The wanted size in pixels
 * @param    {Object}   sizes       `all` result of #getWidthOrHeight
 * @param    {String}   dimension   width or height
 * @param    {String}   type        margin, border, padding or content [margin]
 *
 * @return   {Number}
 */
FlexElement.prototype.getSizeToSet = function getSizeToSet(newSize, sizes, dimension, type) {

	var reachedTarget,
	    targetMinus,
	    targetExtra,
	    reachedType,
	    extraIsSet,
	    baseIsSet,
	    allSet,
	    result,
	    chain,
	    ct,
	    i;

	if (!type) {
		type = 'margin';
	}

	chain = ['margin', 'border', 'padding', 'content'];
	targetMinus = 0;
	targetExtra = 0;

	for (i = 0; i < chain.length; i++) {
		ct = chain[i];

		if (type == ct) {
			reachedType = true;
		}

		if (sizes.sizing == ct) {
			reachedTarget = true;
		}

		if (reachedType && reachedTarget) {
			break;
		}

		if (reachedType) {
			targetMinus += sizes[ct];
		} else if (reachedTarget) {
			targetExtra += sizes[ct];
		}
	}

	result = (newSize - targetMinus) + targetExtra;

	return result;
};

FlexElement.prototype.getWidth = function getWidth(sizeType) {
	return this.getWidthOrHeight('width', sizeType);
};

FlexElement.prototype.getHeight = function getHeight(sizeType) {
	return this.getWidthOrHeight('height', sizeType);
};

/**
 * Get the width or height
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
FlexElement.prototype.getWidthOrHeight = function getWidthOrHeight(dimension, sizeType) {

	var paddingBoxSize,
	    contentBoxSize,
	    borderBoxSize,
	    marginBoxSize,
	    paddingSize,
	    marginSize,
	    borderSize,
	    clientSize,
	    boxSizing,
	    sizing,
	    result,
	    style,
	    el,
	    S,
	    s,
	    a,
	    b;

	el = this.element;

	if (!sizeType) {
		sizeType = 'margin';
	}

	// Get the current applied styles
	style = getStyles(this.element);

	// Get the boxsize model
	boxSizing = style['box-sizing'];

	// Make sure it floats to calculate the width!
	if (dimension == 'width') {
		S = 'Width';
		s = 'width';
		a = 'left';
		b = 'right';
		this.element.style.float = 'left';
		clientSize = this.element.clientWidth;
	} else {
		S = 'Height';
		s = 'height';
		a = 'top';
		b = 'bottom';
		clientSize = this.element.clientHeight;
	}

	// Get the width including padding & border, but not margin
	borderBoxSize = el['offset'+S];

	// We have all the information for the borderbox width
	if (sizeType == 'border') {
		return borderBoxSize;
	}

	// Get the margin width
	marginSize = this.calc(style['margin-'+a]) + this.calc(style['margin-'+b]);
	marginBoxSize = borderBoxSize + marginSize;

	// We have all the information to return the full width
	if (sizeType == 'margin' || sizeType == 'full') {
		return marginBoxSize;
	}

	// Get the border width
	borderSize = this.calc(style['border-' + a + '-width']) + this.calc(style['border-' + b + '-width']);
	paddingBoxSize = borderBoxSize - borderSize;

	if (sizeType == 'padding') {
		return paddingBoxSize;
	}

	// Get the padding width
	paddingSize = this.calc(style['padding-'+a]) + this.calc(style['padding-'+b]);

	// Get the content width
	contentBoxSize = paddingBoxSize - paddingSize;

	if (sizeType == 'all') {

		// Determine what box sizing type is in effect
		if (marginBoxSize == clientSize) {
			sizing = 'margin';
		} else if (borderBoxSize == clientSize) {
			sizing = 'border';
		} else if (paddingBoxSize == clientSize) {
			sizing = 'padding';
		} else {
			sizing = 'content';
		}

		return {
			margin: marginSize,
			marginBox: marginBoxSize,
			border: borderSize,
			borderBox: borderBoxSize,
			padding: paddingSize,
			paddingBox: paddingBoxSize,
			content: contentBoxSize,
			contentBox: contentBoxSize,
			sizing: sizing
		};
	}

	return contentBoxSize;
};