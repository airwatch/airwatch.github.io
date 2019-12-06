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
					labels: ["07-28","07-29","07-30","07-31","08-01","08-02","08-03","08-04","08-05","08-06","08-07"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [10.004594594594595,4.790185676392572,3.7183823529411764,7.161273209549072,11.200589970501476,17.2726368159204,12.153846153846153,7.082211538461538,3.1107398568019096,3.431094527363184,6.930075187969925],
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
					labels: ["07-28","07-29","07-30","07-31","08-01","08-02","08-03","08-04","08-05","08-06","08-07"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [22.708333333333332,12,7.708333333333333,15.521739130434783,24.708333333333332,38.30434782608695,26.608695652173914,14.958333333333334,10.833333333333334,5.318181818181818,14.304347826086957],
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
					labels: ["07-28","07-29","07-30","07-31","08-01","08-02","08-03","08-04","08-05","08-06","08-07"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [0.0004000000000000001,0.0002110091743119266,0,0.00016867469879518071,0.00027272727272727274,0.0003518518518518519,0.00030701754385964913,0.00040350877192982455,0.00020175438596491227,0.0001923076923076923,0.00024210526315789478],
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
					labels: ["07-28","07-29","07-30","07-31","08-01","08-02","08-03","08-04","08-05","08-06","08-07"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [0.016293233082706766,0.006962500000000001,0.004801369863013699,0.011829457364341087,0.011483870967741937,0.019049689440993788,0.019375000000000003,0.012431137724550897,0.006285714285714286,0.0055,0.015070422535211266],
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
					labels: ["07-28","07-29","07-30","07-31","08-01","08-02","08-03","08-04","08-05","08-06","08-07"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [0.48,0.25152941176470583,0.20865168539325843,0.31799999999999995,0.3562857142857143,0.4668235294117647,0.49744186046511624,0.37261363636363626,0.27247191011235955,0.21728395061728392,0.38835616438356163],
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
					labels: ["07-28","07-29","07-30","07-31","08-01","08-02","08-03","08-04","08-05","08-06","08-07"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [0,0,0,0,0,0,0,0,0,0,0],
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
