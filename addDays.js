//Add or subtract days from a date.
//For discussion of this highly tortured topic see:
//http://stackoverflow.com/questions/563406/add-days-to-javascript-date
//The code below is adapted from there.

function addDays(date, days, dateMin, dateMax) {
	//date: Initial date.
	//days: How many days to add or subtract (can be positive or negative).
	//dateMin, dateMax: Trim results outside these boundaries.
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	//The Math functions turn the date into an integer.
	//The new Date() turns the integer into a date.
	return new Date(Math.max(dateMin, Math.min(result, dateMax)));
}
