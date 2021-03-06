'use strict';

const body = d3.select('body').node();
//Match the width of the SVG element to the width of the body.
const width = body.getBoundingClientRect().width;
const height = 0.6 * width;
const margin = {top: 35, right: 30, bottom: 55, left: 50};
const innerHeight = height - margin.top - margin.bottom;
const innerWidth = width - margin.left - margin.right;

//Parse date function. Dates are in the format 1999-12-01 (year-month-day).
const parseDate = d3.timeParse('%Y-%m-%d');

//Set ranges. User interactions may cause scales to change.
let xScale = d3.scaleTime().range([0, innerWidth]);
let yScale = d3.scaleLinear().range([innerHeight, 0]);

//Setting transitions through a global variable, as commented out, does not work.
//const td = d3.transition().duration(2000).ease(d3.easeLinear); //DOES NOT WORK.
//Setting transitions through a function does work.
//This violates the principal that functions are first class variables in Javascript.
//This is an instance where a function and a non-function variable are treated differently by the interpreter.
function get_td() {
	return d3.transition().duration(1250).ease(d3.easeLinear);
}

//Default time series start date.
const dateInit = new Date(2016, 0, 1);
//Dealing with large amounts of daily data can slow some browsers to a crawl and cause them to become confused.
//Until browsers and computers become more powerful it is prudent to limit the amount of data.
const dateMin = new Date(2011, 0, 1);
//When incrementing dates it is necessary to avoid incrementing past the maximum date in the data set.
//In the event that different time series have different end dates, dateMax is an object literal.
let dateMax = {}; //Set values when time series are loaded.

//For each time series store the data and track zooming in and out.
//Zooming in and out should be managed so that the initial date is restored. In other words, the user should be able to return to the initial view. The following stacks support that goal.
let status = {};
//Populate status.
d3.selectAll('div.outer').nodes().forEach((d, i) => {
	status[d.id] = {};
	loadData(d.id);
	status[d.id].dateInit = dateInit;
	//The following stacks track how many records are added or subtracted from a chart.
	//If both stacks are empty this corresponds to the initial view.
	status[d.id].iStack = []; //Track zooming in from initial view.
	status[d.id].oStack = []; //Track zooming out from initial view.
});

let debug = true;

//Display stacks. Use during debugging.
function displayStacks(id, comment, debug) {
	if (!debug) return;
	console.log(`* iStack (${comment}):`);
	console.log(status[id].iStack);
	console.log(`* oStack (${comment}):`);
	console.log(status[id].oStack);	
}

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
		//Trim the data. Too much data can slow processing and scramble the browser's brain.
		let index = data.findIndex((x) => {return x.DATE >= dateMin;});
		data = data.slice(index);
		//Find the maximum.
		dateMax[id] = d3.max(data, (d) => {return d.DATE;});
		status[id].data = data;
		const g_el = renderChartFixed(id);
		renderChart(id, g_el);
	});
}

