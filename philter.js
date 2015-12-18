/**
 * image filter jquery plugin
 * @author raphael marandet
 * 
 * Apply various filters on any image.
 * 
 * Filters
 * -------
 * 
 * blur
 * - blurs the image
 * - use "radius" option to specify the blur radius in pixels
 * if the radius is 1 or ommitted, a standard blur will be performed
 * if the radius is 2 or more, a gaussian blur will be performed
 * 
 * sharpen
 * - sharpens the image, like unblur or something...
 * - if option "more" is set to true, the sharpen effect will be greater, showing edges excessively.
 * 
 * emboss
 * - give some sort of 3D shadow effect to the image, good for creating bump maps
 * - if option "more" is set to true, the emboss effect will be greater.
 * 
 * edges
 * - apply edge detection filter, the image will be darken, but the edges of shapes will be enlightened
 * 
 * resize
 * - resize the image
 * - use "width" and "height" options to specify new size in pixels
 * - example : $('img').imageFilter('resize', {width:64, height: 64});
 * [this filter will be improved in the future and will accept more usefull options]
 * 
 * grayscale
 * - applies a grayscaled palette on the image, removing all colors.
 * - example : $('img').imageFilter('grayscale');
 * 
 * brightness
 * - changes the image brightness
 * - use "factor" option with float value {factor: 0.5} means 50% darker, {factor: 2} means +100% lighter
 * - example : $('img').imageFilter('brightness', {factor: 0.75});  // all images are a bit darker now
 * 
 * noise
 * - adds noise to the image
 * - use "level" option (default value : 50) to control the amount of noise
 * 
 * 
 * tricks : 
 * for filters blur, blur2, sharpen, emboss, emboss2, brightness ; 
 * you can use the special option "channels" to specify what color channel will be affected
 * 
 * there are two notations for the channels option
 * - the "object" notation : {red: boolean, green: boolean, blue: boolean}
 * - the "string" notation : a string containing one or more characters : "r", "g" and "b"
 * 
 * examples :
 * 		$('img').imageFilter('brightness', {factor: 2, channels: {red: true, green: false, blue: false}});
 * 		...will only lighten the "red" channel
 * 
 * this is equivalent as :
 * 		$('img').imageFilter('brightness', {factor: 2, channels: 'r'});
 * 
 * channels = 'r';  	// only red channel will be affected
 * channels = 'rg';  	// only red and green channels will be affected
 * channels = 'b';  	// only blue and green channels will be affected
 * channels = 'rgb';	// all channels are affected (default)
 * channels = '' 		// and empty string means: no channels will be affected
 * 
 * 
 * 
 * more examples :
 * 
 * 
 * // blurs all images with class "blurNow"
 * $('img.blurNow').imageFilter('blur', {radius: 4});
 * 
 * // grayscales and sharpens all images
 * $('img.blurNow').imageFilter('grayscale').imageFilter('sharpen');
 * 
 * 
 */
