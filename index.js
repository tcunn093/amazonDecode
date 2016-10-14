'use strict';
var Alexa = require('alexa-sdk');

var APP_ID = 'arn:aws:lambda:us-east-1:917624185542:function:GetEventsToday';
var SKILL_NAME = 'Ottawa Events';

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
    'GetEventsToday': function (){
        $.get("https://www.eventbriteapi.com/v3/events/search/?sort_by=best&location.address=Ottawa&location.within=20km&start_date.keyword=today&token=36GRUC2DWUN74WBSDFG3").then(function(res){
            listEvents(res, 3);
        });

        this.emit(':tell', 'today');
    },
    'GetEventsTonight': function (){
        this.emit(':tell', 'tonight');
    },
	'GetEventsFuture': function() {
		this.emit(':tell', 'future');
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
