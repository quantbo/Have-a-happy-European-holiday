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

//Default time series start date.
let dateInit = new Date(2016, 0, 1);

//For each time series, store the data, the initial date, and the grouping ('g') element.
//This allows the data to be re-used without reloading from disk.
//It also allows the initial date to be updated based on the most current initial date.
//Finally, it allows charts to be updated without re-doing fixed characteristics such as the chart dimensions, background color, and so on.
let status = {};
//Populate status.
d3.selectAll('svg').nodes().forEach((d, i) => {
	status[d.id] = {};
	loadData(d.id);
	status[d.id].dateInit = dateInit;
});

//Call renderChart inside the callback. Otherwise, renderCharts runs before the data are loaded.
function loadData(id) {
	const symbol = fred[id].symbol;
	d3.csv(`${symbol}.csv`, (error, data) => {
		if (error) throw new Error('d3.csv error');
		//Transform data from strings to dates and numbers.
		data.forEach((d, i) => {
			d.DATE = parseDate(d.DATE);
			d.VALUE = +d.VALUE;
		})
		status[id].data = data;
		status[id].g_el = renderChartFixed(id);
		renderChart(id);
	});
}

//Set domains.
function xScaleSetDomain(dataSub) {
	let xExtent = d3.extent(dataSub, (d) => {return d.DATE;});
	//Provide a 1 day buffer to left and right of x axis so that initial and terminal vertical lines do not lie at edges of display area.
	//A day expressed in milliseconds.
	const day = 24 * 60 * 60 * 1000;
	xExtent[0] = new Date(xExtent[0].valueOf() - day);
	xExtent[1] = new Date(xExtent[1].valueOf() + day);
	xScale.domain(xExtent);
}
function yScaleSetDomain(dataSub) {
	//Provide a buffer at bottom of y extent so that the minimum value does not disappear.
	//Provide a buffer at top so that largest values do not touch top of display area.
	let yExtent = d3.extent(dataSub, (d) => {return d.VALUE;});
	yExtent[0] = 0.95 * yExtent[0];
	yExtent[1] = 1.01 * yExtent[1];
	yScale.domain(yExtent);
}

function renderChart(id) {
	console.log('renderChart: ' + id);
	const data = status[id].data;
	let index = data.findIndex((x) => {return x.DATE >= status[id].dateInit;});
	console.log('index: ', index);
	let dataSub = data.slice(index); //data subset.
	console.log('data.length: ', dataSub.length);
	//Set scale domains.
	xScaleSetDomain(dataSub);
	yScaleSetDomain(dataSub);
	//Place a vertical line at each data point.
	let sw = strokeWidth(dataSub); //Adjust stroke width to number of data points.
	const g_el = status[id].g_el;
	g_el.selectAll('wombat') //Any non-empty string will serve here.
		.data(dataSub)
		.enter()
		.append('line')
		.attr('class', 'line')
		.style('stroke-width', sw)
		.attr('x1', (d) => {return xScale(d.DATE);})
		.attr('x2', (d) => {return xScale(d.DATE);})
		.attr('y1', innerHeight)
		.attr('y2', (d) => {return (isNaN(d.VALUE) ? innerHeight : yScale(d.VALUE));});
	//Axes. Must be generated after scales are specified.
	let xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m-%d"));
	g_el.append('g')
		.attr('id', 'xAxis')
		.attr('transform', `translate(0, ${innerHeight})`)
		.call(xAxis)
		.selectAll('text')
		.style('text-anchor', 'end')
		.attr('transform', 'rotate(-45)')
		.attr('dx', '-0.8em')
		.attr('dy', '0.1em');
	//y-axis
	let yAxis = d3.axisLeft(yScale);
	g_el.append('g')
		.attr('id', 'yAxis')
		.call(yAxis);

	d3.select('#euroIn').on('click', () => {
		let dateInit = status['euro'].dateInit;
		//During initial development arbitrarily choose a new dateInit.
		//Recall that in Javascript months are numbered from 0.
		dateInit = new Date(2016, 10, 15);
		status['euro'].dateInit = dateInit;
		let data = status['euro'].data;
		let index = data.findIndex((x) => {return x.DATE >= dateInit;});
		let dataSub = data.slice(index); //data subset.
		//Set scale domains.
		xScaleSetDomain(dataSub);
		yScaleSetDomain(dataSub);
		let sw = strokeWidth(dataSub); //Adjust stroke width to number of data points.
		console.log('sw: ', sw);
		let g_el = status['euro'].g_el;
		let update = g_el
			.selectAll('line')
			.data(dataSub, (d, i) => {
				return d.DATE; //Join data by DATE.
			});
		//Use the same transition duration for all transitions.
		let td = d3.transition().duration(2000);
		update
			.transition(td)
			.ease(d3.easeLinear)
			.attr('x1', (d) => {return xScale(d.DATE);})
			.attr('x2', (d) => {return xScale(d.DATE);})
			.attr('y1', innerHeight)
			.attr('y2', (d) => {return (isNaN(d.VALUE) ? innerHeight : yScale(d.VALUE));})
			.style('stroke-width', sw);

		//Update axes.
		g_el.select('#xAxis').transition(td).call(xAxis)
			.selectAll('text')
			.style('text-anchor', 'end')
			.attr('transform', 'rotate(-45)')
			.attr('dx', '-0.8em')
			.attr('dy', '0.1em');
		//Update y-axis.
		g_el.select('#yAxis').transition(td).call(yAxis);

		update.exit()
			.transition(td)
			.ease(d3.easeLinear)
			.attr('x1', 0)
			.attr('x2', 0)
			.remove();
	});

}
