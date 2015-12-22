# Philter
Author: Raphael Marandet

Philter is a **JQuery** plugin and provides various image processing filters, like blur, sharpen, emboss, edge detection.
The plugin works both on images and canvases.

## Why a jquery plugin ?
Philter development has started on 2015-12-16. Which means that at the moment, the CSS counterpart of filter effects is still experimental.
CSS is visual-only. Whereas Philter physically manipulates pixels.


## Basic usage
### Including Philter in your web page
Don't forget to include jquery as well.
Any version of jquery will do.
`<script src="path/to/jquery.js" type="application/javascript"></script>`
`<script src="path/to/philter.js" type="application/javascript"></script>`


### Use Philter
Philter works on images and canvases and will simply ignore all other elements.
Here are some examples :

This will run a blur filter on all images :

`$('img').philter('blur');`

This will run a level 100 contrast filter on the first image of the document :

`$('img').eq(0).philter('contrast', {level: 100});`


## Filters
Here is a list of filters provided by the Philter plugin. Each filter has its own set of options. There are filter-specific options and general options (common to some or all filters).

### blur
- blurs the image
- use *radius* option to specify the blur radius in pixels

### sharpen
- sharpens the image, like unblur or something...
- if the *more* option is set to true, the sharpen effect will be greater, showing edges excessively.

### emboss
- gives some sort of 3D shadow effect to the image, good for creating bump maps
- if the *more* option is set to true, the emboss effect will be greater.

### edges
- applies edge detection filter, the image will be darken, but the edges of shapes will be enlightened

### resize
- resizes the image, changing its dimension
- use *width* and *height* options to specify new size in pixels.
- example : `$('img').philter('resize', {width:64, height: 64});`

### grayscale
- applies a grayscaled palette on the image, removing all colors.
- example : `$('img').philter('grayscale');`

### sepia
- applies a sepia colored layer on the image.
- example : `$('img').philter('sepia');`

### brightness
- changes the image brightness
- use *factor* option with float value. 
  - A value of 0.5 means 50% darker
  - A value of 2 means +100% lighter
- example : `$('img').philter('brightness', {factor: 0.75});
// all images are a bit darker now`

### noise
- adds noise to the image
- use *level* option (default value : 50) to control the amount of noise

### contrast
- adjusts image contrast
- use *level* option (default value : 50) to control the amount of contrast
- negative values of *level* will decrease contrast

### negate
- negates the color of all pixels

### sample
- get the color of all pixels
- use *result* option to callback the result.
- example : `$('img').philter('sample', {result: function(image, statistics) { console.log(statistics); }});`


## Color channels
for pixel transformation filters like blur, sharpen, emboss, brightness... you can use the special option *channels* to specify what color (or alpha) channel will be affected.

There are two notations for the channels option
- the **object** notation : {red: boolean, green: boolean, blue: boolean, alpha: boolean}
- the **string** notation : a string containing one or more characters : "r", "g", "b" and "a"

### examples :
`$('img').philter('brightness', {factor: 2, channels: {red: true, green: false, blue: false}});`
will only lighten the "red" channel

this is equivalent to :
`$('img').philter('brightness', {factor: 2, channels: 'r'});`



## Events
If you want to run several filters in a row, 
an important thing to keep in mind is that Philter works in an asynchronous way. That is because any changes to an image is likely to trigger a *load* event, which is asynchronous.

### The *start*, *progress* and *complete* custom events
Philter triggers various custom events for each images being processed. You must attach event handlers on images.
`$('img').on('philter.complete', function(oEvent, data) {
	console.log('filter', data.filter, 'has been applied in', data.time, 'milliseconds');
});`
`$('img').on('philter.progress', function(oEvent, data) {
	console.log('filter', data.filter, 'is', data.f, '% done');
});`


## Chaining filters
You may declare several filters in a row. They will be queued are run one after another.
```
$('img')
	.philter('blur', {radius: 8})
	.philter('negate')
	.philter('contrast', {level: 30})
	.philter('brightness', {factor: 1.3});
```
