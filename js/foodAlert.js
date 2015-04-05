if (Meteor.isClient) {
	//var twilio = require('twilio');

  Template.form.events({
    "click .submit": function () {


    },

    "click .sendPin": function () {
    	var pin = Math.round(Math.random() * 1000);
    	Meteor.call("sendSMS", pin);
    	// now put pin in a state variable or something so that verify function can use it
    },

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