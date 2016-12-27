'use strict';

//Store the default button background color.
//This is used to restore the background color when a grayed out button is re-enabled.
const buttonBC = d3.select('button').style('background-color');

//Gray indicated button.
function gray(id, button) {
	//button: 'zoomIn', 'zoomOut'.
	let zButton = d3.select(`#${id}`).select(`#${button}`);
	zButton.attr('grayOut', 'true');
	zButton.style('background-color', 'rgba(128, 128, 128, 1)');
}

//Un-gray indicated button.
function ungray(id, button) {
	//button: 'zoomIn', 'zoomOut'.
	let zButton = d3.select(`#${id}`).select(`#${button}`);
	//Avoid using the 'disabled' attribute. In Firefox it appears to be sticky, i.e., setting it to null does not cause it to disappear.
	if (zButton.attr('grayOut') == 'true') {
		zButton.style('background-color', buttonBC);
		zButton.attr('grayOut', 'false');
	}
}
