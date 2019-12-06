'use strict';

window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

(function(global) {
	var MONTHS = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	var COLORS = [
		'#4dc9f6',
		'#f67019',
		'#f53794',
		'#537bc4',
		'#acc236',
		'#166a8f',
		'#00a950',
		'#58595b',
		'#8549ba'
	];

	var Samples = global.Samples || (global.Samples = {});
	var Color = global.Color;

	Samples.utils = {
		// Adapted from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
		srand: function(seed) {
			this._seed = seed;
		},

		rand: function(min, max) {
			var seed = this._seed;
			min = min === undefined ? 0 : min;
			max = max === undefined ? 1 : max;
			this._seed = (seed * 9301 + 49297) % 233280;
			return min + (this._seed / 233280) * (max - min);
		},

		numbers: function(config) {
			var cfg = config || {};
			var min = cfg.min || 0;
			var max = cfg.max || 1;
			var from = cfg.from || [];
			var count = cfg.count || 8;
			var decimals = cfg.decimals || 8;
			var continuity = cfg.continuity || 1;
			var dfactor = Math.pow(10, decimals) || 0;
			var data = [];
			var i, value;

			for (i = 0; i < count; ++i) {
				value = (from[i] || 0) + this.rand(min, max);
				if (this.rand() <= continuity) {
					data.push(Math.round(dfactor * value) / dfactor);
				} else {
					data.push(null);
				}
			}

			return data;
		},

		labels: function(config) {
			var cfg = config || {};
			var min = cfg.min || 0;
			var max = cfg.max || 100;
			var count = cfg.count || 8;
			var step = (max - min) / count;
			var decimals = cfg.decimals || 8;
			var dfactor = Math.pow(10, decimals) || 0;
			var prefix = cfg.prefix || '';
			var values = [];
			var i;

			for (i = min; i < max; i += step) {
				values.push(prefix + Math.round(dfactor * i) / dfactor);
			}

			return values;
		},

		months: function(config) {
			var cfg = config || {};
			var count = cfg.count || 12;
			var section = cfg.section;
			var values = [];
			var i, value;

			for (i = 0; i < count; ++i) {
				value = MONTHS[Math.ceil(i) % 12];
				values.push(value.substring(0, section));
			}

			return values;
		},

		color: function(index) {
			return COLORS[index % COLORS.length];
		},

		transparentize: function(color, opacity) {
			var alpha = opacity === undefined ? 0.5 : 1 - opacity;
			return Color(color).alpha(alpha).rgbString();
		}
	};

	// DEPRECATED
	window.randomScalingFactor = function() {
		return Math.round(Samples.utils.rand(-100, 100));
	};

	// INITIALIZATION

	Samples.utils.srand(Date.now());

	// Google Analytics
	/* eslint-disable */
	if (document.location.hostname.match(/^(www\.)?chartjs\.org$/)) {
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
		ga('create', 'UA-28909194-3', 'auto');
		ga('send', 'pageview');
	}
	/* eslint-enable */

}(this));

/* global Chart */

'use strict';

(function() {
	Chart.plugins.register({
		id: 'samples-filler-analyser',

		beforeInit: function(chart, options) {
			this.element = document.getElementById(options.target);
		},

		afterUpdate: function(chart) {
			var datasets = chart.data.datasets;
			var element = this.element;
			var stats = [];
			var meta, i, ilen, dataset;

			if (!element) {
				return;
			}

			for (i = 0, ilen = datasets.length; i < ilen; ++i) {
				meta = chart.getDatasetMeta(i).$filler;
				if (meta) {
					dataset = datasets[i];
					stats.push({
						fill: dataset.fill,
						target: meta.fill,
						visible: meta.visible,
						index: i
					});
				}
			}

			this.element.innerHTML = '<table>' +
				'<tr>' +
					'<th>Dataset</th>' +
					'<th>Fill</th>' +
					'<th>Target (visibility)</th>' +
				'</tr>' +
				stats.map(function(stat) {
					var target = stat.target;
					var row =
						'<td><b>' + stat.index + '</b></td>' +
						'<td>' + JSON.stringify(stat.fill) + '</td>';

					if (target === false) {
						target = 'none';
					} else if (isFinite(target)) {
						target = 'dataset ' + target;
					} else {
						target = 'boundary "' + target + '"';
					}

					if (stat.visible) {
						row += '<td>' + target + '</td>';
					} else {
						row += '<td>(hidden)</td>';
					}

					return '<tr>' + row + '</tr>';
				}).join('') + '</table>';
		}
	});
}());


