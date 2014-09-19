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
 * Reset all `styles` properties needed for Flexipol to work
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 */
FlexElement.prototype.resetStyle = function resetStyle() {

	var style = this.element.style;

	// Float stuff
	style.float = '';
	style.clear = '';

	// Dimensions
	style.maxHeight = '';
	style.minHeight ='';
	style.height = '';
	style.maxWidth = '';
	style.minWidth = '';
	style.width = '';

	// Margins
	style.margin = '';
	style.marginBottom = '';
	style.marginLeft = '';
	style.marginRight = '';
	style.marginTop = '';

	// Positioning
	style.top = '';
	style.bottom = '';
	style.left = '';
	style.right = '';
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

	var calcedSize,
	    newSize,
	    sizes;

	sizes = this.getWidthOrHeight(dimension, 'all');
	calcedSize = this.calc(size);

	newSize = this.getSizeToSet(calcedSize, sizes, dimension, type);

	if (dimension == 'width') {
		this.element.style.width = newSize + 'px';
	} else {
		this.element.style.height = newSize + 'px';
	}

	return this.getWidthOrHeight(dimension, type);
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
 * @param    {String}   targetType  The target type (override)
 *
 * @return   {Number}
 */
FlexElement.prototype.getSizeToSet = function getSizeToSet(newSize, _sizes, _dimension, _type, _targetType) {

	var reachedTarget,
	    targetMinus,
	    targetExtra,
	    reachedType,
	    targetType,
	    extraIsSet,
	    baseIsSet,
	    dimension,
	    allSet,
	    result,
	    sizes,
	    chain,
	    type,
	    ct,
	    i;

	if (typeof _sizes !== 'object') {
		targetType = _type;
		type = _dimension;
		dimension = _sizes;
	} else {
		sizes = _sizes;
		type = _type;
		dimension = _dimension;
		targetType = _targetType;
	}

	if (!type) {
		type = 'margin';
	}

	if (!sizes) {
		sizes = this.getWidthOrHeight(dimension, 'all');
	}

	if (!targetType) {
		targetType = sizes.sizing;
	}

	chain = ['margin', 'border', 'padding', 'content'];
	targetMinus = 0;
	targetExtra = 0;

	for (i = 0; i < chain.length; i++) {
		ct = chain[i];

		if (type == ct) {
			reachedType = true;
		}

		if (targetType == ct) {
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
	    ori,
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

	// If this is a flex child we should float it to get the real width
	if (this.isChild) {
		ori = this.element.style.float;
		this.element.style.float = 'left';
	}

	// Make sure it floats to calculate the width!
	if (dimension == 'width') {
		S = 'Width';
		s = 'width';
		a = 'left';
		b = 'right';
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