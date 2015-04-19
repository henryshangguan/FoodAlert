PendingRequests = new Mongo.Collection("PendingRequests");
ConfirmedRequests = new Mongo.Collection("ConfirmedRequests");
Menus = new Mongo.Collection("Menus");
PartialRequests = new Mongo.Collection("PartialRequests");
NoRequests = new Mongo.Collection("NoRequests");
PendingDeletion = new Mongo.Collection("PendingDeletion");
Records = new Mongo.Collection("Records");

// route to / necessary on client side to remove splash page
Router.route('/', function () {

});