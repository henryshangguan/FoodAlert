Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({
    extended: false
}));

Router.route('/response/', function () {
	var text = this.request.body.Body;
	var phone = this.request.body.From;
	var requestToMove = PendingRequests.findOne({number: phone});
			if (requestToMove) {
				var food = requestToMove['food'];
				var location = requestToMove['location'];
			}
	if (text.toUpperCase() === "YES") {
			Meteor.call("sendSMS", phone, "--MealScout Request Confirmation--" + "\nFood: " + food + "\nLocation: " + location + "\nRequest Saved");
			transferRequest(phone);
	} else if (text.toUpperCase() === "NO") {
			Meteor.call('sendSMS', phone, "--MealScout Deletion Confirmation--" + "\nFood: " + food + "\nLocation: " + location + "\nRequest Deleted");
			var id = requestToMove['_id'];
			clearRequest(id);
	} else if (text.toUpperCase() === "DELETE") {
		requestToMove = PendingDeletion.findOne({number: phone});
			if (requestToMove) {
				var food = requestToMove['food'];
				var location = requestToMove['location'];
				Meteor.call("removeConfirmedRequest", phone, food, location);	
			}
		Meteor.call('sendSMS', phone, "--MealScout Deletion Confirmation--\nFood: " + food + "\nLocation: " + location + "\nRequest Deleted");
		
	} else if (text.toUpperCase() === "SAVE") {
		requestToMove = PendingDeletion.findOne({number: phone});
			if (requestToMove) {
				var food = requestToMove['food'];
				var location = requestToMove['location'];
				PendingDeletion.remove({number: phone, food: food, location: location});
			}
		Meteor.call('sendSMS', phone, "--MealScout Request Confirmation--\nFood: " + food + "\nLocation: " + location + "\nRequest Saved");
	}
	},
{where: 'server'});

/***********PUBLISH COLLECTIONS*********/
Meteor.publish('Records', function(){
    return Records.find();
});

Meteor.publish('ConfirmedRequests', function(){
    return ConfirmedRequests.find();
});

/********** Updating Menus Daily *******/
var getMenus = function () {
	console.log("Getting Menus")
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
				record['All'] = true;
				Records.update({'food': item}, {$set: record});
			} else {
				var record = {};
				record['food'] = item;
				record[loc] = true;
				record['All'] = true;
				Records.insert(record);
			}
		});
	});
};
/*************************************/

/******* Sending Out Requests *********/
var sendRequests = function(phone, results) {
	var message = '--MealScout Reminder--';
	for (var time in results) {
		message = message.concat('\n', time, ':\n');
		results[time].forEach(function(result) {
			message = message.concat('Food: ', result['food'],
						'\nLocation: ', result['location'], '\n');
		});
	}
	Meteor.call('sendSMS', phone, message);
	// if (phone == '+16095539543') {
	// 	Meteor.call('sendSMS', phone, 'testing scheduling');
	// }
};

var validateRequests = function () {
	console.log("Validating Requests");
	ConfirmedRequests.find().fetch().forEach(function(request) {
		var phone = request['number'];
		var results = {};
		
		request['requests'].forEach(function(entry) {
			var food = entry['food'];
			var loc = entry['location'];

			var items = Menus.find({'food': food});
			items.forEach(function(item) {

				if (loc == 'All' || item['location'] == loc) {
					// success! either all, or location matches
					var time = item['time'];
					var meal = {
						'food': food,
						'location': item['location'],
					};

					if (time in results) {
						results[time].push(meal)
					} else {
						results[time] = [meal];
					}
				}
			});
		});
		if (Object.keys(results) != 0) {
			sendRequests(phone, results);
		}
	});
};
/***************************/


/************** Clear PendingRequests *************/
var clearPending = function () {
	PendingRequests.remove({});
	PendingDeletion.remove({});
}
/**********************************/


/************** Add a ConfirmedRequest *************/
// not tested
var	addConfirmedRequest = function (number, food, location) {
	var confirms = ConfirmedRequests.findOne({'number': number}); 
	if (!confirms) {
		// add a new number
		ConfirmedRequests.insert({
			number: number,
			requests: [{'food': food, 'location': location}]
		});
	} else {
		// update existing number's requests
		ConfirmedRequests.update({'number': number}, 
			{$addToSet: {'requests': {
				'food': food,
				'location': location,
		}}});
	}
}
/**********************************/

