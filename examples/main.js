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
	$img.on('philter.debug', function(e, s) {
		//console.log(s);
	});
}

$(window).on('load', main);
