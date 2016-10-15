'use strict';
var Alexa   = require('alexa-sdk');
var tonight = require('./tonightAndMorning');
var request = require('request');

var APP_ID = 'arn:aws:lambda:us-east-1:917624185542:function:GetEventsToday';
var SKILL_NAME = 'Ottawa Events';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

function listEvents (data, count) {
    var events = data.events;
    var count = Math.min(count, events.length);
    var speechOutput = 'The top ' + count + ' events are: ';

    for (var i = 0; i < count; i++) {
      speechOutput = speechOutput + events[i]['name']['text'];
    }

    console.log(speechOutput);
    return speechOutput;
}

var handlers = {
    'LaunchRequest': function(){
        this.emit('GetEventsToday');
    },
    'GetEventsToday': function(){

        var url = "https://www.eventbriteapi.com/v3/events/search/?sort_by=best&location.address=Ottawa&location.within=20km&start_date.keyword=today&token=36GRUC2DWUN74WBSDFG3";
        var ref = this;
        request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.statusCode == 200) {
                var speech = listEvents(JSON.parse(body), 3);
                speech = speech.replace(/[^0-9a-zA-Z ,.]/g, '');
                ref.emit(':tell', speech); // Show the HTML for the Google homepage.
            } else{
                console.log(response.statusCode);
            }
          }
        });
    },
    // 'ListEvents': function (data, count) {
    //     var events = data.events;
    //     var count = Math.min(count, events.length);
    //     var speechOutput = 'The top ' + count + ' events are: ';

    //     for (var i = 0; i < count; i++) {
    //       speechOutput = speechOutput + events[i]['name']['text'];
    //     }

    //     console.log(speechOutput);
    //     this.emit(':tell', speechOutput);
    // },
    'GetEventsTonight': function() {
      var times = tonight.tonightDateLimitsIsoString();
      
      var tonightStartTime = times[0];
      var tonightEndTime   = times[1];    
        
      var url = tonight.buildEventsUrlFromDateRangeIsoStrings(tonightStartTime,tonightEndTime);
      var ref = this;

    	request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          if (response.statusCode == 200) {
            var speech = listEvents(JSON.parse(body), 3);
            speech = speech.replace(/[^0-9a-zA-Z ,.]/g, '');
            ref.emit(':tell', speech); // Show the HTML for the Google homepage.
          } else{
            console.log(response.statusCode);
          }
        }
      });
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
