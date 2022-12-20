class Game {
  constructor() {
    this.button = createButton("RESET")
      .position(width / 2 + 400, height / 2 + -200)
      .class("customButton")
    ;

    this.playerInfo = createElement('h3')
      .class('leaderboard')
      .position(width/2, 30)
    ;

    this.ground = Bodies.rectangle(
      width/2,
      height - 10,
      width,
      20,
      {isStatic: true}
    );

    World.add(world, this.ground);
    this.sprite = createSprite (
      this.ground.position.x,
      this.ground.position.y,
      width - 10,
      20
    );

    this.sCreating = false;

    this.oBCreated = false
    this.oBP = []
  }

  trackState() {
    firebase.ref("gameState").on("value", (data) => {
      gameState = data.val();

      if (gameState === 2 && !gameEndCalled) {
        firebase.ref('gameEnd').once('value', (data) => {
          const gE_Info = data.val();
          console.log(gE_Info)
          gameEnd(gE_Info.reason);
        })
      }
    });
  }

  updateState () {
    firebase.ref("/").update({
      gameState: gameState 
    })
  }

  initializeGame() {
    player = new Player();
    player.trackPlayerCount();

    if (playerCount < 2) {
      form = new Form();
      form.buttonClicked();
    } else {
      var sorryMessage = createElement("h6")
        .html(
          `Sorry, two players have already joined the session</br>
          please join the session later`
        )
        .position(width / 2 - 500, height / 2 - 100)
        .class("greeting")
      ;
    }
  }

  gameStart() {
    
    gameObjects = new Objects(
      160,
      width - 160,
      castle1Images,
      castle2Images,
      kart1_Imgs,
      kart2_Imgs
    );

    gameObjects.addObjects();
   
    if (player.index === 1) {
      player.trackDamageDone(gameObjects.castles[0], 0)
    } else {
      player.trackDamageDone(gameObjects.castles[1], 1);
    }

    form.greeting.hide();   
  }

  play(castle1, castle2, kart1, kart2) {
    imageMode(CENTER);
    image(background_Img, width / 2, height / 2, width, height);

    if (player.index == 1) {
      if (!keyDown("m")) {
        gameObjects.moveCannonKart(kart1[0], kart1[1]);
        
        player.positionX = kart1[0].position.x;
        gameObjects.writePosition();
        gameObjects.readPosition(kart2[0], kart2[1]);


        gameObjects.rotateCannonLauncher(kart1[1], UP_ARROW, DOWN_ARROW);

        gameObjects.writeAngle(kart1[1].rotation);
        gameObjects.readAngle(kart2[1]);

      } else if (keyDown("m")) {
        if (!this.sCreating) {
          this.addCannonBall();
          this.sCreating = true;
        }

        if (this.sCreating && cannonBalls[cannonBalls.length-1].shot) {
          this.addCannonBall();
        }
      }  
      
      if (
        keyDown ("s") &&
        this.sCreating &&
        !cannonBalls[cannonBalls.length-1].shot
      ) {
        if (cannonBalls.length === 1) {
          cannonBalls[cannonBalls.length-1].shoot(kart1[1]);
          shootSound.play()          
        } else {
          if (cannonBalls[cannonBalls.length-2].ballRemoved) {
            cannonBalls[cannonBalls.length-1].shoot(kart1[1]);
            shootSound.play()
          }
        }
      }

      if (this.sCreating) {
        for (
          var i = cannonBalls.length-2;
          i<cannonBalls.length;
          i++
        ) {
          if (cannonBalls[i]) {
            if (!cannonBalls[i].ballRemoved) {
              cannonBalls[i].displayBall(i);
            }
          }
        }
      }

      for (const data of this.oBP) {
        if (!data.removed) {
          image (cBI, data.posX, data.posY, 40, 40);
        }
      }

      this.detectCollisions (castle2);

      this.displayLeaderboard();

    } else if (player.index == 2) {
      if (!keyDown("m")) {
        gameObjects.moveCannonKart(kart2[0], kart2[1]);

        player.positionX = kart2[0].position.x;
        gameObjects.writePosition();
        gameObjects.readPosition(kart1[0], kart1[1]);


        gameObjects.rotateCannonLauncher(kart2[1], DOWN_ARROW, UP_ARROW);

        gameObjects.writeAngle(kart2[1].rotation);
        gameObjects.readAngle(kart1[1]);

      } else if (keyDown("m")) {
        if (!this.sCreating) {
          this.addCannonBall()
          this.sCreating = true;
        } 

        if (this.sCreating && cannonBalls[cannonBalls.length-1].shot) {
          this.addCannonBall();
        }
      } 
      if (cannonBalls[0]) {
        console.log (cannonBalls[cannonBalls.length - 1].shot);
      }
      if (
        keyDown("s") && 
        this.sCreating && 
        !cannonBalls[cannonBalls.length-1].shot 
      ) {
        if (cannonBalls.length === 1) {
          cannonBalls[cannonBalls.length-1].shoot(kart2[1])
        } else {
          if (cannonBalls[cannonBalls.length-2].ballRemoved) {
            cannonBalls[cannonBalls.length-1].shoot(kart2[1])
          }
        }

        shootSound.play();
      }
      
      if (this.sCreating) {
        for (
          var i = cannonBalls.length-2;
          i<cannonBalls.length;
          i++
        ) {
          if (cannonBalls[i]) {
            if (!cannonBalls[i].ballRemoved) {
              cannonBalls[i].displayBall(i);
            }
          }
        }
      }

      for (const data of this.oBP) {
        if (!data.removed) {
          image (cBI, data.posX, data.posY, 40, 40);
        }
      }

      this.detectCollisions (castle1);

      this.displayLeaderboard();
    }
    drawSprites ();
  }

  

  async addCannonBall () {
    var cannonBall = new CannonBall();
    cannonBalls.push(cannonBall);
    console.log (cannonBalls);

    var cB_1;

    await firebase.ref(`players/player${player.index}/cannonBalls`)
      .once("value", (data) => {
        const d = data.val();

        console.log(d)
        cB_1 = d[0].removed;
      }
    );

    if (cB_1 == true) {
      firebaseIndex.set(`cannonBalls[${cannonBalls.length-1}]`, 0);
    } else {
      firebaseIndex.set(`cannonBalls[${cannonBalls.length-1}]`, 1);
    }
    
    const a = firebaseIndex.get(`cannonBalls[${cannonBalls.length-1}]`);

    firebase.ref(`players/player${player.index}/cannonBalls/${a}`)
      .update({
        removed: false,
        posX: cannonBalls[cannonBalls.length-1].ball.position.x,
        posY: cannonBalls[cannonBalls.length-1].ball.position.y
      }
    );
  }

  detectCannonBallP () {
    firebase.ref(`players/player${player.opponentIndex}/cannonBalls`)
      .on("value", data => {
        this.oBP = data.val();
        
        console.log(this.oBP," data");
      }
    );
  }

  detectCollisions (castle) {
    for (var cB_Index in cannonBalls) {
      for (var cP_Index in castle) {
        if (cannonBalls[cB_Index].ballRemoved || castle[cP_Index] === null) break; //Ek Return ke chakkar mein
  
        cannonBalls[cB_Index].dummySprite.overlap(castle[cP_Index], (collector, collected) => {
          castle[cP_Index].health -= 40;
          player.damageDone += 40
          player.updateDamageDone(cP_Index, castle[cP_Index].health);

          cannonBalls[cB_Index].removeBall(cB_Index);

          if (castle[cP_Index].health === 0) {
            castle[cP_Index].remove();
            delete castle[cP_Index];
            
            castle[cP_Index] = null;

            if (cP_Index == 0) {
              gameEnd ("destroyed");
            }
          }
        })
      }
    }
  } 

  async displayLeaderboard () {
    await firebase.ref(`players`).once("value", data => {
      const playersInfo = data.val();
      
      if (
        playersInfo[`player${player.index}`].damageDone.tDamageDone > 
        playersInfo[`player${player.opponentIndex}`].damageDone.tDamageDone
      ) {
        player.rank = 1;
      } else {
        player.rank = 2;
      }

      if (
        playersInfo[`player${player.index}`].damageDone.tDamageDone -
        playersInfo[`player${player.opponentIndex}`].damageDone.tDamageDone
        === 0  
      ) {
        if (player.index === 1) {
          player.rank = 1;
        } else {
          player.rank = 2;
        }
      }

      firebase.ref(`players/player${player.opponentIndex}/damageDone/tDamageDone`)
        .once('value', (data) => {
          player.damageTaken
        })
      ;

      firebase.ref(`players/player${player.index}`).update({
        rank: player.rank
      });

      
      this.playerInfo
      .html(`
          Rank: ${playersInfo[`player${player.index}`].rank}
          Damage Taken: ${player.damageTaken}
          Damage Done: ${playersInfo[`player${player.index}`].damageDone.tDamageDone}
        `)      
    })
  }


  reset() {
    this.button.mouseClicked(() => {
      firebase.ref("/").set({
        players: {},
        playerCount: 0,
        gameState: 0,
        messages: {},
      });
      window.location.reload();
    });
  }
}
