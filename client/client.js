Meteor.subscribe("ConfirmedRequests");
Meteor.subscribe("PendingRequests");
Meteor.subscribe("Menus");
Meteor.subscribe("Records");

PendingRequest = new SimpleSchema({
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
		allowedValues:['Center for Jewish Life', 'Forbes', 'Rocky/Mathey', 'Whitman', 'Wu/Wilcox', "All"],
		autoform: {
			options: [
			{label: "Center for Jewish Life", value: "Center for Jewish Life"},
			{label: "Forbes", value: "Forbes"},
			{label: "Rocky/Mathey", value: "Rocky/Mathey"},
			{label: "Whitman", value: "Whitman"},
			{label: "Wu/Wilcox", value: "Wu/Wilcox"},
			{label: "All", value: "All"},
			]
		}
	} 
});

PartialRequest = new SimpleSchema({
	location: {
		type: String,
		label: "Dining Hall",
		allowedValues:['Center for Jewish Life', 'Forbes', 'Rocky/Mathey', 'Whitman', 'Wu/Wilcox', "All"],
		autoform: {
			options: [
			{label: "Center for Jewish Life", value: "Center for Jewish Life"},
			{label: "Forbes", value: "Forbes"},
			{label: "Rocky/Mathey", value: "Rocky/Mathey"},
			{label: "Whitman", value: "Whitman"},
			{label: "Wu/Wilcox", value: "Wu/Wilcox"},
			{label: "All", value: "All"}
			]
		}
	},
	number : {
		type: String,
		label: "Phone Number",
		min: 10,
		max: 10
	}
});

Record = new SimpleSchema({
	food: {
		type: String,
		label: "Food"
	}
});

ConfirmedRequest = new SimpleSchema({
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
		allowedValues:['Center for Jewish Life', 'Forbes', 'Rocky/Mathey', 'Whitman', 'Wu/Wilcox', 'All']
	}
});

PendingRequests.attachSchema(PendingRequest);
ConfirmedRequests.attachSchema(ConfirmedRequest);
Records.attachSchema(Record);
PartialRequests.attachSchema(PartialRequest);

PendingRequests.allow({
	update: function () {
		return true;
	},
	insert: function () {
		return true;
	}
});

Records.allow({
	update: function () {
		return true;
	},
	insert: function () {
		return true;
	}
});

PartialRequests.allow({
	update: function () {
		return true;
	},
	insert: function () {
		return true;
	}
});

// Template.body.events({

// 	"click .sendPin": function () {
// 		var pin = Math.round(Math.random() * 1000);
// 		Meteor.call("sendSMS", pin);
//    	}
// )};

Template.body.events({
	"click .test": function () {
		Meteor.call("testValidate");
	},
	"click .clearPending": function () {
		Meteor.call("clearPendingRequests");
	}
});

// Template.body.helpers({
// 	users: function () {
// 		return Requests.find({}, {sort: {createdAt: -1}});
// 	},
// 	exampleDoc: function () {
// 		return Requests.findOne();
// 	}
// });

Template.form2.events({
	'submit ' : function () {
		var location = AutoForm.getFieldValue("location", "requestForm");
		var number = AutoForm.getFieldValue("number", "requestForm");
		var numberAdded = "+1".concat(number);
		var food = $('#food').val();
        
		console.log(location);
		console.log(numberAdded);
		console.log(food);

		var message = "Food: " + food + " Location: " + location;
		Meteor.call("sendSMS", number, message);
		Meteor.call("addPendingRequest", numberAdded, food, location);
		console.log("inserted");
	}
});

Template.form.helpers({
  settings: function() {
    return {
      position: "bottom",
      limit: 5,
      rules: 
      [
      {
          collection: Records,
          field: 'food',
          matchAll: true,
          template: Template.foodFill
        }
        ] 
    };
  },
  records: function() {
  	return Records.find().fetch();
  }
});

