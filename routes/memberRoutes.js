/* 
 * This simple controller is to demonstrate the use of Passport.
 * There are two primary routes: 
 * 1) "/" - Does not require the user to authenticate (log in).
 * 2) "/membersOnly".  This does require autentication
 * And there are two supporting routes to log in and out (with obvious names).
 */
var mongoModel = require('../models/users.js')

cuisine_name = {
  "1": "American",
  "182": " Breakfast",
  "25": "Chinese",
  "38": "European",
  "40": "Fast Food",
  "148": "Indian",
  "55": "Italian",
  "73": "Mexican",
  "177": "Sushi"
}
/* 
 * Initialize this controller
 * @param {Express} app - The Express app
 */
exports.init = function(app) {
  var passport = app.get('passport');
  // Welcome page route
  app.all('/', function(req, res) {res.redirect("/index.html");});
  
  app.get('/membersOnly',
          checkAuthentication,
          doMembersOnly);

  app.put('/user/:username/:password', doCreate); // CRUD Create
  app.post('/user/:cuisine/:time/:cuisinee/:timee/:lat/:long', checkAuthentication, doUpdate);

  app.get('/groupInfo',
        checkAuthentication,
        doGroupInfo);

  app.get('/reset',
        checkAuthentication,
        doreset);

  app.post('/login',
          passport.authenticate('local', {
                                  failureRedirect: '/index.html',
                                  successRedirect: '/membersOnly'}));
  // The Logout route
  app.get('/logout', doLogout);
}

// No path:  display the welcome page
index = function(req, res) {
  res.render('index');
};

doCreate = function(req, res){
  mongoModel.create ( "users", 
                     {username: req.params.username, password: req.params.password, last_cuisine: "", last_cuisine_two: "", last_lat: "", last_long: "", last_time: "", last_time_to:""},
                     function(result) {
                       var success = (result ? "You have successfully signed up!" : "Sign up was unsuccessful, please try again");
                       res.send(success);
                     });
}

// Members Only path handler
doGroupInfo = function(req, res) {
  // We only should get here if the user has logged in (authenticated) and
  // in this case req.user should be defined, but be careful anyway.
  if (req.user && req.user.username) {
    // Render the membership information view
      mongoModel.retrieve(
        "users", 
        {},
       function(modelData) {
         if (modelData.length) {
          console.log(JSON.stringify(modelData));
            var map = [];

            for(var i = 0, size = modelData.length; i < size ; i++){
                 var long = modelData[i].last_long;
                 var lat = modelData[i].last_lat;
                 map.push(`<iframe src = "https://maps.google.com/maps?q=${lat},${long}&hl=es;z=14&amp;output=embed" width="400" height="60" frameBorder="0" class="secondary-content" ></iframe>`.toString());
              }

            var cuisines = [];
            var times = []

            for(var j = 0, size = modelData.length; j < size ; j++){
                if(modelData[j].last_cuisine != ""){
                 cuisines.push(modelData[j].last_cuisine);
                 cuisines.push(modelData[j].last_cuisine_two);
                 var t = modelData[j].last_time.split(":");
                 var t2 = modelData[j].last_time_to.split(":");
                 times.push(`dataTable.addRows([
      [ '${j}', '${modelData[j].username}', new Date(0,0,0,${+t[0]},${+t[1]},0),  new Date(0,0,0,${+t2[0]},${+t2[1]},0) ]]);`)
                 }
            }
            console.log(cuisines);
            var mf = 1;
            var m = 0;
            var item;
            for (var i=0; i<cuisines.length; i++)
            {
                    for (var j=i; j<cuisines.length; j++)
                    {
                            if (cuisines[i] == cuisines[j])
                             m++;
                            if (mf<m)
                            {
                              mf=m; 
                              item = cuisines[i];
                            }
                    }
                    m=0;
            }
            res.render('groupInfo', {member: req.user.username, data: modelData, maps: map, cuisine: item, times: times, cid: cuisine_name, link: `<script src="/socket.io/socket.io.js"></script> <script src="/javascripts/clientSocket.js"></script>`});

          } else {
            var message = "No documents with found.";
            res.send(message);
          }
       });

  } else {
    // Render an error if, for some reason, req.user.displayName was undefined 
    res.render('error', { 'message': 'Application error...' });
  }
};

doMembersOnly = function(req, res) {
  // We only should get here if the user has logged in (authenticated) and
  // in this case req.user should be defined, but be careful anyway.
  if (req.user && req.user.username) {
    // get the cuisines, times and places with usernames and print
    res.render('membersinfo', {member: req.user.username});
  } else {
    // Render an error if, for some reason, req.user.displayName was undefined 
    res.render('error', { 'message': 'Application error...' });
  }
};


function checkAuthentication(req, res, next){
    // Passport will set req.isAuthenticated
    if(req.isAuthenticated()){
        // call the next bit of middleware
        //    (as defined above this means doMembersOnly)
        next();
    }else{
        // The user is not logged in. Redirect to the login page.
        res.redirect("/index.html");
    }
}

doUpdate = function(req, res){
  
  mongoModel.update("users", {"username":req.user.username}, {"$set":{"last_cuisine": req.params.cuisine, "last_cuisine_two": req.params.cuisinee, "last_lat": req.params.lat, "last_long": req.params.long, "last_time": req.params.time, "last_time_to": req.params.timee}},
                     function(status) {
                       res.send("Great choice!");
                     });
}

doreset = function(req, res){
  
  mongoModel.update("users", {}, {"$set":{"last_cuisine": "", "last_cuisine_two": "", "last_lat": "", "last_long": "", "last_time": "", "last_time_to": ""}},
                     function(status) {
                       res.redirect("/groupInfo");
                     });
}

/* 
 * Log out the user
 */
function doLogout(req, res){
  // Passport puts a logout method on req to use.
  req.logout();
  // Redirect the user to the welcome page which does not require
  // being authenticated.
  res.redirect('/');
};