/******* ADDING INITIAL REQUEST *********/
var transferRequest = function (phone) {
	var requestToMove = PendingRequests.findOne({number: phone});
	if (requestToMove) {
		var number = requestToMove['number'];
		var food = requestToMove['food'];
		var location = requestToMove['location'];
		var id = requestToMove['_id'];

		addConfirmedRequest(number, food, location);
		clearRequest(id);
	}
}
/**********************************/

/******* REMOVE SPECIFIC TRANSFERRED REQUEST *********/
var clearRequest = function (id) {
	PendingRequests.remove(id);
}
/**********************************/


/************** Scheduled Cron Jobs *************/
// Ping app every minute
setInterval(function() {
	console.log("pinging mealscout!");
	Meteor.http.get("http://www.mealscout.herokuapp.com");
}, 20000);

// UTC Time: 4 hours ahead of EST
var cron = new Meteor.Cron({
	events: {
		"0 12 * * *" : validateRequests,
		"0 10 * * *" : getMenus,
		"0 8 * * *" : clearPending,
		 // "32 12 * * *" : validateRequests,
		 // "31 12 * * *" : getMenus,
		//"15 5 * * *" : validateRequests,
	}
});
/**********************************/


Meteor.methods({
/******* SENDING OUT TEXTS *********/
	sendSMS: function (number, message) {
		Meteor.http.post('https://api.twilio.com/2010-04-01/Accounts/ACfb52ce55aa5c747ccc7a524c4dd1af16/Messages.json',
		{
			params:{From:'+16092514626', To: number, Body: message},
			auth: 'ACfb52ce55aa5c747ccc7a524c4dd1af16:a63a2fb29aa7980553da6522b84aacd3',
			headers: {'content-type':'application/x-www-form-urlencoded'}
		}, function () {
			console.log(arguments)
		});
	},

	newUser: function (number) {
		Meteor.call("sendSMS", number, "--MealScout Intro--\nWelcome to MealScout! If you confirm your request, MealScout will text you on the day your food is being served in the dining hall you specified. If you wish to block messages from this number, just text 'cancel'. Have a great day!");
	},

/******* ADDING INITIAL REQUEST *********/
	addPendingRequest: function (number, food, location) {
		PendingRequests.insert({
			number: number,
			food: food,
			location: location
		});
		Meteor.call("sendSMS", number, 
			"--MealScout Request--\n" + "Food: " + food + "\nLocation: " + location + "\nReply 'yes' to confirm or 'no' to delete.")
	},

	removeConfirmedRequest: function (number, food, location) {
		var arr = ConfirmedRequests.findOne({number: number})['requests'];
		var index = -1;
		for (i = 0; i < arr.length; i++) {
			if (arr[i].food == food) {
				index = i;
			}
		}

		arr.splice(index, 1);
		var record = {number: number, requests: arr};

		ConfirmedRequests.update({number: number}, {$set: record});
		// ConfirmedRequests.update({'number': number}, 
		// 	{$pull: {requests: {
		// 		food: food,
		// 		location: location
		// }}});
	},

	reverseTransferRequest: function (number, food) {
		var arr = ConfirmedRequests.findOne({number: number})['requests'];
		var location = '';
		for (i = 0; i < arr.length; i++) {
			if (arr[i].food == food) {
				location = arr[i].location;
			}
		}
		PendingDeletion.insert({number: number, food: food, location: location});
		Meteor.call("sendSMS", number, "--MealScout Deletion Request--\n" + "Food: " + food + "\nLocation: " + location + "\nReply 'delete' to confirm deletion or 'save' to cancel deletion.");
		//bootbox.alert({size: 'medium', message: "A message has been sent to your phone. Please respond 'delete' to confirm deletion.", callback: function () {}});

	// var requestToMove = PendingRequests.findOne({number: phone});
	// if (requestToMove) {
	// 	var number = requestToMove['number'];
	// 	var food = requestToMove['food'];
	// 	var location = requestToMove['location'];
	// 	var id = requestToMove['_id'];

	// 	addConfirmedRequest(number, food, location);
	// 	clearRequest(id);
	//}
},

//////////Needs updating
	addRecord: function (food) {
		Records.insert({
			food: food
		});
	},

	
//************* TEMPORARY ******************//
	testValidate: function() {
		validateRequests();
	},
	getMenus: function() {
		getMenus();
	},
	clearMenus: function() {
		Menus.remove({});
	},
	clearPendingRequests: function() {
		PendingRequests.remove({});
	},
	clearConfirmedRequests: function() {
		ConfirmedRequests.remove({});
	},
	removePending: function() {
		PendingDeletion.remove({});
	}

//************* TEMPORARY ******************//
});