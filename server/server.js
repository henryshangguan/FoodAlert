Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({
    extended: false
}));

Router.route('/response/', function () {
	var text = this.request.body.Body;
	var phone = this.request.body.From;

	if (text.toUpperCase() === "YES") {
		sendSMS(phone, "Your reqeust has been saved.");
		transferRequest(phone);
		}

	else if (text.toUpperCase() === "NO") {
		sendSMS(phone, "Your reqeust has been deleted.");
		}
	},
{where: 'server'});


var sendSMS = function (number, text) {
	Meteor.http.post('https://api.twilio.com/2010-04-01/Accounts/AC22ef9acc63bf954b3e9fdff5762f0bfc/SMS/Messages.json',
	{
		params:{From:'+16098794415', To: number, Body: text},
		auth: 'AC22ef9acc63bf954b3e9fdff5762f0bfc:5eca12596eaa0ccb2e73d1aa6aa419c0',
		headers: {'content-type':'application/x-www-form-urlencoded'}
	}, function () {
		console.log(arguments)
	});
};


/********** UPDATING MENUS DAILY *******/
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
		var items = menu.split(':');
		items.forEach(function(item) {
			Menus.insert({
				'food': item,
				'location': location,
      			 // 'meal': meal,
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

var cronUpdateMenus = new Meteor.Cron({
	events: {
		"0 10 * * *" : getMenus,
	}
});
/*************************************/



/******* SENDING OUT REQUESTS *********/
var sendRequests = function(phone, results) {
	// concatenate string using results array, then send to phone


};

var validateRequests = function () {
	ConfirmedRequests.find().forEach(function(request) {
		var phone = request['number'];
		var results = [];

		request['request'].forEach(function(entry) {
			var food = entry['food'];
			var loc = entry['location'];

			if (loc == 'All') {
				if (Menus.findOne({'food': food})) {
					// success!
					results.push({
						'food': food,
						'location': loc,
					});
				}
			} else {
				var item = Menus.findOne({'food': food});
				if (item) {
					if (item[loc]) {
						// success!
						results.push({
							'food': food,
							'location': loc,
						});
					}
				}

			}
		});

		sendRequests(phone, results);
	});
};

var cronSendMessages = new Meteor.Cron({
	events: {
		"0 12 * * *" : validateRequests,
	}
});
/***************************/

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
			food: food,
			location: location
		});
	},

/******* ADDING INITIAL REQUEST *********/
	transferRequest: function (phone) {
		var requestsToMove = PendingRequests.findOne({number: phone});
		var number = requestsToMove.fetch().get("number");
		var food = requestsToMove.fetch().get("food");
		var location = requestsToMove.fetch().get("location");

		Meteor.call("addConfirmedRequest", "test", "test", "test");
	}

});