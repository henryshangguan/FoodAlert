Records = new Mongo.Collection("Records");
PendingRequests = new Mongo.Collection("PendingRequests");
ConfirmedRequests = new Mongo.Collection("ConfirmedRequests");
Menus = new Mongo.Collection("Menus");
PartialRequests = new Mongo.Collection("PartialRequests");


// route to / necessary on client side to remove splash page
Router.route('/', function () {

});