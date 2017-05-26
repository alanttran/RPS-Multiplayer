var config = {
    apiKey: "AIzaSyDPWdpWl6mJRaoHNOGTh9wJLFLNVnaOZ4U",
    authDomain: "first-project-9b217.firebaseapp.com",
    databaseURL: "https://first-project-9b217.firebaseio.com",
    projectId: "first-project-9b217",
    storageBucket: "first-project-9b217.appspot.com",
    messagingSenderId: "768317022048"
};

firebase.initializeApp(config);

var database = firebase.database();

// --------------------------------------------------------------
// Link to Firebase Database for viewer tracking

// connectionsRef references a specific location in our database.
// All of our connections will be stored in this directory.
var playersRef = database.ref("/players");

// '.info/connected' is a special location provided by Firebase that is updated every time
// the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");

var player1;
var player2;

var connection = false;
var player1added = false;
var numOfPlayers;

var myRef = playersRef.push();
console.log(myRef.key);
//   var key = myRef.key();
// console.log(key);

// When the client's connection state changes...
connectedRef.on("value", function(snap) {

    // If they are connected..
    if (snap.val()) {
        console.log(snap.val());
        connection = true;
    }  

});

playersRef.once('value').then( function(snap) {
    if (connection) {
    	numOfPlayers = snap.numChildren();
        console.log(snap.numChildren());
        if (snap.numChildren() < 2) {
        	myRef.set({
        		player: myRef.key,
                choice: 'none'
        	})
        } 
        // Remove user from the connection list when they disconnect.
        if(typeof myRef !== "undefined"){
        	myRef.onDisconnect().remove();   
        }  
    }
})

playersRef.on("value", function(snap){
	console.log(snap.val());
})



$('.player-choice-button').on('click', function() {
    $('.player-choice-button').removeClass('btn-info');
    $(this).addClass('btn-info');

    myRef.update({
        choice: $(this).attr('data-value')
    });
});
