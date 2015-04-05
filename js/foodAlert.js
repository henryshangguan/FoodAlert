Users = new Mongo.Collection("users");
Requests = new Mongo.Collection("requests");
Menus = new Mongo.Collection("menus");
Records = new Mongo.Collection("records");

if (Meteor.isClient) {
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

  Template.body.helpers({
    users: function () {
      return Requests.find({}, {sort: {createdAt: -1}});
    }
  });
}

if (Meteor.isServer) {
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