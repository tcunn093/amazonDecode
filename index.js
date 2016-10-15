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
var Alexa   = require('alexa-sdk');
var tonight = require('./tonightAndMorning');
var request = require('request');

var APP_ID = 'arn:aws:lambda:us-east-1:917624185542:function:GetEventsToday';
var SKILL_NAME = 'Ottawa Events';
var EXPLAIN = true;

var states = {
	NEWREQUEST: "_NEWREQUEST",
	MOREINFO: "_MOREINFO",
	NEWSMODE: "_NEWSMODE"
};

var newSessionHandlers = {
	// This will short-cut any incoming intent or launch requests and route them to this handler.

	//TODO:  Decide between News, or Events. Also decide which state of event stream to use below

     'NewSession': function() {
         if(Object.keys(this.attributes).length === 0) { // Check if it's the first time the skill has been invoked
             this.attributes['events'] = [];
         }
         this.handler.state = states.NEWREQUEST;
         this.emit(':ask', "Welcome to Decode Ottawa. Ask me what's happening.", "Ask me what's happening");
     }
};

var newRequestHandlers = Alexa.CreateStateHandler(states.NEWREQUEST,{

	 'LaunchRequest': function(){
        //this.emit('GetEventsToday');
    },
    'NewSession': function () {
        console.log('newsession in req hand');
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'GetEventsToday': function(){
        var url = "https://www.eventbriteapi.com/v3/events/search/?sort_by=best&location.address=Ottawa&location.within=20km&start_date.keyword=today&token=36GRUC2DWUN74WBSDFG3";
        var ref = this;
        request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.statusCode == 200) {
                var data = JSON.parse(body)
                var speech = listEvents(data, 3);
                var events = data.events;
                console.log(ref.attributes[events])

                for (var i = 0; i < Math.min(events.length, 3); i++) {
                  var name = events[i]['name'];
                  //var description = events[i]['description'];
                  var time = events[i]['start'];

                  var event = {
                    'name': "",//events[i]['name']['text'],
                    //'description': "",//events[i]['description'] ? events[i]['description']['text'] : "No description available.",
                    'time': ""//events[i]['start']['local'] ? events[i]['start']['local']: ""
                  }

                  if(name){
                    event.name = name['text'];
                  }
/*
                  if(description){
                    event.description = description['text'];
                  }
*/
                  if(time){
                    event.time = time['local'];
                  }
                  ref.attributes['events'].push(event);
                }

                ref.handler.state = states.MOREINFO;
                ref.emit(':tell', speech);
            } else{
                console.log(response.statusCode);
            }
          }
        });
    },
	'GetNews': function(){
        var url = "https://newsapi.org/v1/articles?source=google-news&sortBy=top&apiKey=da9d35b3f1664d9bbff21181de70f6ba";
        var ref = this;
        request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.statusCode == 200) {
                var speech = "";
                if (EXPLAIN) {
                  speech = speech + "Get news handler called. The response is..."
                }
                speech = speech + listEventsNews(JSON.parse(body), 3);
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

    	//var builtURL = url[keyword][date][location]();
    	var builtURL = urlBuilder(keyword, date, location);
    	var ref = this;
    	request(builtURL, function (error, response, body) {
    		if (!error && response.statusCode == 200) {
    			if (response.statusCode == 200) {
    				var speech = "";
            if (EXPLAIN) {
              speech = speech + "Get events handler called"
              if (keyword) {
                speech = speech + " with keyword " + keyword
              }
              if (date) {
                speech = speech + " with date " + dateToSpeechOutput(date)
              }
              if (location) {
                speech = speech + " with location " + location
              }
              speech = seech + ". This is the response..."
            }
            speech = speech + listEvents(JSON.parse(body), 3);
    				ref.emit(':tell', speech);
    			} else{
    				console.log(response.statusCode);
    			}
    		}
    	});
    },
    'GetEventsTonight': function() {
      var times = tonight.tonightDateLimitsIsoString();

      var tonightStartTime = times[0];
      var tonightEndTime   = times[1];

      var url = tonight.buildEventsUrlFromDateRangeIsoStrings(tonightStartTime,tonightEndTime);
      var ref = this;

    	request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          if (response.statusCode == 200) {
            var speech = "";
            if(EXPLAIN) {
              speech = speech + "Get events tonight handler called. This is your response ..."
            }
            speech = speech + listEvents(JSON.parse(body), 3);
            speech = speech.replace(/[^0-9a-zA-Z ,.]/g, '');
            ref.emit(':tell', speech); // Show the HTML for the Google homepage.
          } else{
            console.log(response.statusCode);
          }
        }
      });
    },
    'GetEventsFutureNight' : function(intent,session,callback) {
      var date  = new Date(slots(this).Date.value);
      var times = tonight.futureNightDateLimitsIsoString(date);

      var nightStartTime = times[0];
      var nightEndTime   = times[1];

      var url = tonight.buildEventsUrlFromDateRangeIsoStrings(nightStartTime,nightEndTime);
      var ref = this;

      request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          if (response.statusCode == 200) {
            var speech = "";
            if (EXPLAIN) {
              speech = speech + "Get events future night called with date " + dateToSpeechOutput(date) + ". The response is ..."
            }
            speech = speech + listEvents(JSON.parse(body), 3);
            speech = speech.replace(/[^0-9a-zA-Z ,.]/g, '');
            ref.emit(':tell', speech); // Show the HTML for the Google homepage.
          } else{
            console.log(response.statusCode);
          }
        }
      });
    },
    'Intro': function(){
        this.emit(:tell, "I am Echo");
    }
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
    }

});

