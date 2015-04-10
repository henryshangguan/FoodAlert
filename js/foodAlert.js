var Collections = {};
//Template.registerHelper("Collections", Collections);

PendingRequests = Collections.PendingRequests = new Mongo.Collection("PendingRequests");
ConfirmedRequests = Collections.ConfirmedRequests = new Mongo.Collection("ConfirmedRequests");
Menus = new Mongo.Collection("Menus");
Records = new Mongo.Collection("Records");