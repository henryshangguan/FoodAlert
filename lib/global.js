Records = new Mongo.Collection("Records");
PendingRequests = new Mongo.Collection("PendingRequests");
ConfirmedRequests = new Mongo.Collection("ConfirmedRequests");
Menus = new Mongo.Collection("Menus");
PartialRequests = new Mongo.Collection("PartialRequests");


// route necessary in global file to remove splash page (apparently) ?
Router.route('/', function () {

});