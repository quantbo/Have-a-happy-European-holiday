'use strict';

const body = d3.select('body').node();
//Match the width of the SVG element to the width of the body.
const width = body.getBoundingClientRect().width;
console.log('body width: ' + width);
const height = 0.66 * width;
const margin = {top: 35, right: 30, bottom: 55, left: 50};
const innerHeight = height - margin.top - margin.bottom;
const innerWidth = width - margin.left - margin.right;

//Parse date function. Dates are in the format 1999-12-01 (year-month-day).
const parseDate = d3.timeParse('%Y-%m-%d');

//Set ranges. User interactions may cause scales to change.
let xScale = d3.scaleTime().range([0, innerWidth]);
let yScale = d3.scaleLinear().range([innerHeight, 0]);

d3.selectAll('svg').nodes().forEach((d, i) => {
	console.log('----- ' + d.id + ' -----');
	renderChart(d.id);
});

function renderChart(id) {
	//id: SVG id.
	const item = fred[id];
	const svg = d3.select(`#${id}`)
		.attr('width', `${width}`)
		.attr('height', `${height}`);
	//A rectangle congruent with the svg element is helpful during development.
	//In production, comment out.
//	const rect = svg.append('rect')
//		.attr('height', `${height}px`)
//		.attr('width', `${width}px`)
//		.style('fill', 'none')
//		.style('stroke', 'black')
//		.style('stroke-width', '1px');
	const g_el = svg.append('g')
		.attr('height', innerHeight)
		.attr('width', innerWidth)
		.attr('transform', `translate(${margin.left}, ${margin.top})`);
	//Append a rectangle to provide a background color to the display area.
	g_el.append('rect')
		.attr('id', 'plotArea')
		.attr('height', innerHeight)
		.attr('width', innerWidth);
	//Graph title.
	g_el.append('text')
		.text(item['title'])
		.attr('class', 'title')
		.attr('x', innerWidth / 2)
		.attr('y', 0)
		.attr('dy', -0.3 * margin.top)
		.attr('text-anchor', 'middle');
	//Cite data source.
	g_el.append('text')
		.text(item['citation'])
		.attr('class', 'citation')
		.attr('x', innerWidth)
		.attr('y', innerHeight)
		.attr('dy', 0.65 * margin.right)
		.attr('transform', `rotate(-90, ${innerWidth}, ${innerHeight})`);

	//Load the data.
	const symbol = item['symbol'];
	console.log(symbol);
	d3.csv(`${symbol}.csv`, (error, data) => {
		if (error) throw new Error('d3.csv error');
//		//Focus on a subset of records.
//		const subset = 2*365;
//		const cut = data.length - subset;
//		data = data.slice(cut);
		//Begin on first day of 2016.
		let index = data.findIndex((x) => {return x.DATE.match('2016')});
		console.log('index: ', index);
		//Discard data before 2016.
		data = data.slice(index);
		console.log('data.length: ', data.length);
		//Transform data from strings to dates and numbers.
		data.forEach((d, i) => {
			d.DATE = parseDate(d.DATE);
			d.VALUE = +d.VALUE;
		})
		//Set scale domains.
		let xExtent = d3.extent(data, (d) => {return d.DATE;});
		//Provide a 1 day buffer to left and right of x axis so that initial and terminal vertical line do not lie at edges of display area.
		//A day expressed in milliseconds.
		const day = 24 * 60 * 60 * 1000;
		xExtent[0] = new Date(xExtent[0].valueOf() - day);
		xExtent[1] = new Date(xExtent[1].valueOf() + day);
		xScale.domain(xExtent);
		//Provide a buffer at bottom of y extent so that the minimum value does not disappear.
		//Provide a buffer at to so that largest values do not touch top of display area.
		let yExtent = d3.extent(data, (d) => {return d.VALUE;});
		yExtent[0] = 0.95 * yExtent[0];
		yExtent[1] = 1.01 * yExtent[1];
		yScale.domain(yExtent);
		//Place a vertical line at each data point.
		//Adjust the stroke-width to the number of data points.
		let sw = 2;
		if (data.length <= 32) {
			sw = 8;
		} else
		if (data.length <= 64) {
			sw = 6;
		} else
		if (data.length <= 128) {
			sw = 4;
		}
		g_el.selectAll('wombat') //Any non-empty string will serve here.
			.data(data)
			.enter()
			.append('line')
			.attr('class', 'line')
			.style('stroke-width', sw)
			.attr('x1', (d) => {return xScale(d.DATE);})
			.attr('x2', (d) => {return xScale(d.DATE);})
			.attr('y1', innerHeight)
			.attr('y2', (d) => {return (isNaN(d.VALUE) ? innerHeight : yScale(d.VALUE));});
		//Axes.
		//x-axis
		g_el.append('g')
			.attr('transform', `translate(0, ${innerHeight})`)
			.call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m-%d")))
			.selectAll('text')
			.style('text-anchor', 'end')
			.attr('transform', 'rotate(-45)')
			.attr('dx', '-0.8em')
			.attr('dy', '0.1em');
		//y-axis
		g_el.append('g')
			.call(d3.axisLeft(yScale));
	})
}
