Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({
    extended: false
}));

	Router.route('/response/', function () {
		var text = this.request.body.Body;
		var phone = this.request.body.From;

		if (text.toUpperCase() === "YES") {
			Meteor.call("sendSMS", phone, "Your request has been saved.");
			var test = "test1";
			Meteor.call("addConfirmedRequest", test, test, test);
			transferRequest(phone);
			}

		else if (text.toUpperCase() === "NO") {
			sendSMS(phone, "Your request has been deleted.");
			}
		},
	{where: 'server'});

/********** Updating Menus Daily *******/
var getMenus = function () {
	Meteor.http.get('https://api.parse.com/1/classes/Menu', {
		headers: {'content-type': 'application/json',
		'X-Parse-Application-Id': 'PtiTO2iCbTqWljw2NBSFfsypu4ZxR8gJexnHPoea',
		'X-Parse-REST-API-Key': '4k9UZsWoBklkdRK8JXntG1XP3TjFvU4CwTbIDIhS',
		}
	}, function(error, result){
		var json = JSON.parse(result.content)["results"];
		updateMenus(json);
		updateHistory(json);
	});
};

var updateMenus = function (json) {
	Menus.remove({});
	json.forEach(function(hall) {
		var location = hall['location'];
		var menu = hall['menu'];
		var time = hall['time']
		var items = menu.split(':');
		items.forEach(function(item) {
			Menus.insert({
					'food': item,
					'location': location,
	      			'time': time,
      			});
		});
	});
};

var updateHistory = function (json) {
	json.forEach(function(hall) {
		var loc = hall['location'];
		var menu = hall['menu'];
		var items = menu.split(':');
		items.forEach(function(item) {
			if (Records.findOne({'food': item})) {
				var record = {};
				record[loc] = true;
				Records.update({'food': item}, {$set: record});
			} else {
				var record = {};
				record['food'] = item;
				record[loc] = true;
				Records.insert(record);
			}
		});
	});
};
/*************************************/



/******* Sending Out Requests *********/
var sendRequests = function(phone, results) {
	var message = '';
	results.forEach(function(result) {
		message.concat('Food: ', result['food'],
						', Location: ', result['location'],
						', Time: ', result['time'], '\n');
	});

	Meteor.call('sendSMS', phone, message);
};

var validateRequests = function () {
	ConfirmedRequests.find().forEach(function(request) {
		var phone = request['number'];
		var results = [];

		request['request'].forEach(function(entry) {
			var food = entry['food'];
			var loc = entry['location'];

			var items = Menus.find({'food': food}); 
			items.forEach(function(item) {
				if (loc == 'All' || item['location'] == loc) {
					// success! either all, or location matches
					results.push({
						'food': food,
						'location': loc,
						'time': item['time'],
					});
				}

			});
		});

		sendRequests(phone, results);
	});
};
/***************************/



/************** Scheduled Cron Jobs *************/
var cron = new Meteor.Cron({
	events: {
		"0 12 * * *" : validateRequests,
		"0 10 * * *" : getMenus,
		// add event to clear pendingrequests
	}
});
/**********************************/



Meteor.methods({
/******* SENDING OUT TEXTS *********/
	sendSMS: function (number, message) {
		Meteor.http.post('https://api.twilio.com/2010-04-01/Accounts/AC22ef9acc63bf954b3e9fdff5762f0bfc/SMS/Messages.json',
		{
			params:{From:'+16098794415', To: number, Body: message},
			auth: 'AC22ef9acc63bf954b3e9fdff5762f0bfc:5eca12596eaa0ccb2e73d1aa6aa419c0',
			headers: {'content-type':'application/x-www-form-urlencoded'}
		}, function () {
			console.log(arguments)
		});
	},

/******* ADDING INITIAL REQUEST *********/
	addPendingRequest: function (number, food, location) {
		PendingRequests.insert({
			number: number,
			food: food,
			location: location
		});
	},

	addConfirmedRequest: function (number, food, location) {
		ConfirmedRequests.insert({
			number: number,
			request: {food: food, location: location}
		});
	},

/******* ADDING INITIAL REQUEST *********/
	transferRequest: function (phone) {
		addConfirmedRequest("test", "test", "test");
		var requestsToMove = PendingRequests.findOne({number: phone});
		var number = requestsToMove.fetch().get("number");
		var food = requestsToMove.fetch().get("food");
		var location = requestsToMove.fetch().get("location");

		Meteor.call("addConfirmedRequest", "test", "test", "test");
	},

});