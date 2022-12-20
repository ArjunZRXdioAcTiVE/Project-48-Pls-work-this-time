class Form {
    constructor () {               
        this.nameInput = createInput("Enter Your Name")
            .position (width/2 - 95, height/2 + 30)
            .class ("customInput")
        ;

        this.button = createButton ("Play")
            .position (width/2 - 80, this.nameInput.y - 60)
            .class ("customButton")
        ;

        this.greeting = createElement("h6")
            .position (this.nameInput.x - 125, this.nameInput.y-25)
            .class ("greeting")
        ;        
    }

    hideForm () {
        this.nameInput.hide ();
        this.button.hide ();
        this.greeting.hide ();
        this.backgroundImg.hide();
    }

    buttonClicked () {
        this.button.mouseClicked (() => {
           this.buttonClickedF ();
        });
    }

    buttonClickedF () {
        this.nameInput.hide ();
        this.button.hide ();
        
        this.greeting.html(
            `Hey There ${this.nameInput.value()}!</br>
            waiting for another player`
        )
        this.greeting.show ()

        playerCount += 1;

        player.newPlayer ();
        player.updatePlayerCount ();
    }
}