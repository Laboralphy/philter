# philter
Jquery plugin that provides various image processing filters, like blur, sharpen, emboss, edge detection.

## Filters

### blur
- blurs the image
- use "radius" option to specify the blur radius in pixels
if the radius is 1 or ommitted, a standard blur will be performed
if the radius is 2 or more, a gaussian blur will be performed

### sharpen
- sharpens the image, like unblur or something...
- if option "more" is set to true, the sharpen effect will be greater, showing edges excessively.

### emboss
- give some sort of 3D shadow effect to the image, good for creating bump maps
- if option "more" is set to true, the emboss effect will be greater.

### edges
- apply edge detection filter, the image will be darken, but the edges of shapes will be enlightened

### resize
- resize the image
- use "width" and "height" options to specify new size in pixels
- example : $('img').imageFilter('resize', {width:64, height: 64});

### grayscale
- applies a grayscaled palette on the image, removing all colors.
- example : $('img').imageFilter('grayscale');

### sepia
- applies a sepia colored layer on the image.
- example : $('img').imageFilter('sepia');

### brightness
- changes the image brightness
- use "factor" option with float value {factor: 0.5} means 50% darker, {factor: 2} means +100% lighter
- example : $('img').imageFilter('brightness', {factor: 0.75});  // all images are a bit darker now

### noise
- adds noise to the image
- use "level" option (default value : 50) to control the amount of noise

### contrast
- adjust image contrast
- use "level" option (default value : 50) to control the amount of contrast




## tricks : 
for filters blur, sharpen, emboss, brightness
you can use the special option "channels" to specify what color channel will be affected

there are two notations for the channels option
- the "object" notation : {red: boolean, green: boolean, blue: boolean}
- the "string" notation : a string containing one or more characters : "r", "g" and "b"

examples :
		$('img').imageFilter('brightness', {factor: 2, channels: {red: true, green: false, blue: false}});
		...will only lighten the "red" channel

this is equivalent as :
		$('img').imageFilter('brightness', {factor: 2, channels: 'r'});

channels = 'r';  	// only red channel will be affected
channels = 'rg';  	// only red and green channels will be affected
channels = 'b';  	// only blue and green channels will be affected
channels = 'rgb';	// all channels are affected (default)
channels = '' 		// and empty string means: no channels will be affected



more examples :


// blurs all images with class "blurNow"
$('img.blurNow').imageFilter('blur', {radius: 4});

// grayscales and sharpens all images
$('img.blurNow').imageFilter('grayscale').imageFilter('sharpen');

