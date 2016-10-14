'use strict';
var Alexa = require('alexa-sdk');

var APP_ID = 'arn:aws:lambda:us-east-1:917624185542:function:GetEventsToday';
var SKILL_NAME = 'Ottawa Events';

var response = new XMLHttpRequest();

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetEventsToday');
    },
    'GetEventsToday': initializeRequest,
    'GetEventsTonight': function (){
        this.emit(':tell', 'Getting DOWN tonight! YEAH...');
    },
	'GetEventsFuture': function(intent, session, response) {
		var d = new Date();
		// use either for converting
		var date = d.toISOString();
		date = intent.slots.Date;
		this.emit(':tell', date);
	},
	'GetEventsByKeyword': function(intent, session, response) {
		$.get("https://www.eventbriteapi.com/v3/events/search/?q=" + intent.slots.Keyword + "&sort_by=best&location.address=Ottawa&location.within=20km&start_date.keyword=today&token=36GRUC2DWUN74WBSDFG3").then(function(res){
            listEvents(res, 3);
        });	
		this.emit(':tell', intent.slots.Keyword);
	},
    'AMAZON.HelpIntent': function () {
		var speechOutput = "You can say what's happening today, or tonight, or you can say exit.";
        var reprompt = "What can I help you with?";
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', 'Goodbye!');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', 'Goodbye!');
    }

};

var listEvents = function (data, count) {
    var events = data.events;
    var count = Math.min(count, events.length);
    var speechOutput = 'The top ' + count + ' events are: ';
    for (var i = 0; i < count; i++) {
      speechOutput = speechOutput + events[i]['name']['text'];
    }
    this.emit(':tell', speechOutput);
}

function initializeRequest() {  
		//alert('before get');
		if (response.readyState == 4 || response.readyState == 0) {
				response.open("GET", 'https://www.eventbriteapi.com/v3/events/search/?sort_by=best&location.address=Ottawa&location.within=20km&start_date.keyword=today&token=36GRUC2DWUN74WBSDFG3', true);
				response.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
				response.onreadystatechange = handleOutput;
				var param = "";
				response.send(param);
				//alert(response);
		}                       
}


function handleOutput() {		
		if (response.readyState == 4) {
			listEvents(JSON.parse(response.responseText), 3);
				/*var xmldoc = response.responseText;			
				
				var jsonData = JSON.parse(xmldoc);
				console.log(jsonData.events.length);

				for (var i = 0; i < jsonData.events.length; i++) {
					var counter = jsonData.events[i];
					console.log(counter.name.text);
				}*/
				
		}
}
