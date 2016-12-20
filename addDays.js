//Add or subtract days from a date.
//For discussion of this highly tortured topic see:
//http://stackoverflow.com/questions/563406/add-days-to-javascript-date
//The code below is copied from there.

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
