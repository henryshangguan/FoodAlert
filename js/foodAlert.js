Users = new Mongo.Collection("users");
Requests = new Mongo.Collection("requests");
Menus = new Mongo.Collection("menus");
Records = new Mongo.Collection("records");

if (Meteor.isClient) {
	//var twilio = require('twilio');
  Meteor.subscribe("users");
  Meteor.subscribe("requests");
  Meteor.subscribe("menus");
  Meteor.subscribe("records");

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
    }
  });

    },

    "click .sendPin": function () {
    	var pin = Math.round(Math.random() * 1000);
    	Meteor.call("sendSMS", pin);
    	// now put pin in a state variable or something so that verify function can use it
    },

  Template.body.helpers({
    users: function () {
      return Requests.find({}, {sort: {createdAt: -1}});
    }
  });
}



if (Meteor.isServer) {
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

	});

}
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

Meteor.methods({
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
  }
});
