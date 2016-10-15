'use strict';
var Alexa = require('alexa-sdk');

var request = require('request');

var APP_ID = 'arn:aws:lambda:us-east-1:917624185542:function:GetEventsToday';
var SKILL_NAME = 'Ottawa Events';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function(intent, session, callback){
		// routing based on intents
		// change the LaunchRequest header to be (intent, session, callback) => {}
		var d = intent.slots.Data;
		if (d == null) {
			d = new Date().toISOString();
		}

		var loc = intent.slots.Location;
		if (loc == null) {
			loc = "Ottawa";
		}

		var q = intent.slots.Keyword;
		// send http reques with d, loc, and q

        this.emit('GetEventsToday');
    },
    'GetEventsToday': function(){

        var url = "https://www.eventbriteapi.com/v3/events/search/?sort_by=best&location.address=Ottawa&location.within=20km&start_date.keyword=today&token=36GRUC2DWUN74WBSDFG3";
        var ref = this;
        request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
                ref.emit('ListEvents', JSON.parse(body), 3); // Show the HTML for the Google homepage.
            }
        });
    },
    'ListEvents': function (data, count) {
        console.log(data);
        var events = data.events;
        var count = Math.min(count, events.length);
        var speechOutput = 'The top ' + count + ' events are: ';

        for (var i = 0; i < count; i++) {
          speechOutput = speechOutput + events[i]['name']['text'];
        }

        this.emit(':tell', speechOutput);
    },
    'GetEventsTonight': function() {
        this.emit(':tell', "Party time!");
  //   	var tonightStartTime;
  //   	var tonightEndTime;
    
  //       [tonightStartTime,tonightEndTime] = tonightDateLimitsIsoString();
        
  //       var url = buildEventsUrlFromDateRangeIsoStrings(tonightStartTime,tonightEndTime);
        
		// request(url, function (error, response, body)) {
		// 	if (!error && response.statusCode == 200) {
  //               emit('ListEvents', JSON.parse(body), 3); // Show the HTML for the Google homepage.
  //         	}
		// });
    },
	'GetEventsFuture': function(intent, session, callback) {
		var date = intent.slots.Date;
		this.emit(':tell', date);
	},
	'GetEventsByKeyword': function(intent, session, response) {

		this.emit(':tell', 'test');
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
