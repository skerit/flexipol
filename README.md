## What is Flexipol?

Flexipol is a polyfill for the CSS Flexible Box Layout Module.
As far as I know, this is going to be the first script to support
the new (2014) version of the spec.

You can read the [W3C specification here](http://www.w3.org/TR/css3-flexbox/)

## Browser Support

Flexipol is specifically meant to be used on:

* Internet Explorer 9
* Internet Explorer 10

All other browser support the new Flexbox natively and un-prefixes,
as you can see on the [Can I use...](http://www.caniuse.com/#feat=flexbox) page.

## What's working? (And what's not?)

### Row

* `flex-direction: row` (not row-reverse)
* `flex-wrap: wrap, nowrap` (not wrap-reverse)
* `justify-content: flex-start` (not flex-end, center, space-between, space-around)
* `align-items: stretch, +/-center` (not flex-start, flex-end, baseline)
* `align-content: stretch` (not flex-start, flex-end, center, space-between, space-around)

### Column

Basically nothing

### Items

* `flex-grow` - yes
* `flex-basis` - yes
* `flex-shrink` - no
* `align-self` - no
* `order` - no


## Why?

Flexbox is one of the many holy grails in web development.
It would be a shame not to use it just because of IE9 & 10.

## How?

It parses your CSS files and looks for the Flexbox properties.
It then applies its magic, using nothing but pure JavaScript.

Note: your CSS files have to be hosted on the same domain as your site, for CORS.


## Copyright and Software License
Copyright (c) 2013 Jelle De Loecker <jelle@kipdola.be>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'),
to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Contact
* [@skeriten](http://twitter.com/skeriten) on Twitter in English and
* [@skerit](http://twitter.com/skerit) on Twitter in Dutch