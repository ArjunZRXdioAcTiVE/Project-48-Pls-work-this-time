class Player {
    constructor () {
        this.index = 0;
        this.name;
        this.rank = 0;
        this.score = 0;
        this.positionY = 0;
        this.positionX = 0;
       
        this.opponentName;
        this.opponentIndex;

        this.opponentMessage;
        this.messagesRecieved = 0;
        this.opponentMessages = [];
        this.displayOppMsgs = [];

        this.cParts_Destroyed = 0;

        this.damageDone = 0;
        this.damageTaken = 0;


        this.messagingInfo = createElement("h6")
            .position (45, 5)
            .class ("mGreeting")
        ;
        
        this.messagingInput = createInput ("")
            .attribute("placeholder", "Type Your Message Here")
            .position(25, this.messagingInfo.y + 75)
            .class("messagingInput")
            .hide()
        ;
        
        this.messageButton = createButton("Send")
            .position(55, this.messagingInput.y + 45)
            .class("sendButton")  
            .hide ()
        ;
        
        this.messageSetupExecuted = false;
        this.opponentMS = 0;
    }

    async trackPlayerCount () {
        await firebase.ref ("playerCount").on("value", (data) => {
            playerCount = data.val ();
        })
    }

    updatePlayerCount () {
        firebase.ref ("/").update({
            playerCount: playerCount,
        });
    }       

    newPlayer () {
        this.index = playerCount;
        this.name = form.nameInput.value ();

        if (this.index == 1) {
            this.positionX = 160;
            this.opponentIndex = 2;
        }   else {
            this.positionX = width - 160;
            this.opponentIndex = 1;
        }

        var playerInfoC = `players/player${this.index}`;

        firebase.ref (playerInfoC).set ({
            name: this.name,
            rank: 0,
            damageDone: {
                part: 0,
                health:0,
                tDamageDone:0
            },
            angle: 0,
            positionX: this.positionX,
            cannonBalls: {
                0: {
                    removed: true,
                    posX: 0,
                    posY: 0
                },
                1: {
                    removed: true,
                    posX: 0,
                    posY: 0
                }
            },

            message: ""
        });

        console.log (`${this.index} ${this.positionX} ${this.name} ${playerCount}`);
    }

    trackDamageDone (castle, c_index) {
        firebase.ref(`players/player${this.opponentIndex}/damageDone`)
            .on("value", (data) => {
                var Data = data.val();
                if (Data.tDamageDone === 0) return;

                if (Data.health === 0) {
                    castle[Data.part].remove();
                    delete gameObjects.castles[c_index][Data.part];
                    gameObjects.castles[c_index][Data.part] = null;
                }   else {
                    castle[Data.part].health = Data.health;
                }
                player.damageTaken = Data.tDamageDone;
            })
        ;
    }

    updateDamageDone (part, health) {
        firebase.ref(`players/player${this.index}`).update({
            damageDone: {
                part: parseInt(part),
                health: health,
                tDamageDone: this.damageDone
            }
        });
    }

    async messagingSetup () {
        await firebase.ref (`players/player${this.opponentIndex}/name`)
            .once("value", data => {
                this.opponentName = data.val ();
    
                form.greeting.hide ();
    
                this.messagingInfo.html (`Chat with ${this.opponentName}!`);
                this.messagingInput.show ();
                this.messageButton.show ();
                this.messageButtonClicked ();
                this.messageRecieved ();
            }
        )
    }
    
    messageButtonClicked () {
        this.messageButton.mouseClicked (() => {
            var msg = this.messagingInput.value() 
            if (msg.length > 30) {
                this.messagingInput.value(null);
                this.messagingInput.attribute(
                    "placeholder",
                    "Message can't be this long"
                )
                
                return;
            }  else if (msg.length === 0) return;

            firebase.ref (`players/player${this.index}`)
                .update ({
                    message : msg,
                })
            ;

            player.messagingInput.value(null);
        })   
    }
    
    async messageRecieved () {  
        var displayOppMsgs = []  
        await firebase.ref (`players/player${this.opponentIndex}/message`)
            .on("value", (data) => {
                var msg = data.val();
                
                if (msg.length === 0) return;
                if (this.opponentMessages.length === 3) {
                    this.opponentMessages = [];
                    for (const element of displayOppMsgs) {
                        element.hide();
                    }
                    displayOppMsgs = [];
                }
                var posY;

                this.opponentMessages.push(data.val());

                if (this.opponentMessages.length === 1) {
                    posY = 50
                    
                    displayOppMsgs[0] = createElement("h6")
                        .html(`${this.opponentName} says: ${msg}`)
                        .position(width - 80, posY)
                        .class("messaging")
                    ;
                }   else if (this.opponentMessages.length === 2) {
                    posY = 100

                    displayOppMsgs[1] = createElement("h6")
                        .html(`${this.opponentName} says: ${msg}`)
                        .position(width - 80, posY)
                        .class("messaging")
                    ;
                }   else if (this.opponentMessages.length === 3) {
                    posY = 150;

                    displayOppMsgs[2] = createElement("h6")
                        .html(`${this.opponentName} says: ${msg}`)
                        .position(width - 80, posY)
                        .class("messaging")
                    ;
                }
            })
        ;            
    }
    
    hideMessaging () {
        this.messagingInput.hide()
        this.messageButton.hide();
        this.messagingInfo.hide();
    }
}