var presets = window.chartColors;
		var utils = Samples.utils;
		var inputs = {
			min: -100,
			max: 100,
			count: 8,
			decimals: 2,
			continuity: 1
		};

		function generateData(config) {
			return utils.numbers(Chart.helpers.merge(inputs, config || {}));
		}

		function generateLabels(config) {
			return utils.months(Chart.helpers.merge({
				count: inputs.count,
				section: 3
			}, config || {}));
		}

		var options = {
			maintainAspectRatio: false,
			spanGaps: false,
			elements: {
				line: {
					tension: 0.000001
				}
			},
			plugins: {
				filler: {
					propagate: false
				}
			},
			scales: {
				xAxes: [{
					ticks: {
						autoSkip: false,
						maxRotation: 0
					}
				}]
			}
		};



			new Chart('chart-0', {
				type: 'line',
				data: {
					labels: ["11-23","11-24","11-25","11-26","11-27","11-28","11-29","11-30","12-01","12-02","12-03","12-04","12-05"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [9.533333333333335,11.875,10.72,9.681481481481482,7.300000000000001,1.390909090909091,3.4250000000000003,7.0625,9.249999999999998,13.550000000000002,13.825,6.85,2.355],
						label: 'PM25'
					}]
				},
				options: Chart.helpers.merge(options, {
					title: {
						display: false
					}
				})
			});

                        new Chart('chart-1', {
				type: 'line',
				data: {
					labels: ["11-23","11-24","11-25","11-26","11-27","11-28","11-29","11-30","12-01","12-02","12-03","12-04","12-05"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [23.962962962962962,33,22.84,26.833333333333332,24.8125,8.692307692307692,18.77777777777778,19.444444444444443,27.59259259259259,32.18518518518518,33.611111111111114,60.86666666666667,13.266666666666667],
						label: 'PM10'
					}]
				},
				options: Chart.helpers.merge(options, {
					title: {
						display: false
					}
				})
			});

                       new Chart('chart-2', {
				type: 'line',
				data: {
					labels: ["11-23","11-24","11-25","11-26","11-27","11-28","11-29","11-30","12-01","12-02","12-03","12-04","12-05"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [0,0,0,0,0,0,0,0,0,0,0,0,0],
						label: 'SO2'
					}]
				},
				options: Chart.helpers.merge(options, {
					title: {
						display: false
					}
				})
			});

new Chart('chart-3', {
				type: 'line',
				data: {
					labels: ["11-23","11-24","11-25","11-26","11-27","11-28","11-29","11-30","12-01","12-02","12-03","12-04","12-05"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [0.02344444444444445,0.035,0.021666666666666667,0.02488888888888889,0.027166666666666672,0.0052499999999999995,0.013,0.023833333333333335,0.026666666666666665,0.027333333333333334,0.025500000000000005,0.0066000000000000026,0.006733333333333333],
						label: 'NO2'
					}]
				},
				options: Chart.helpers.merge(options, {
					title: {
						display: false
					}
				})
			});

new Chart('chart-4', {
				type: 'line',
				data: {
					labels: ["11-23","11-24","11-25","11-26","11-27","11-28","11-29","11-30","12-01","12-02","12-03","12-04","12-05"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [1.3666666666666665,1.37,1.0400000000000003,1.042777777777778,0.85,0.08600000000000001,0.19,0.43999999999999995,0.9083333333333333,1.4283333333333335,1.165,0.254,0.236],
						label: 'CO'
					}]
				},
				options: Chart.helpers.merge(options, {
					title: {
						display: false
					}
				})
			});

new Chart('chart-5', {
				type: 'line',
				data: {
					labels: ["11-23","11-24","11-25","11-26","11-27","11-28","11-29","11-30","12-01","12-02","12-03","12-04","12-05"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [0,0,0,0,0,0,0,0,0,0,0,0,0],
						label: 'BC'
					}]
				},
				options: Chart.helpers.merge(options, {
					title: {
						display: false
					}
				})
			});

		// eslint-disable-next-line no-unused-vars
		function toggleSmooth(btn) {
			var value = btn.classList.toggle('btn-on');
			Chart.helpers.each(Chart.instances, function(chart) {
				chart.options.elements.line.tension = value ? 0.4 : 0.000001;
				chart.update();
			});
		}

		// eslint-disable-next-line no-unused-vars
		function randomize() {
			var seed = utils.rand();
			Chart.helpers.each(Chart.instances, function(chart) {
				utils.srand(seed);

				chart.data.datasets.forEach(function(dataset) {
					dataset.data = generateData();
				});

				chart.update();
			});
		}
