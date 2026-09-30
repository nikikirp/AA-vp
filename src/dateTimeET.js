//function dateFormattedET(){
const dateFormattedET = function(kuuNimi){
	let timeNow = new Date();
	const monthNamesET = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
	const folkMonthNamesET = ['näärikuu', 'küünlakuu', 'paastukuu', 'jürikuu', 'lehekuu', 'jaanipäevakuu', 'heinakuu', 'lõikuskuu', 'mihklikuu', 'viinakuu', 'mardikuu', 'jõulukuu'];
	if (kuuNimi == 0) {
        return timeNow.getDate() + '. ' + monthNamesET[timeNow.getMonth()] + ' ' + timeNow.getFullYear();
	 } else {
        return timeNow.getDate() + '. ' + folkMonthNamesET[timeNow.getMonth()] + ' ' + timeNow.getFullYear();
    }
};

function addLeadZero(numValue){
	if(numValue < 10){
		numValue = '0' + numValue;
	}
	return numValue;
}

const timeFormattedET = function(){
	let timeNow = new Date();
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	return addLeadZero(hourNow) + ':' + addLeadZero(minuteNow) + ':' + addLeadZero(secondNow);
};

const dayFormattedET = function() {
    let timeNow = new Date();
	const daysET = ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev'];
	return daysET[timeNow.getDay()];
};


module.exports = {dateET: dateFormattedET, timeET: timeFormattedET, dayET: dayFormattedET};