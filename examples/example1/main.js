var COMMANDS = {
	restore: function() {
		$('img.source').philter('restore');
	},
	
	blur: function() {
		$('img.source').philter('blur');
	},
	
	blur4: function() {
		$('img.source').philter('blur', {radius: 4});
	},
	
	blur8: function() {
		$('img.source').philter('blur', {radius: 8});
	},
	
	sharpen: function() {
		$('img.source').philter('sharpen');
	},

	sharpenmore: function() {
		$('img.source').philter('sharpen', {more: true});
	},

	emboss: function() {
		$('img.source').philter('emboss');
	},

	embossmore: function() {
		$('img.source').philter('emboss', {more: true});
	},
	
	edges: function() {
		$('img.source').philter('edges');
	},
	
	grayscale: function() {
		$('img.source').philter('grayscale');
	},
	
	sepia: function() {
		$('img.source').philter('sepia');
	},
	
	brightness150: function() {
		$('img.source').philter('brightness', {factor: 1.50});
	},

	brightness50: function() {
		$('img.source').philter('brightness', {factor: 0.50});
	},

	noise: function() {
		$('img.source').philter('noise');
	},

	contrast: function() {
		$('img.source').philter('contrast');
	},

	negate: function() {
		$('img.source').philter('negate');
	},
	
	sample: function() {
		$('img.source').philter('sample', {result: function(image, stat) {
			var nPix = image.width * image.height;
			var nMax = stat.reduce(function(nPrev, n) {
				return Math.max(nPrev, n[1]);
			}, 0);
			var oCanvas = $('<canvas width="512" height="256"></canvas>').get(0);
			var nHeight = oCanvas.height;
			var nWidth = oCanvas.width;
			var oContext = oCanvas.getContext('2d');
			stat.map(function(n) {
				return [n[0], nHeight * n[1] / nMax | 0];
			}).filter(function(n, i) {
				return i < nWidth;
			}).forEach(function(n, i) {
				oContext.fillStyle = n[0];
				oContext.fillRect(i, 256 - n[1], 1, n[1]);
			});			
			$('body').append(oCanvas);
		}});
	}
};

function main() {
	$('button.command').on('click', function(oEvent) {
		var $button = $(oEvent.target);
		var sCommand = $button.data('command');
		var p = COMMANDS[sCommand];
		$('div.example textarea').val('  ' + p.toString().replace(/\t/g, '  '));
		p();
	});
	var $img = $('img.source');
	var $progress = $('div.source progress');
	var $filter = $('div.source span');
	$img.on('philter.progress', function(oEvent, data) {
		$progress.val(data.f * 100 | 0);
	});
	$img.on('philter.complete', function(oEvent, data) {
		$filter.html('');
		$progress.val(100);
		$progress.css('visibility', 'hidden');
		console.log(data.filter, 'complete in ', data.time / 1000, 's');
	});
	$img.on('philter.start', function(oEvent, data) {
		$filter.html(data.filter);
		$progress.val(0);
		$progress.css('visibility', 'visible');
	});
	$img.philter('save');
}

$(window).on('load', main);
