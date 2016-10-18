# amazonDecode

What_We_Did:

- We used the Alexa Skills API to develop a new skill that we called deCODE
- We serve information to the user from EventBrite, and NewsAPI.org
- AVS converts speech input into text. It also has built in parsing of Dates, Locations, and Times that we used.
- For example, saying 'Five' will be transformed into the number 5 in the data that our skill is passed.
- We use sessions to keep track of the conversation, for asking complex, or multi step questions.
- We used Node.js as a runtime in the cloud

What_We_Can_Do:

- We can search for events from EventBrite using Location, Date, and Keyword, and any permutation of those provided.
- We can search for news headlines from NewsAPI.org
- We say "Ask deCODE" as a trigger because it has multiple functions

Possible_Questions_For_Alexa:

- What's happening tonight?
	- Echo, Ask Decode, Whats happening tonight?
- Whats happening about music?
	- Echo, Ask Decode, Whats happening about music?
- What's happening in Toronto on October 21st?
	- Echo, Ask Decode, Whats happening in Toroonto on October 21st?
- What's happening today?
	- Echo, Ask Decode, Whats happening today?
- What's happening wednesday night?
	- Echo, Ask Decode, Whats happening wednesday night?
- What's in the news?
	- Echo, Ask Decode, What's in the news?

Reflections:

- We did this without a domain expert for most of the time.
- We worked together as a team well to accomplish a task.
- We debugged together well.
- None of us really had any good Node.js experience, and we managed to make it work.
