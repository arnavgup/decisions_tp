
var mongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId; 

var connection_string = 'mongodb://localhost:27017/fmr';

connection_string = "mongodb://admin:admin@ds135926.mlab.com:35926/fmr"

var mongoDB; 

mongoClient.connect(connection_string, function(err, db) {
  if (err) doError(err);
  console.log("Connected to MongoDB server at: "+connection_string);
  mongoDB = db; // Make reference to db globally available.
});

exports.create = function(collection, data, callback) {
  // Do an asynchronous insert into the given collection
  mongoDB.collection(collection).insertOne(
    data,                     // the object to be inserted
    function(err, status) {   // callback upon completion
      if (err) doError(err);
      var success = (status.result.n == 1 ? true : false);
      callback(success);
    });
}

exports.retrieve = function(collection, query, callback) {
  mongoDB.collection(collection).find(query).toArray(function(err, docs) {
    if (err) doError(err);
    callback(docs);
  });
}

exports.delete = function(collection, query, callback) {
  mongoDB.collection(collection).deleteOne(query,
        function(err, status) {   // callback upon completion
      if (err) doError(err);
      var success = (status.result.n == 1 ? true : false);
      callback(success);
    });
}

exports.update = function(collection, filter, update, callback) {
    console.log(update);
  mongoDB
    .collection(collection)     // The collection to update
    .updateMany(                // Use updateOne to only update 1 document
      filter,                   // Filter selects which documents to update
      update,                   // The update operation
      {upsert:true},            // If document not found, insert one with this update
                                // Set upsert false (default) to not do insert
      function(err, status) {   // Callback upon error or success
        if (err) doError(err);
        console.log("noooo error");
        callback("recorded");
        });
}

var doError = function(e) {
        console.error("ERROR: " + e);
        throw new Error(e);
    }

exports.findByUsername = function(username, callback) {
    mongoDB.collection("users").find({"username": username}).toArray(function(err, docs) {
    if (err) doError(err);

    var foundUser = null;

    var err = null;
    // search for the user with a given username
    for (var i = 0 ; i < docs.length ; i++) {
      if (docs[i].username == username) {
        foundUser = docs[i];
        break;
      }
    }
    callback(err, foundUser);  });
}


exports.findById = function(id, callback) {

    mongoDB.collection("users").find(ObjectId(id)).toArray(function(err, docs) {
    if (err) doError(err);

    var foundUser = null;

    var err = null;
    for (var i = 0 ; i < docs.length ; i++) {
      console.log(docs[i]._id)
      if (docs[i]._id == id) {
        foundUser = docs[i];
        break;
      }
    }
    callback(err, foundUser);
  });



}
