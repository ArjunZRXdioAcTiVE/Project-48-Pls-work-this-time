const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;

var cannonObjects = [];

var 
    kart1_Imgs = [], kart2_Imgs = [],
    cannonBalls = [], cBI, launchE, 
    shootSound
;

var gameObjects;

var castles = [];

var 
    castle1Images = [],
    castle2Images = []
;

var 
    form, formBackground_Img,
    game,  gameState = 0, background_Img,
    player, playerCount = 0
;

var 
    backgroundMusic, 
    winSound,
    loseSound
;

var engine, world;

var firebase;

var seconds = [], m;

const firebaseIndex = new Map();

var gameEndCalled = false;

function preload () {
    var cannonKart1_Img = loadImage ("assets/cannonKart1.png");
    var cannonLauncher1_Img = loadImage ("assets/cannonLauncher1.png");

    var cannonKart2_Img = loadImage ("assets/cannonKart2.png");
    var cannonLauncher2_Img = loadImage ("assets/cannonLauncher2.png");
    
    kart1_Imgs.push(
        cannonKart1_Img,
        cannonLauncher1_Img
    );

    kart2_Imgs.push(
        cannonKart2_Img,
        cannonLauncher2_Img
    );

    cBI = loadImage ("assets/cannonBall_I.png");


    launchE = loadImage ("assets/fire.png");
    shootSound = loadSound("assets/sounds/cannonBallShootSound.mp3");

    background_Img = loadImage ("assets/background.jpg");

    var castle1Broken_Img = loadImage ("assets/castleAssets/castle1.png");
    var castle1DP_Img = loadImage ("assets/castleAssets/castleDownPart1.png");
    var castle1MP_Img = loadImage ("assets/castleAssets/castleMiddlePart1.png");
    var castle1UP_Img = loadImage ("assets/castleAssets/castleUpPart1.png");

    var castle2Broken_Img = loadImage ("assets/castleAssets/castle2.png");
    var castle2DP_Img = loadImage ("assets/castleAssets/castleDownPart2.png");
    var castle2MP_Img = loadImage ("assets/castleAssets/castleMiddlePart2.png");
    var castle2UP_Img = loadImage ("assets/castleAssets/castleUpPart2.png");

    castle1Images.push(
        castle1Broken_Img,
        castle1DP_Img,
        castle1MP_Img,
        castle1UP_Img
    );

    castle2Images.push(
        castle2Broken_Img,
        castle2DP_Img,
        castle2MP_Img,
        castle2UP_Img
    )

    formBackground_Img = loadImage ("assets/formBackground.png");

    winSound = loadSound('assets/sounds/winSound.mp3');
    loseSound = loadSound('assets/sounds/loseSound.mp3')
    backgroundMusic = loadSound('assets/sounds/bgMusic.wav');
}

function setup () {
    createCanvas (windowWidth, windowHeight);

    engine = Engine.create();
    world = engine.world;

    firebase = firebase.database ();

    game = new Game ();
    game.initializeGame ();

    game.reset();
}

function draw () {
    if (playerCount < 2) {
        background(formBackground_Img);
    }

    if (gameState == 2) {
        background(formBackground_Img)
    }

    if (playerCount === 2 && gameState === 0) {

        player.messagingSetup ()

        game.gameStart ();
        game.detectCannonBallP (); 
        
        globalThis.startTime = [minute(), second()];
        console.log(startTime);

        if (startTime[0][0] === 58) {
            globalThis.endTime = [0, startTime[1]];
        }   else if (startTime[0][0] === 59)    {
            globalThis.endTime = [1, startTime[1]];
        }   else {globalThis.endTime=[startTime[0]+2, startTime[1]]};

        console.log(endTime);
        
        gameState = 1;
        
        game.updateState();
        game.trackState();
        
        backgroundMusic.play();
    }

    if (playerCount === 2 && gameState === 1) {
        
        game.play(
            gameObjects.castles[0],
            gameObjects.castles[1],
            gameObjects.cannonObjects[0],
            gameObjects.cannonObjects[1]
        );

        if (!backgroundMusic.isPlaying() && gameState == 1) {
            backgroundMusic.play()
        }
    }

    if (gameState === 1) {
        if (
            minute() === endTime[0] && 
            second() === endTime[1]
        ) {

            gameEnd("time");
        }
    } 

    // if (gameState == 2) {
        // gameEnd();
    // }

    Engine.update(engine);
}

function gameEnd(reason) {
    gameEndCalled = true
    gameState = 2;

    backgroundMusic.stop()

    var title;
    var text;
    var cB_Text;
    var image;

    firebase.ref('/').update({
        gameEnd: {
            ended: true,
            reason: reason
        }
    })

    game.updateState();

    if (reason == "time") {
        if (player.rank === 1) {
            title = "Time Over!"
            text = `You Won with ${player.damageDone} Damage! Took the win!`
            cB_Text = 'Fantastic!'

            image = "https://cdn.discordapp.com/attachments/842636710752026625/1049581077414547516/gameEndCastleImagewon.png"

            winSound.play()
        }   else {
            title = "Out of Time!"
            text = `You lost by ${player.damageTaken-player.damageDone} damage Better luck next time`;
            cB_Text = 'Ok'

            image = "https://cdn.discordapp.com/attachments/842636710752026625/1054662475011866624/castle1.png"
        
            loseSound.play()
        }
    }   else if (reason == "destroyed") {
        if (player.rank === 1) {
            title = "You won!"
            text = "Well Played! Destroyed the enemy's castle!"
            cB_Text = 'Fantastic!'

            image = "https://cdn.discordapp.com/attachments/842636710752026625/1049581077414547516/gameEndCastleImagewon.png"            
        
            winSound.play()
        }   else {
            title = "Game Over!"
            text = "Your castle got destroyed! Better Luck Next Time"
            cB_Text = 'Ok'
            
            image = "https://cdn.discordapp.com/attachments/842636710752026625/1054662475011866624/castle1.png"
        
            loseSound.play()
        }
    }
    swal({
        title: title,
        text: text,
        imageUrl:image,        
        imageSize: "100 x 100",
        confirmButtonText: cB_Text 
    });

    wrapUp()    
}

function wrapUp () {
    delete gameObjects;
    delete cannonBalls;

    game.playerInfo.hide();
    player.hideMessaging();
    game.button.hide();
}