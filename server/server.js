Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({
    extended: false
}));

Router.route('/response/', function () {
	var text = this.request.body.Body;
	var phone = this.request.body.From;

	if (text.toUpperCase() === "YES") {
			Meteor.call("sendSMS", phone, "Your request has been saved.");
			transferRequest(phone);
	} else if (text.toUpperCase() === "NO") {
			Meteor.call('sendSMS', phone, "Your request has been deleted.");
			var requestToMove = PendingRequests.findOne({number: phone});
			var id = requestToMove['_id'];
			console.log("deleting")
			clearRequest(id);
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
	var message = 'Here are your foods: \n';
	for (var time in results) {
		message = message.concat('\n', time, ':\n');
		results[time].forEach(function(result) {
			message = message.concat('Food: ', result['food'],
						'\nLocation: ', result['location'], '\n');
		});
	}
	Meteor.call('sendSMS', phone, message);
};

var validateRequests = function () {
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

/******* REMOVE TRANSFERRED REQUEST *********/
var clearRequest = function (id) {
	PendingRequests.remove(id);
}
/**********************************/


/************** Scheduled Cron Jobs *************/
// UTC Time: 4 hours ahead of EST
var cron = new Meteor.Cron({
	events: {
		"0 12 * * *" : validateRequests,
		"0 10 * * *" : getMenus,
		"0 8 * * *" : clearPending,
	}
});
/**********************************/


Meteor.methods({
/******* SENDING OUT TEXTS *********/
	sendSMS: function (number, message) {
		Meteor.http.post('https://api.twilio.com/2010-04-01/Accounts/AC22ef9acc63bf954b3e9fdff5762f0bfc/Messages.json',
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
		Meteor.call("sendSMS", number, 
			"text yes to confirm:\nFood: " + food + "\nLocation: " + location);
	},

	reverseTransferRequest: function (id) {
		console.log("method called");
		var number = ConfirmedRequests.findOne(id)['number'];
		var food = ConfirmedRequests.findOne(id)['food'];
		var location = ConfirmedRequests.findOne(id)['location'];

		console.log(number);
		console.log(food);
		console.log(location);
		// Move to Pending Deletion
		

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
	clearPendingRequests: function() {
		PendingRequests.remove({});
	},
	clearConfirmedRequests: function() {
		ConfirmedRequests.remove({});
	},

//************* TEMPORARY ******************//
});