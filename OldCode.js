
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