//Functions that set domains.
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
	const countAll = dataAll.length;
	let index = dataAll.findIndex((x) => {return x.DATE >= status[id].dateInit;});
	let dataSub = dataAll.slice(index); //data subset.
	let countSub = dataSub.length;
	console.log(`countSub: ${countSub}`);
	//Set scale domains.
	xScaleSetDomain(dataSub);
	yScaleSetDomain(dataSub);
	//Place a vertical line at each data point.
	let sw = strokeWidth(countSub); //Adjust stroke width to number of data points.
	console.log(`sw: ${sw}`);
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

	//================ zoomIn ================
	d3.select(`#${id}`).select('#zoomIn').on('click', () => {
		console.log(`---------- zoomIn, id = ${id}  countSub (before update) = ${countSub}`);
		//If the number of data points is <= lolim, return.
		const lolim = 28;
		if (countSub <= lolim) {
			return;
		}
		//If necessary, un-gray zoomOut.
		ungray(id, 'zoomOut');
		//Display stacks before zoom.
		displayStacks(id, 'before zoom');
		//Update dateInit.
		let dateInit = status[id].dateInit;
		console.log(`dateInit (before update): ${dateInit}`);
		let delta = -Infinity; //Amount by which to increment date.
		let updateStack = true;
		if (status[id].oStack.length > 0) {
			delta = status[id].oStack.pop();
			updateStack = false; //Do not update this button's stack.
		} else {
			delta = Math.round(countSub/2); //Increment date by this amount.
		}
		dateInit = addDays(dateInit, delta, dateMin, dateMax[id]);
		console.log(`dateInit (after update): ${dateInit}`);
		status[id].dateInit = dateInit;
		let index = dataAll.findIndex((x) => {return x.DATE >= dateInit;});
		dataSub = dataAll.slice(index); //data subset.
		//Update stack; then, update countSub.
		if (updateStack) status[id].iStack.push(countSub - dataSub.length);
		countSub = dataSub.length;
		console.log(`zoomIn, id = ${id}  countSub (after update) = ${countSub}`);
		//Set scale domains.
		xScaleSetDomain(dataSub);
		yScaleSetDomain(dataSub);
		let sw = strokeWidth(countSub); //Adjust stroke width to number of data points.
		console.log('sw: ', sw);
		let update = g_el
			.selectAll('line')
			.data(dataSub, (d, i) => {
				return d.DATE; //Join data by DATE.
			});
		const td = get_td();
		update
			.transition(td)
			.attr('x1', (d) => {return xScale(d.DATE);})
			.attr('x2', (d) => {return xScale(d.DATE);})
			.attr('y1', innerHeight)
			.attr('y2', (d) => {return (isNaN(d.VALUE) ? innerHeight : yScale(d.VALUE));})
			.style('stroke-width', sw);

		update.exit()
			.transition(td)
			.attr('x1', 0)
			.attr('x2', 0)
			.remove();

		//Update axes.
		g_el.select('#xAxis').transition(td).call(xAxis)
			.selectAll('text')
			.style('text-anchor', 'end')
			.attr('transform', 'rotate(-45)')
			.attr('dx', '-0.8em')
			.attr('dy', '0.1em');
		//Update y-axis.
		g_el.select('#yAxis').transition(td).call(yAxis);

		//If the number of data points is <= lolim, gray the button.
		if (countSub <= lolim) gray(id, 'zoomIn');

		//Display stacks after zoom.
		displayStacks(id, 'after zoom');
	});

	//================ zoomOut ================
	d3.select(`#${id}`).select('#zoomOut').on('click', () => {
		console.log(`---------- zoomOut, id = ${id}  countSub (before update) = ${countSub}`);
		//If the number of data points equals the maximum available, do nothing.
		if (countSub == countAll) {
			return;
		}
		console.log(`countAll: ${countAll}`);
		//Un-gray the zoomIn button if necessary.
		ungray(id, 'zoomIn');
		//Display stacks before zoom.
		displayStacks(id, 'before zoom');
		//Update dateInit.
		let dateInit = status[id].dateInit;
		console.log(`dateInit (before update): ${dateInit.toISOString()}`);
		let delta = -Infinity; //Number of days to change date.
		let updateStack = true;
		if (status[id].iStack.length > 0) {
			delta = -status[id].iStack.pop();
			updateStack = false; //Do not update this button's stack.
		} else {
			delta = -countSub;
		}
		dateInit = addDays(dateInit, delta, dateMin, dateMax[id]); //Move dateInit back in time.
		console.log(`dateInit (after update): ${dateInit.toISOString()}`);
		status[id].dateInit = dateInit;
		let index = dataAll.findIndex((x) => {return x.DATE >= dateInit;});
		dataSub = dataAll.slice(index); //data subset.
		//Update stack.
		if (updateStack) status[id].oStack.push(dataSub.length - countSub);
		countSub = dataSub.length;
		console.log(`zoomOut, id = ${id}  countSub (after update) = ${countSub}`);
		//Set scale domains.
		xScaleSetDomain(dataSub);
		yScaleSetDomain(dataSub);
		let sw = strokeWidth(countSub); //Adjust stroke width to number of data points.
		console.log('sw: ', sw);
		let update = g_el
			.selectAll('line')
			.data(dataSub, (d, i) => {return d.DATE;});
		const td = get_td();
		update
			.enter() //Process new els.
			.append('line')
			.attr('class', 'line')
			//Unfortunately, if stroke width is not set here AND below, lines with different stroke widths are produced.
			.style('stroke-width', sw)
			.attr('y1', innerHeight)
			.attr('y2', (d) => {return (isNaN(d.VALUE) ? innerHeight : yScale(d.VALUE));})
			.merge(update) //Process new els and surviving els.
			.transition(td)
			.style('stroke-width', sw)
			.attr('x1', (d) => {return xScale(d.DATE);})
			.attr('x2', (d) => {return xScale(d.DATE);});

		//Update axes.
		g_el.select('#xAxis').transition(td).call(xAxis)
			.selectAll('text')
			.style('text-anchor', 'end')
			.attr('transform', 'rotate(-45)')
			.attr('dx', '-0.8em')
			.attr('dy', '0.1em');
		//Update y-axis.
		g_el.select('#yAxis').transition(td).call(yAxis);

		//If the number of data points equals the maximum available, gray zoomOut button.
		if (countSub == countAll) gray(id, 'zoomOut');

		//Display stacks after zoom.
		displayStacks(id, 'after zoom');
	});

}
