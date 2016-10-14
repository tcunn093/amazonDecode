'use strict';
var Alexa = require('alexa-sdk');

var req = require('request');

var APP_ID = 'arn:aws:lambda:us-east-1:917624185542:function:GetEventsToday';
var SKILL_NAME = 'Ottawa Events';

function buildEventsUrl(keyword){
    return "https://www.eventbriteapi.com/v3/events/search/?q=" + keyword + "&sort_by=best&location.address=Ottawa&location.within=20km&start_date.keyword=today&token=36GRUC2DWUN74WBSDFG3";
}

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
    'GetEventsToday': function(){
        request(buildEventsUrl(''), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                listEvents(JSON.parse(response.responseText), 3); // Show the HTML for the Google homepage.
            }
        });
    },
    'GetEventsTonight': function (){
        this.emit(':tell', 'Getting DOWN tonight! YEAH...');
    },
	'GetEventsFuture': function(intent, session, response) {
		var d = new Date();
		// use either for converting
		var date = d.toISOString();
		date = intent.slots.Date;
		this.emit(':tell', 'date');
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

