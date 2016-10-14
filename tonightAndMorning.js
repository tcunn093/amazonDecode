//latest hour and minute in the morning considered "tonight", earliest time considered "this morning"
var morningHour = 4;
var morningMinute = 0;

//latest hour and minute in the morning considered "this morning"
var morningEndHour   = 12;
var morningEndMinute = 0;

//earliest hour and minute in the evening considered "tonight"
var eveningHour = 17;
var eveningMinute = 0;

//may throw an exception if inputDate is not in the morning
var morningDateLimitsIsoString = function(inputDate) {
	return dateLimitsIsoString("morning",inputDate);
}

var nightDateLimitsIsoString = function(inputDate) {
	return dateLimitsIsoString("night",inputDate);
}

var dateLimitsIsoString = function(timeRangeType,inputDate) { //normalize the input date as the "current date"
	var currentDate = inputDate;
	var currentTime = currentDate.getTime();

	var tomorrowDate = new Date(currentDate.getTime());
	tomorrowDate.setDate(currentDate.getDate()+1); //day, month, year are accurate, other values are meaningless

	var morningDate = new Date(currentDate.getTime());
	morningDate.setHours(morningHour);
	morningDate.setMinutes(morningMinute);
	morningDate.setSeconds(0);
	morningDate.setMilliseconds(0);
	var morningTime = morningDate.getTime();

	var morningEndDate = new Date(currentDate.getTime());
	morningEndDate.setHours(morningEndHour);
	morningEndDate.setMinutes(morningEndMinute);
	morningEndDate.setSeconds(0);
	morningEndDate.setMilliseconds(0);
	var morningEndTime = morningEndDate.getTime();

	var tomorrowMorningDate = new Date(tomorrowDate.getTime());
	tomorrowMorningDate.setHours(morningHour);
	tomorrowMorningDate.setMinutes(morningMinute);
	tomorrowMorningDate.setSeconds(0);
	tomorrowMorningDate.setMilliseconds(0);

	var eveningDate = new Date(currentDate.getTime());
	eveningDate.setHours(eveningHour);
	eveningDate.setMinutes(eveningMinute);
	eveningDate.setSeconds(0);
	eveningDate.setMilliseconds(0);
	var eveningTime = eveningDate.getTime();

	var startDate;
	var endDate;
	
	switch(timeRangeType) {
		case "night":
			if(currentTime<morningTime) { //00:00:00 - morningTime
				startDate = currentDate;
				endDate   = morningDate;
			} else if(currentTime>=morningTime && currentTime<eveningTime) { //morningTime - eveningTime
				startDate = eveningDate;
				endDate   = tomorrowMorningDate;
			} else if(currentTime>=eveningTime) { //eveningTime - 23:59:59
				startDate = currentDate;
				endDate   = tomorrowMorningDate;
			} 
			break;
		case "morning":
			if(currentTime>=morningTime && currentTime<morningEndTime) {
				startDate = currentDate;
				endDate   = morningEndDate;
			} else {
				throw "Input date was not within morning limits"
			}
			break;
	}

	startIsoString = startDate.toISOString();
	endIsoString   = endDate.toISOString();

	return [startIsoString,endIsoString];
}

var tonightDateLimitsIsoString = function() {
	return nightDateLimitsIsoString(new Date());
}

var futureNightDateLimitsIsoString = function(futureDate) {
	futureDate.setDate(futureDate.getDate());
	futureDate.setHours(eveningHour);
	futureDate.setMinutes(eveningMinute);
	futureDate.setSeconds(1);
	
	return nightDateLimitsIsoString(futureDate);
}

var thisMorningDateLimitsIsoString = function() {
	return morningDateLimitsIsoString(new Date());
}

var futureMorningDateLimitsIsoString = function(futureDate) {
	futureDate.setDate(futureDate.getDate());
	futureDate.setHours(morningHour);
	futureDate.setMinutes(morningMinute);
	futureDate.setSeconds(1);
	
	return nightDateLimitsIsoString(futureDate);
}

var testNightDateLimitsIsoString = function() {
	var currentDate = new Date();
	
	currentDate.setHours(0);
	currentDate.setMinutes(1);
	alert("00:01 - " + nightDateLimitsIsoString(currentDate));
	
	currentDate.setHours(3);
	currentDate.setMinutes(59);
	alert("03:59 - " + nightDateLimitsIsoString(currentDate));
	
	currentDate.setHours(4);
	currentDate.setMinutes(1);
	alert("04:01 - " + nightDateLimitsIsoString(currentDate));
	
	currentDate.setHours(5);
	currentDate.setMinutes(1);
	alert("16:59 - " + nightDateLimitsIsoString(currentDate));

	currentDate.setHours(23);
	currentDate.setMinutes(59);
	alert("23:59 - " + nightDateLimitsIsoString(currentDate));
}

var testMorningDateLimitsIsoString = function() {
	var currentDate = new Date();
	
	currentDate.setHours(5);
	currentDate.setMinutes(30);
	alert("05:30 - " + morningDateLimitsIsoString(currentDate));
}
