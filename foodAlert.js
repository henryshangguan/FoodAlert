if (Meteor.isClient) {



  Template.form.events({
    "click .submit": function () {


    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
