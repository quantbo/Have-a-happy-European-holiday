//Adjust stroke width to number of data points.
//There are at least two approaches: incremental or continuous. Empirically, the incremental version seems to produce results that are visually more pleasing. The continuous approach, to work well, should probably utilize a convex function. I have not taken the time to experiment with this approach.

//Incremental version.
function strokeWidth(count) {
	if (count <= 24) {
		return 24;
	}
	if (count <= 46) {
		return 12;
	}
	if (count <= 90) {
		return 6;
	}
	if (count <=354) {
		return 4
	}
	if (count <= 704) {
		return 2;
	}
	return 1;
}

//Continuous version.
//function strokeWidth(count) {
//	return Math.max(1, Math.ceil(16 - count / 32));
//}
