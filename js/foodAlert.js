Users = new Mongo.Collection("users");
Requests = new Mongo.Collection("requests");
Menus = new Mongo.Collection("menus");
Records = new Mongo.Collection("records");

if (Meteor.isClient) {
	Meteor.subscribe("users");
	Meteor.subscribe("requests");
	Meteor.subscribe("menus");
	Meteor.subscribe("records");

	Template.body.events({


	});

	Template.addFoodForm.events({
		'submit form' : function () {
			event.preventDefault();

			var number = event.target.phoneNumber.value;
			var pin = event.target.pin.value;
			var food = event.target.menuItem.value;
			var location = event.target.dhall.value;
			var request = [food, location];

			event.target.menuItem.value = "";
			event.target.dhall.value = "Select Dining Hall";


			Meteor.call("addUser", number, pin);
			Meteor.call("addRequest", number, request);

			bootbox.alert("Your request has been saved");
		}
	});

	Template.newUser.events({
		'submit form' : function () {
			event.preventDefault();
			bootbox.prompt("Enter your phone number:", function(result) {                                                           
				if (result === null) {

				} else {
					Example.show("Verification sent.");
				}                      
			});
		},

	});

	Template.body.helpers({
		users: function () {
			return Requests.find({}, {sort: {createdAt: -1}});
		}
	});
}

if (Meteor.isServer) {

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
			})
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

	var cron = new Meteor.Cron({
		events: {
			"0 6 * * *" : getMenus,
		}
	});
	/*************************************/


	Meteor.methods({
		sendSMS: function (pin) {
			Meteor.http.post('https://api.twilio.com/2010-04-01/Accounts/AC22ef9acc63bf954b3e9fdff5762f0bfc/SMS/Messages.json',
				{
					params:{From:'+16098794415', To:'+16095539543', Body: 'Here is your pin: ' + pin},
					auth: 'AC22ef9acc63bf954b3e9fdff5762f0bfc:5eca12596eaa0ccb2e73d1aa6aa419c0',
					headers: {'content-type':'application/x-www-form-urlencoded'}
				}, function () {
					console.log(arguments)
				}
			);
		},

		addUser: function (number, pin) {
			Users.insert({
				number: number,
				pin: pin
			});
		},

		addRequest: function (number, request) {
			Requests.insert({
				number: number,
				request: request
			});
		},

	});
}