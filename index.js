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
        this.emit(':tell', 'today');
    },
    'GetEventsTonight': function (){
        this.emit(':tell', 'tonight');
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
    'ListEvents': function (events, count) {
        events = JSON.parse(events)['events'];
        var speechOutput = 'The top ' + count + ' events are: ';

        for (var i = 0; i < count; i++) {
          speechOutput = speechOutput + events[i]['name'];
        }

        this.emit(':tell', speechOutput);
    },
};
