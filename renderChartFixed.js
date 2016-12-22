//Render the parts of a chart that do not change when the data change.
function renderChartFixed(id) {
	//id: div id.
	const item = fred[id];
	const svg = d3.select(`#${id}`).select('svg')
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
		.attr('id', 'g_el')
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
	return g_el; //For use by renderChart.
}
