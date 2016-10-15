/* TODO add utterances for GetEvents
 NOTE: You have to be very careful with order and presence of the slots
   eg. "GetEvents test two {Keyword} {Date} {Location}"

   > test two dance friday Ottawa
   keyword: dance - even though it's not on the enum list still returns because Alexa recongizes the word
   date: 2016-10-xx
   location: Ottawa - since we extended AMAZON.US_CITY using a custom slot type

   > test two friday Ottawa
   keyword: friday - since the order matters for the params
   date: NULL - because Ottawa does not parse into a date
   location: NULL - no third param

   eg. test
   > test
   keyword: NULL
   date: NULL
   location: NULL
   - this is allowed and will still call GetEvents, so we can use any combo of defined slots for an intent
*/

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

function listEvents (data, count) {
    var events = data.events;
    var count = Math.min(count, events.length);
    var speechOutput = 'The top ' + count + ' events are: ';

    for (var i = 0; i < count; i++) {
      speechOutput = speechOutput + events[i]['name']['text'];
    }

    speechOutput = speechOutput.replace(/[^0-9a-zA-Z ,.]/g, '');
    console.log(speechOutput);
    return speechOutput;
}

/**
 * @deprecated
 *
 */
function urlBuilder (keyword, date, location) {
  //TODO implement this!
  return 'URL';
}

function slots(context) {
  return context.event.request.intent.slots;
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
                ref.emit(':tell', speech);
            } else{
                console.log(response.statusCode);
            }
          }
        });
    },
    'GetEvents': function(){
      var keyword = slots(this).Keyword.value;
      var date = slots(this).Date.value;
      var location = slots(this).Location.value;
	
	if (location  == null) {
		location = "Ottawa";
	}
	if (date == null) {
		date = "today";
	}

	var url = "https://www.eventbriteapi.com/v3/events/search/?q=" + keyword +  "&sort_by=best&location.address=" + location + "&location.within=20km&start_date.keyword=" + date + "&token=36GRUC2DWUN74WBSDFG3";

      var speech = 'Keyword is ' + keyword + ' and date is ' + date + ' and location is ' + location;
      this.emit(':tell', speech);
    },
    'GetEventsTonight': function() {
        this.emit(':tell', "Party time!");
        // TODO require Dallas's code and fix this function
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
	'GetEventsFuture': function() {
    //TODO
		var date = this.event.request.intent.slots.Date.value;
		this.emit(':tell', date);
	},
	'GetEventsByKeyword': function(intent, session, response) {
    //TODO
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
    },
    'Unhandled': function() {
        // Alexa calls this when an utterance maps to an undefined handler
        this.emit(':tell', "Sorry, I didn't understand what you're asking.");
    },

};
