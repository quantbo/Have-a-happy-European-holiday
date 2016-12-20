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

//For each time series store the data and the initial date.
//This allows the data to be re-used without reloading from disk.
//It also allows the initial date to be updated based on the current initial date.
let status = {};
//Populate status.
d3.selectAll('div').nodes().forEach((d, i) => {
	status[d.id] = {};
	loadData(d.id);
	status[d.id].dateInit = dateInit;
});
console.log('status:');
console.log(status);

//Call renderChart inside the callback. Otherwise, renderChart runs before the data are loaded.
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
		const g_el = renderChartFixed(id);
		renderChart(id, g_el);
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

function renderChart(id, g_el) {
	console.log('renderChart: ' + id);
	const dataAll = status[id].data;
	let index = dataAll.findIndex((x) => {return x.DATE >= status[id].dateInit;});
	console.log('index: ', index);
	let dataSub = dataAll.slice(index); //data subset.
	let count = dataSub.length;
	console.log('dataSub.length: ', count);
	//Set scale domains.
	xScaleSetDomain(dataSub);
	yScaleSetDomain(dataSub);
	//Place a vertical line at each data point.
	let sw = strokeWidth(dataSub); //Adjust stroke width to number of data points.
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

	//========== zoomIn ==========
	d3.select(`#${id}`).select('#zoomIn').on('click', () => {
		console.log(`zoomIn, id = ${id}  count = ${count}`);
		//If the number of data points is less than 2 weeks, grey the button and return.
		if (count < 14) {
			let me = d3.select(`#${id}`).select('#zoomIn');
			me.disabled = true;
			me.style('background-color', 'rgba(128, 128, 128, 1)');
			return;
		}
		//Update dateInit.
		let dateInit = status[id].dateInit;
		console.log(`dateInit (before update): ${dateInit}`);
		count = Math.round(count/2);
		dateInit = addDays(dateInit, count);
		console.log(`dateInit (after update): ${dateInit}`);
		status[id].dateInit = dateInit;
		let index = dataAll.findIndex((x) => {return x.DATE >= dateInit;});
		dataSub = dataAll.slice(index); //data subset.
		//Set scale domains.
		xScaleSetDomain(dataSub);
		yScaleSetDomain(dataSub);
		let sw = strokeWidth(dataSub); //Adjust stroke width to number of data points.
		console.log('sw: ', sw);
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