(function ($) {
	var sPluginName = 'philter';
	var oPlugin = {};
	oPlugin[sPluginName] = function(p1, p2) {
		var oDefaults = {
			matrix: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
			bias: 0,
			factor: 1,
			more: false,
			radius: 1,
			level: 50,
			
			channels: {
				red: true,
				green: true,
				blue: true,
				alpha: true
			}
		};
		
		var DATA_BACKUP = sPluginName + '_imageBackup';
		
		// analyzing parameters
		var s1 = (typeof p1).charAt(0);
		var s2 = (typeof p2).charAt(0);
		var oOptions;
		switch (s1 + s2) {
			case 'su': // one string
				oOptions = {command: p1};
			break;
			
			case 'so': // one string, one object
				oOptions = p2;
				oOptions.command = p1;
			break;
			
			case 'ou': // one object
				oOptions = p1;
			break;
			
			default:
				throw new Error('bad parameter format');
		}
		if (typeof oOptions.channels === 'string') {
			var s1 = oOptions.channels;
			oOptions.channels = {
				red: s1.indexOf('r') >= 0,
				green: s1.indexOf('g') >= 0,
				blue: s1.indexOf('b') >= 0,
				alpha: s1.indexOf('a') >= 0
			};
		}
		oOptions = $.extend(true, oDefaults, oOptions);
		
		
		/**
		 * builds a canvas and copy the given image content inside this canvas
		 * builds a pixel buffer
		 * builds a structure containing references to the image, the canvas
		 * and the pixel buffer
		 * @param oImage DOM Image
		 * @return a structure
		 */
		function buildShadowCanvas(oImage) {
			var $canvas = $('<canvas></canvas>');
			var w = oImage.width;
			var h = oImage.height;
			var oCanvas = $canvas.get(0);
			oCanvas.width = w;
			oCanvas.height = h;
			var ctx = oCanvas.getContext('2d');
			ctx.drawImage(oImage, 0, 0);
			var imgdata = ctx.getImageData(0, 0, w, h);
			var data = new Uint32Array(imgdata.data.buffer);
			
			return {
				image: oImage,
				canvas: oCanvas,
				context: ctx,
				imageData: imgdata,
				pixelData: imgdata.data,
				pixels: data,
				width: w,
				height: h,
				_p: false
			};
		}
		
		/**
		 * Copies the pixel data buffer to the original image ;
		 * This operation visually modify the image
		 * @param sc Structure built by buildShadowCanvas()
		 */
		function commitShadowCanvas(sc) {
			if (sc._p) {
				sc.context.putImageData(sc.imageData, 0, 0);
			}
			sc.image.src = sc.canvas.toDataURL();
		}

		/**
		 * Change pixel value
		 * @param sc Shadow Canvas structure
		 * @param x pixel x
		 * @param y pixel y
		 * @param c Color structure {r: int, g: int, b: int, a: int}
		 */
		function setPixel(sc, x, y, c) {
			if (x >= 0 && y >= 0 && x < sc.width && y < sc.height) {
				var n = y * sc.width + x;
				sc.pixels[n] = c.r | (c.g << 8) | (c.b << 16) | (c.a << 24);
				sc._p = true;
			}
		}

		/**
		 * Get a color structure of the given pixel
		 * if a color structure is specified, the function will fill this
		 * structure with pixel color values. this will prevent from
		 * building a new object each time a pixel is read,
		 * and will potentially increase overall performances
		 * in all cases, the color structure is also returned
		 * @param sc Shadow Canvas structure
		 * @param x pixel x
		 * @param y pixel y
		 * @param oResult optional Color structure {r: int, g: int, b: int, a: int}
		 * @return Color structure
		 */
		function getPixel(sc, x, y, oResult) {
			if (oResult === undefined) {
				oResult = {};
			}
			if (x >= 0 && y >= 0 && x < sc.width && y < sc.height) {
				var n = y * sc.width + x;
				var p = sc.pixels[n];
				oResult.r = p & 255;
				oResult.g = (p >> 8) & 255;
				oResult.b = (p >> 16) & 255;
				oResult.a = (p >> 24) & 255;
				return oResult;
			} else {
				return null;
			}
		}
		
		
		function pixelFilter(oImage, pFunc) {
			var x, y, p = {}, r = {};
			var sc = buildShadowCanvas(oImage);
			var w = sc.width;
			var h = sc.height;
			var Ch = oOptions.channels;
			var bChr = Ch.red;
			var bChg = Ch.green;
			var bChb = Ch.blue;
			var bCha = Ch.alpha;
			var factor = oOptions.factor;
			var bias = oOptions.bias;
			for (y = 0; y < h; ++y) {
				for (x = 0; x < w; ++x) {
					getPixel(sc, x, y, p);
					r.r = p.r;
					r.g = p.g;
					r.b = p.b;
					r.a = p.a;
					pFunc(sc, x, y, p);
					if (bChr) {
						r.r = Math.min(255, Math.max(0, factor * p.r + bias)) | 0;
					}
					if (bChg) {
						r.g = Math.min(255, Math.max(0, factor * p.g + bias)) | 0;
					}
					if (bChb) {
						r.b = Math.min(255, Math.max(0, factor * p.b + bias)) | 0;
					}
					if (bCha) {
						r.a = Math.min(255, Math.max(0, factor * p.a + bias)) | 0;
					}
					setPixel(sc, x, y, r);
				}
			}
			commitShadowCanvas(sc);
		}
		
		function filterContrast(oImage) {
			var c = oOptions.level;
			var f = (259 * (c + 255)) / (255 * (259 - c));
			pixelFilter(oImage, function(sc, x, y, p) {
				p.r = f * (p.r - 128) + 128;
				p.g = f * (p.g - 128) + 128;
				p.b = f * (p.b - 128) + 128;
			});
		}
		
		function filterColor(oImage) {
			var m = oOptions.matrix;
			if (m.length < 3) {
				throw new Error('color matrix must be 3x3 sized');
			}
			if (m[0].length < 3 || m[1].length < 3 || m[2].length < 3) {
				throw new Error('color matrix must be 3x3 sized');
			}
			pixelFilter(oImage, function(sc, x, y, p) {
				var r = (p.r * m[0][0] + p.g * m[0][1] + p.b * m[0][2]);
				var g = (p.r * m[1][0] + p.g * m[1][1] + p.b * m[1][2]);
				var b = (p.r * m[2][0] + p.g * m[2][1] + p.b * m[2][2]);
				p.r = r;
				p.g = g;
				p.b = b;
			});
		}
		
		function filterNoise(oImage) {
			var nAmount = oOptions.level;
			pixelFilter(oImage, function(sc, x, y, p) {
				var nb = nAmount * (Math.random() - 0.5);
				p.r = Math.min(255, Math.max(0, p.r + nb)) | 0;
				p.g = Math.min(255, Math.max(0, p.g + nb)) | 0;
				p.b = Math.min(255, Math.max(0, p.b + nb)) | 0;
			});
		}
		
		/**
		 * filter: convolution
		 * applies a convolution matrix on the image
		 * used options:
		 * 	- matrix
		 *  - factor
		 * 	- bias
		 */
		function filterConvolution(oImage) {
			var x, y, p = {}, nc = {}, xyf;
			var scs = buildShadowCanvas(oImage);
			var scd = buildShadowCanvas(oImage);
			var w = scs.width;
			var h = scs.height;
			var factor = oOptions.factor;
			var bias = oOptions.bias;
			var xf, yf;
			var aMatrix = oOptions.matrix;
			var xm, ym;
			var yfCount = aMatrix.length;
			var xfCount = yfCount > 0 ? aMatrix[0].length : 0;
			var Ch = oOptions.channels;
			var bChr = Ch.red;
			var bChg = Ch.green;
			var bChb = Ch.blue;
			for (y = 0; y < h; ++y) {
				for (x = 0; x < w; ++x) {
					getPixel(scs, x, y, nc);
					if (bChr) {
						nc.r = 0;
					}
					if (bChg) {
						nc.g = 0;
					}
					if (bChb) {
						nc.b = 0;
					}
					for (yf = 0; yf < yfCount; ++yf) {
						for (xf = 0; xf < xfCount; ++xf) {
							xm = (x - (xfCount >> 1) + xf + w) % w;
							ym = (y - (yfCount >> 1) + yf + h) % h;
							if (getPixel(scs, xm, ym, p)) {
								xyf = aMatrix[yf][xf];
								if (bChr) {
									nc.r += p.r * xyf;
								}
								if (bChg) {
									nc.g += p.g * xyf;
								}
								if (bChb) {
									nc.b += p.b * xyf;
								}
							}
						}
					}
					if (bChr) {
						nc.r = Math.min(255, Math.max(0, factor * nc.r + bias)) | 0;
					}
					if (bChg) {
						nc.g = Math.min(255, Math.max(0, factor * nc.g + bias)) | 0;
					}
					if (bChb) {
						nc.b = Math.min(255, Math.max(0, factor * nc.b + bias)) | 0;
					}
					setPixel(scd, x, y, nc);
				}
			}
			commitShadowCanvas(scd);			
		}
		
		/**
		 * filter: resize
		 * resize the image
		 * used options:
		 * 	- width
		 *  - height
		 */
		function filterResize(oImage) {
			var scs = buildShadowCanvas(oImage);
			var w = oOptions.width;
			var h = oOptions.height;
			scs.canvas.width = w;
			scs.canvas.height = h;
			scs.context = scs.canvas.getContext('2d');
			scs.context.drawImage(scs.image, 0, 0, scs.width, scs.height, 0, 0, w, h);
			scs.width = w;
			scs.height = h;
			commitShadowCanvas(scs);
		}
		
		function buildGaussianBlurMatrix(phi) {
			var nSize = Math.max(1, Math.ceil(phi * 3));
			var a = [], row;
			var y, x;
			for (y = -nSize; y <= nSize; ++y) {
				row = [];
				for (x = -nSize; x <= nSize; ++x) {
					row.push((1 / (2 * Math.PI * phi * phi)) * Math.exp(-(x * x + y * y) / (2 * phi * phi)));
				}
				a.push(row);
			}
			return a;
		}
		
		function restore(oImage) {
			var $img = $(oImage);
			var sSrc = $img.data(DATA_BACKUP);
			if (sSrc) {
				$img.attr('src', sSrc);
			}
		}

		function save(oImage) {
			var $img = $(oImage);
			$img.data(DATA_BACKUP, $img.attr('src'));
		}

		/**
		 * main function
		 * analyzes options.command and run the corresponding filter
		 */
		function main() {
			var $this = $(this);
			switch (oOptions.command) {
				case 'blur':
					if (oOptions.radius < 2) {
						oOptions.matrix = [
							[0.0, 0.2, 0.0],
							[0.2, 0.2, 0.2],
							[0.0, 0.2, 0.0]
						];
					} else {
						oOptions.matrix = buildGaussianBlurMatrix(Math.max(2, oOptions.radius) / 3);
					}
					filterConvolution(this);
				break;

				case 'sharpen':
					if (oOptions.more) {
						oOptions.matrix = [
							[1,  1,  1], 
							[1, -7,  1], 
							[1,  1,  1] 
						];
					} else {
						oOptions.matrix = [
							[-1, -1, -1, -1, -1], 
							[-1,  2,  2,  2, -1], 
							[-1,  2,  8,  2, -1], 
							[-1,  2,  2,  2, -1], 
							[-1, -1, -1, -1, -1]
						];
						oOptions.factor = 1/8;
					}
					filterConvolution(this);
				break;
				
				case 'edges':
					oOptions.matrix = [
						[-1, -1, -1], 
						[-1,  8, -1], 
						[-1, -1, -1] 
					];
					filterConvolution(this);
				break;
				
				case 'emboss':
					if (oOptions.more) {
						oOptions.matrix = [
							[-2, -1,  0], 
							[-1,  1,  1], 
							[ 0,  1,  2]
						];
					} else {
						oOptions.matrix = [
							[-1, -1,  0], 
							[-1,  1,  1], 
							[ 0,  1,  1]
						];
					}
					filterConvolution(this);
				break;

				case 'grayscale':
					oOptions.matrix = [
						[0.30, 0.59, 0.11], 
						[0.30, 0.59, 0.11], 
						[0.30, 0.59, 0.11]
					];
					filterColor(this);
				break;
				
				case 'sepia':
					oOptions.matrix = [
						[0.393, 0.769, 0.189],
						[0.349, 0.686, 0.168],
						[0.272, 0.534, 0.131]
					];
					filterColor(this);
				break;

				case 'color':
					filterColor(this);
				break;
				
				case 'noise':
					filterNoise(this);
				break;
				
				case 'matrix':
					filterConvolution(this);
				break;
				
				case 'resize':
					filterResize(this);
				break;
				
				case 'brightness':
					oOptions.matrix = [
						[0, 0, 0], 
						[0, 1, 0], 
						[0, 0, 0]
					];
					filterConvolution(this);
				break;
				
				
				case 'contrast':
					filterContrast(this);
				break;

				/**
				 * Save the image src attribute value
				 * Usefull in combination with the 'restore' command
				 * to undo any changes
				 */
				case 'save':
					save(this);
				break;

				/**
				 * Restore the image src attribute value
				 * Must be called after a 'save' operation
				 */
				case 'restore':
					restore(this);
				break;

			}
		};

		return this.each(main);
	};
	$.fn.extend(oPlugin);
})(jQuery);