var moreInfoHandlers = Alexa.CreateStateHandler(states.MOREINFO, {
	// TODO: get more info from session attributes, and send a response with that.

});

var newsModeHandlers = Alexa.CreateStateHandler(states.NEWSMODE, {
	// TODO: respond with news, from news branch.

});

function listEvents (data, count) {
    var events = data.events;
    var count = Math.min(count, events.length);
    var speechOutput = 'The top ' + count + ' events are: ';

    for (var i = 0; i < count; i++) {
      speechOutput = speechOutput + events[i]['name']['text'];

      if(i!==count-1){
        speechOutput += ", ";
      }

      if(i===count-2){
        speechOutput += "and ";
      }
    }

    speechOutput = speechOutput.replace(/[^0-9a-zA-Z ,.]/g, '');
    console.log(speechOutput);
    return speechOutput;
}

function urlBuilder (keyword, date, location) {
  // Format as 2015-11-15T00:00:00, Alexa returns as 2015-11-15
  if(!date){
    date = new Date();
  }

  if (location == null) {
    location = "Ottawa";
  }
  if(keyword == null){
    keyword = "";
  }
  var localDatetime = new Date(date).toISOString().slice(0, 19);
  return "https://www.eventbriteapi.com/v3/events/search/?q=" + keyword +  "&sort_by=best&location.address=" + location + "&location.within=20km&start_date.range_start=" + localDatetime + "&token=36GRUC2DWUN74WBSDFG3";
}

function slots(context) {
  return context.event.request.intent.slots;
}

function saveEvents (context, data, count) {
  var newContext = context;
  var events = data.events;
  //newContext.attributes['events'] = [];

  for (var i = 0; i < Math.min(events.length, count); i++) {
    newContext.attributes['events'].push({
      'name': events[i]['name']['text'],
      'description': events[i]['description']['text'],
      'time': events[i]['start']['local']
    });
  }

  newContext.handler.state = states.MOREINFO;
  return newContext;
}

function listEventsNews (data, count) {
    var speechOutput = 'The top ' + count + ' news headlines are: ';

	speechOutput = speechOutput + data.articles[0].title + ', ';
	speechOutput = speechOutput + data.articles[1].title + ', and ';
	speechOutput = speechOutput + data.articles[2].title;

    speechOutput = speechOutput.replace(/[^0-9a-zA-Z ,.]/g, '');
    console.log(speechOutput);
    return speechOutput;
}

function dateToSpeechOutput (date) {
  return new Date(date).toDateString()
}

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(newSessionHandlers, newRequestHandlers, moreInfoHandlers, newsModeHandlers);
    alexa.execute();
};
