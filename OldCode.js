
// html - body:
//  <!-- {{> newUser}} -->
//   <!-- {{> addFoodForm}} -->

//  js - isClient:
//  // Users = Collections.Users = new Mongo.Collection("Users");

// 	//Meteor.subscribe("Users");
// 	// Schemas.User = new SimpleSchema({
//   //   number: {
//   //   type: String,
//   //   label: "Phone Number",
//   //   min: 10,
//   //   max: 10
//   // },
//   // pin: {
//   //   type: String,
//   //   label: "PIN",
//   //   min: 4,
//   //   max: 4
//   // }
//   // });

//   //Users.attachSchema(Schemas.User);


//   // 	Template.newUser.events({
// // 		'click' : function () {
// //       var pinSent = Math.round((Math.random() + 1) * 1000);
// //       bootbox.dialog({message:"<form id='infos' name='infos' method='get' action=''>\
// //     <input type='tel' id='formPhone' name='formPhone' size='10' placeholder='Phone Number'/><br>\
// //     <input type='password' id='formPin' name='formPin' size='4' placeholder='PIN'/>\
// //     </form>",
// //       title: "Register for FoodAlert",
// //       buttons: {

// //     Register: {
// //       label: "Register",
// //       className: "btn-register",
// //       callback: function() {
// //         var formPhone = $('#formPhone').val();
// //         var formPin = $('#formPin').val();
        
// //         Meteor.call("sendSMS", pinSent, formPhone);
// //         bootbox.prompt("A verification code has been sent to your phone.", function(result) {
          
// //           var code = result;
// //           if (code == pinSent) {
// //             Meteor.call("addUser", formPhone, formPin);
// //             bootbox.alert("Number successfully registered.")
// //           }
// //           else if (code == null) {
// //             return true;
// //           }
// //           else {
// //             bootbox.alert("Incorrect verification code.")
// //             return false;
// //           }
// //           return true;
// //         });
// //       }          
// //     }
// //   }
// //   });
// // }
// // });


// Template.addFoodForm.events({
// 		'submit form' : function () {
// 			event.preventDefault();

// 			var number = event.target.phoneNumber.value;
// 			var pin = event.target.pin.value;
// 			var food = event.target.menuItem.value;
// 			var location = event.target.dhall.value;
// 			var request = [food, location];

// 			event.target.menuItem.value = "";
// 			event.target.dhall.value = "Select Dining Hall";

// 			Meteor.call("addRequest", number, request);
//       Meteor.call("addUser", number, pin);

// 			bootbox.alert("Your request has been saved");
// 		}
// 	});


// <template name="addFoodForm">

// 	<form class="add-favorite">
// 		Dining Hall<br>
// 		<select name="dhall" required>
// 			<option value="Select Dining Hall"></option>
// 			<option value="Center for Jewish Life"></option>
// 			<option value="Forbes"></option>
// 			<option value="Rocky/Mathey"></option>
// 			<option value="Whitman"></option>
// 			<option value="Wu/Wilcox"></option>
// 			<option value="All"></option>
// 		</select>
// 		<br>

// 		<input type="search" name="menuItem" placeholder="Menu Item" required>
// 		<br>
// 		<input type="tel" name="phoneNumber" placeholder="Phone Number" required>
// 		<br>
// 		<input type="password" name="pin" placeholder="PIN" required>
// 		<br>

// 		<input type="submit" value="Add Food">
// 	</form>

// </template>

// <template name="newUser">
// 		<input type="submit" value="New User" id="newUser" name="new-user">
// </template>

		// // addUser: function (number, pin) {
		// // 	Users.insert({number: number, pin: pin}, {validationContext: "insertForm"}, function(error, result) {

  // //     });
		// // },

		// // addRequest: function (number, request) {
		// // 	Requests.insert({
		// // 		number: number,
		// // 		request: request
		// // 	});
		// // },

  //   // submitNewUser: function(event) {
  //   //   Meteor.call("sendSMS", 6);
  //   // },
