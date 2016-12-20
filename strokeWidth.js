//Adjust stroke width to number of data points.
function strokeWidth(data) {
	let sw = 2;
	if (data.length <= 32) {
		sw = 10;
	} else
	if (data.length <= 64) {
		sw = 6;
	} else
	if (data.length <= 128) {
		sw = 4;
	}
	return sw;
}
