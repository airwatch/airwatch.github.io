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
					labels: ["10-27","10-28","10-29","10-30","10-31","11-01","11-02","11-03","11-04","11-05","11-06","11-07","11-08","11-09"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [3.180821917808219,7.705357142857143,10.411188811188813,4.119999999999999,3.731858407079646,9.148550724637682,14.891752577319588,8.762937062937063,5.004929577464789,7.8724137931034495,15.142857142857142,13.899999999999999,13.600000000000001,3.6297297297297306],
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
					labels: ["10-27","10-28","10-29","10-30","10-31","11-01","11-02","11-03","11-04","11-05","11-06","11-07","11-08","11-09"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [6.520833333333333,7.3478260869565215,16.020833333333332,10.375,5.804347826086956,15.4375,22.319148936170212,10.833333333333334,9.416666666666666,9.958333333333334,11.068181818181818,13.791666666666666,19.044444444444444,41.23809523809524],
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
					labels: ["10-27","10-28","10-29","10-30","10-31","11-01","11-02","11-03","11-04","11-05","11-06","11-07","11-08","11-09"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [0.003770833333333334,0.0025434782608695656,0.0025,0.002521739130434783,0.0023095238095238095,0.001729166666666667,0.0016250000000000004,0.0017708333333333335,0.0023125000000000003,0.0018913043478260875,0.0017142857142857144,0.0019375,0.0016875000000000004,0.0015],
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
					labels: ["10-27","10-28","10-29","10-30","10-31","11-01","11-02","11-03","11-04","11-05","11-06","11-07","11-08","11-09"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [0.011250000000000001,0.013260869565217394,0.006333333333333334,0.0023333333333333335,0.006380952380952381,0.009541666666666667,0.022500000000000003,0.006541666666666667,0.008375,0.015958333333333335,0.012636363636363638,0.018500000000000006,0.020650000000000005,0.0047391304347826095],
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
					labels: ["10-27","10-28","10-29","10-30","10-31","11-01","11-02","11-03","11-04","11-05","11-06","11-07","11-08","11-09"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [0.40249999999999997,0.27260869565217394,0.20521739130434785,0.3068181818181819,0.23173913043478261,0.24833333333333332,0.5825,0.40041666666666664,0.47875,0.3969565217391304,0.29400000000000004,0.41208333333333336,0.33041666666666664,0.275],
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
					labels: ["10-27","10-28","10-29","10-30","10-31","11-01","11-02","11-03","11-04","11-05","11-06","11-07","11-08","11-09"],
					datasets: [{
						backgroundColor: utils.transparentize(presets.red),
						borderColor: presets.red,
						data: [0.8241666666666667,1.077391304347826,0.9070833333333334,0.3279166666666667,0.47130434782608693,1.0166666666666666,2.55375,0.7345833333333335,0.67125,1.4958333333333333,1.2336363636363636,2.0366666666666666,1.9154166666666665,0.38875],
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
