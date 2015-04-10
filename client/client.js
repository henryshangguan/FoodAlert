

Schemas = {};
Template.registerHelper("Schemas", Schemas);

Schemas.PendingRequest = new SimpleSchema({
	number : {
		type: String,
		label: "Phone Number",
		min: 10,
		max: 10
	},
	request: {
		type: Object
	},
	'request.food': {
		type: String,
		label: "Food",
		max: 40 
	},
	'request.location': {
		type: String,
		label: "Dining Hall",
		allowedValues:['Center for Jewish Life', 'Forbes', 'Rocky/Mathey', 'Whitman', 'Wu/Wilcox'],
		autoform: {
			options: [
			{label: "Center for Jewish Life", value: "Center for Jewish Life"},
			{label: "Forbes", value: "Forbes"},
			{label: "Rocky/Mathey", value: "Rocky/Mathey"},
			{label: "Whitman", value: "Whitman"},
			{label: "Wu/Wilcox", value: "Wu/Wilcox"}
			]
		}
	} 
});

Schemas.ConfirmedRequest = new SimpleSchema({
	number: {
		type: String,
		label: "Phone Number",
		min: 10,
		max: 10
	},
	requests: {
		type: Array,
		optional: true
	},
	'requests.$': {
		type: Object
	},
	'requests.$.food': {
		type: String,
		label: "Food",
		max: 40 
	},
	'requests.$.location': {
		type: String,
		label: "Dining Hall",
		allowedValues:['Center for Jewish Life', 'Forbes', 'Rocky/Mathey', 'Whitman', 'Wu/Wilcox'],
		autoform: {
			options: [
			{label: "Center for Jewish Life", value: "Center for Jewish Life"},
			{label: "Forbes", value: "Forbes"},
			{label: "Rocky/Mathey", value: "Rocky/Mathey"},
			{label: "Whitman", value: "Whitman"},
			{label: "Wu/Wilcox", value: "Wu/Wilcox"}
			]
		}
	}
});

var Collections = {};
Template.registerHelper("Collections", Collections);

PendingRequests = Collections.PendingRequests = new Mongo.Collection("PendingRequests");
ConfirmedRequests = Collections.ConfirmedRequests = new Mongo.Collection("ConfirmedRequests");
Menus = new Mongo.Collection("Menus");
Records = new Mongo.Collection("Records");

Meteor.subscribe("ConfirmedRequests");
Meteor.subscribe("PendingRequests");
Meteor.subscribe("Menus");
Meteor.subscribe("Records");


PendingRequests.attachSchema(Schemas.PendingRequest);
ConfirmedRequests.attachSchema(Schemas.ConfirmedRequest);

// Meteor.publish("Collections.PendingRequests", function () {
// 	return PendingRequests.find();
// });

// Requests.allow({
// 	update: function () {
// 		return true;
// 	}
// });


// Meteor.publish("Collections.ConfirmedRequests", function () {
// 	return Requests.find();
// });

// ConfirmedRequests.allow({
// 	update: function () {
// 		return true;
// 	}
// });

// Template.body.events({

// 	"click .sendPin": function () {
// 		var pin = Math.round(Math.random() * 1000);
// 		Meteor.call("sendSMS", pin);
//    	}
// )};

Template.body.events({
	"click .test": function () {
		console.log("yup");
		Meteor.call("testMenus");
	}
});

Template.body.helpers({
	users: function () {
		return Requests.find({}, {sort: {createdAt: -1}});
	},
	exampleDoc: function () {
		return Requests.findOne();
	}
});

Template.form.events({
	'submit ' : function () {
		console.log("hello");
		var number = AutoForm.getFieldValue("number", "form");
		var food = AutoForm.getFieldValue("request.food", "form");
		var location = AutoForm.getFieldValue("request.location", "form");
		console.log(number);
		console.log(food);
		console.log(location);
		Meteor.call("sendSMS", number, food, location);
	}
});