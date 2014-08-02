var GA = require('analytics.google'); //This is calling our Google Analytics module
GA.debug = true; //This provides us with debugging information
GA.trackUncaughtExceptions = true; //Used for debugging purposes
 
var tracker = GA.getTracker("UA-47833378-1"); //This is creating a tracker variable that when called will send data to our web property



module.exports = tracker; //Export the tracker variable to be called elsewhere in your app
