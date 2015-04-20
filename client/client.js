Meteor.subscribe("ConfirmedRequests");
// Meteor.subscribe("PendingRequests");
// Meteor.subscribe("Menus");
Meteor.subscribe("Records");
// Meteor.subscribe("NoRequests");
// Meteor.subscribe("PendingDeletion");

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
	number : {
		type: String,
		label: "3. Enter your phone number for text notifications",
		min: 10,
		max: 14
	},
	location: {
		type: String,
		label: "1. Select a dining hall",
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
		max: 12
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
NoRequests.attachSchema(ConfirmedRequest);
PendingDeletion.attachSchema(ConfirmedRequest);

PendingRequests.allow({
	insert: function () {
		return true;
	}
});

// Records.allow({
// 	update: function () {
// 		return true;
// 	},
// 	insert: function () {
// 		return true;
// 	}
// });

// PartialRequests.allow({
// 	update: function () {
// 		return true;
// 	},
// 	insert: function () {
// 		return true;
// 	}
// });

ConfirmedRequests.allow({
	update: function () {
		return true;
	},
	remove: function () {
		return true;
	}
});


Template.body.events({
	"click .validate": function () {
		Meteor.call("testValidate");
	},
	"click .clearPending": function () {
		Meteor.call("clearPendingRequests");
	},
	"click .clearConfirmed": function () {
		Meteor.call("clearConfirmedRequests");
	},
	"click .getMenus": function () {
		Meteor.call("getMenus");
	},
	"click .clearMenus": function () {
		Meteor.call("clearMenus");
	},
	"click .faq": function () {
		bootbox.dialog({
			message:
			"<p><b>The dining hall did not actually have my requested food. What gives?</b></p> \
			<p>Sorry! Sometimes the dining halls have innaccurate menus. We're currently talking with them to try and fix the issue!</p><br> \
			<p><b>I love MealScout! How can I contact you/send you gifts?</b></p> \
			<p>Contact us at princetonmealscout@gmail.com for questions, comments, and suggestions!</p><br>",
			title: "Frequently Asked Questions",
		});
	},
	"click .seeRequests": function () {
		bootbox.prompt("Enter your phone number", function (result) {
			if (result == null) {
				return true;
			}
			var number = result.replace(/[^a-zA-Z0-9]/g, '');
			number = "+1".concat(number);
			if (ConfirmedRequests.find({number: number}).count() === 0) {
				bootbox.alert({
					size: 'medium',
					message: "No records found.",
					callback: function() {}
				
				})
			} else {
				Blaze.renderWithData(Template.sort, number, document.body);
			}
		})
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

Template.form.events({
	'submit ' : function () {
		event.preventDefault();
		var food = $('#food').val();

		if (Records.find({food: food}).count() === 0) {
			bootbox.alert({ 
    			size: 'medium',
    			message: "Not a valid food.", 
    			callback: function(){ /* your callback code */ }
			})
		}

		else {
					var location = AutoForm.getFieldValue("location", "requestForm");
		var result = AutoForm.getFieldValue("number", "requestForm");
		var number = result.replace(/[^a-zA-Z0-9]/g, '');
		var numberAdded = "+1".concat(number);
		var food = $('#food').val();

		$('#food').val('');
		$('#location').val('');
        
		// console.log(location);
		// console.log(numberAdded);
		// console.log(food);

		Meteor.call("addPendingRequest", numberAdded, food, location);

		bootbox.alert("A text message has been sent to your number. Please reply 'yes' to confirm.");
	}
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
          template: Template.foodFill,
          selector: function (match) {
          	regex = new RegExp(match, 'i');
          	var location = AutoForm.getFieldValue("location", "requestForm");
          	console.log(location);
          	if (location === "Forbes") {
          		return {$and: [{'food': regex}, {'Forbes': true}]}
          	}
          	else if (location === "Center for Jewish Life") {
          		return {$and: [{'food': regex}, {'Center for Jewish Life': true}]}
          	}
          	else if (location === "Rocky/Mathey") {
          		return {$and: [{'food': regex}, {'Rocky/Mathey': true}]}
          	}
          	else if (location === "Whitman") {
          		return {$and: [{'food': regex}, {'Whitman': true}]}
          	}
          	else if (location === "Wu/Wilcox") {
          		return {$and: [{'food': regex}, {'Wu/Wilcox': true}]}
          	}
          	else {
          		return {'food': regex}
          	}
          }
        }
        ] 
    };
  },
  records: function() {
  	return Records.find().fetch();
  }
});


Template.update.helpers({
	updateDoc: function(number) {
		return ConfirmedRequests.findOne({number: number});
	}
});

Template.sort.helpers({
	RequestsToSort: function() {
		var number = Blaze.getData();
			return ConfirmedRequests.findOne({number: number})['requests'];
	}
});

Template.sortable.events({
  'click .close': function (event, template) {
    // `this` is the data context set by the enclosing block helper (#each, here)
    // NEED TO MAKE THIS INTO A REVERSE TRANSFER
    var id = template.collection.findOne(this._id)['_id']['_str'];
    console.log(id);
    Meteor.call("reverseTransferRequest", id);
    Meteor.call("removeConfirmedRequest", id);
    //template.collection.remove(this._id);
    // // custom code, working on a specific collection
    // if (Attributes.find().count() === 0) {
    //   Meteor.setTimeout(function () {
    //     Attributes.insert({
    //       name: 'Not nice to delete the entire list! Add some attributes instead.',
    //       type: 'String',
    //       order: 0
    //     })
    //   }, 1000);
    // }
  }
});

