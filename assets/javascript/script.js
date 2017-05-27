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
var chatRef = database.ref("/chat");

// '.info/connected' is a special location provided by Firebase that is updated every time
// the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");

var connection = false;
var playerKeyArray;
var wins = 0;
var losses = 0;
var iHaveChosen = false;
var theyHaveChosen = false;
var myChoice = "none";
var theirChoice = "none";
var myRef = playersRef.push();
var myKey = myRef.key;

// When the client's connection state changes...
connectedRef.on("value", function(snap) {

    // If they are connected..
    if (snap.val()) {
        //console.log(snap.val());
        connection = true;
    }

});

chatRef.remove();

// creates a player object to the connection instance up to 2 players.
playersRef.once('value').then(function(snap) {
    if (connection) {
        var numOfPlayers = snap.numChildren();
        //console.log(snap.numChildren());
        if (numOfPlayers < 2) {
            myRef.set({
                player: myRef.key,
                choice: 'none',
                wins: wins,
                losses: losses
            })
        }
        // Remove user from the connection list when they disconnect.
        if (typeof myRef !== "undefined") {
            myRef.onDisconnect().remove();
        }
        
    }
})

// on value change grab player keys and store into playerKeyArray
// on every value change in case player leaves and new player joins
playersRef.on("value", function(snap) {
    //console.log(snap.val());
    //console.log(Object.getOwnPropertyNames(snap.val()));
    if(snap.val() != null){
    	playerKeyArray = Object.getOwnPropertyNames(snap.val());
    }
    
    //console.log(JSON.stringify(playerKeyArray[0]));
    //keyArray = JSON.stringify(keyArray[0]);
    //console.log(snap.val().playerKey);

    // hide loading screen once second player joins, otherwise hide
    // enable player buttons once second player joins
    if(snap.numChildren() === 2){
    	$('.opponent-missing').hide();
    	$('.opponent-available').show();
    	$('.player-choice-button').removeAttr("disabled");
    }
    else{
    	$('.opponent-missing').show();
    	$('.opponent-available').hide();
    	$('.player-choice-button').attr("disabled", "disabled");
    }
})

// when child change, determine whether it is me or opponent
// update score
// once both players have chosen, call function compare choices
playersRef.on("child_changed", function(snap) {
    var changedProperty = snap.val();

    // determine array index for me and my opponent
    var myIndex = playerKeyArray.indexOf(myKey);


    // compare if the recent changedProperty player is me or opponent
    if (changedProperty.choice != "none") {
        if (playerKeyArray[myIndex] === changedProperty.player) {
            console.log("I have chosen " + changedProperty.choice);
            iHaveChosen = true;
            myChoice = changedProperty.choice;

        } else {
            console.log("My opponent has chosen " + changedProperty.choice);
            theyHaveChosen = true;
            theirChoice = changedProperty.choice;
        }
    }

    // update score
    if (playerKeyArray[myIndex] === changedProperty.player) {
        updateMyScore(changedProperty.wins, changedProperty.losses);

    } else {
        updateOpponentScore(changedProperty.wins, changedProperty.losses);
    }
	
	// once both players have chosen, compare their choices
	if (iHaveChosen === true && theyHaveChosen === true) {
	    theyHaveChosen = false;
	    iHaveChosen = false;
	    //console.log("they have both chosen!");
	    compare(myChoice, theirChoice);

	}
});


// update my choice to firebase
// resets button classes
$('.player-choice-button').on('click', function() {
    clearButtonStyles();

    $(this).addClass('btn-info');

    myRef.update({
        choice: $(this).attr('data-value')
    });
});

// compares and highlights each players choices and updates their player profile on who won or lost
function compare(myChoice, theirChoice) {
    $('.opponent-' + theirChoice).addClass('opponent-chosen');
    $(".opponent-chosen").animate({
          backgroundColor: "#fff",
        }, 4000 );
    $(".btn-info").animate({
          backgroundColor: "#DCDCDC",
        }, 4000 );
    console.log(myChoice + " " + theirChoice);
    if (myChoice === theirChoice) {
        console.log("it is a tie!");
        iTied();
    } else if (myChoice === "rock" && theirChoice === "scissors") {
        console.log("I win! rock beats scissors");
        iWon();
    } else if (myChoice === "scissors" && theirChoice === "paper") {
        console.log("I win! scissors beats paper");
        iWon()
    } else if (myChoice === "paper" && theirChoice === "rock") {
        console.log("I win! paper beats rock");
        iWon();
    } else {
        console.log("boo :(");
        iLost();
    }
}

// updates my score
function updateMyScore(wins, losses) {
    $('.player-wins').text(wins);
    $('.player-losses').text(losses);
}

// updates opponent score
function updateOpponentScore(wins, losses) {
    $('.opponent-wins').text(wins);
    $('.opponent-losses').text(losses);
}

function clearButtonStyles() {
    $('.opponent-choice-button').removeClass('opponent-chosen');
    $('.opponent-choice-button').attr('style',"");
    $('.player-choice-button').removeClass('btn-info');
    $('.player-choice-button').attr('style',"");
}

function iTied() {
    myRef.update({
        choice: "none"
    });
}

function iWon() {
    wins++;
    myRef.update({
        wins: wins,
        choice: "none"
    });
}

function iLost() {
    losses++;
    myRef.update({
        losses: losses,
        choice: "none"
    });
}


//****************
//
// chat feature
//
//****************

$('.js-send-chat').on('click', function(e){
	e.preventDefault();
	var string = $('.js-chat-input').val();
	console.log(string);
	chatRef.push({
		player: myKey,
		text: string
	});
	$('.js-chat-input').val("");
	
});

$('.js-chat-input').keypress(function(e){
	if (e.which == 13) {
		e.preventDefault();
		var string = $('.js-chat-input').val();
		chatRef.push({
			player: myKey,
			text: string
		});
        $('.js-chat-input').val("");

    }
});

chatRef.on('child_added', function(snap){
	var chatLine = $('<div>').addClass('flex-none');

	if(snap.val().player === myKey){

		$('.chat-box__main').prepend(chatLine.html("<b style='color: blue'>Me:</b> " + snap.val().text));
		
	}
	else{
		$('.chat-box__main').prepend(chatLine.html("<b style='color: red'>Opponent:</b> " + snap.val().text))
		
	}
});