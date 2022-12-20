class CannonBall {
  constructor() {
    this.ball = Bodies.circle(
      player.positionX,
      height - 70,
      20,
      { isStatic: true }
    );
    World.add(world, this.ball);

   this.dummySprite = createSprite(this.ball.position.x, this.ball.position.y);
   this.dummySprite.setCollider("circle", 0, 0, 20); 
   this.dummySprite.visible = false;

    this.ballRemoved = false;

    this.shot = false;
  }

  displayBall(index) {
    if (!this.shot) {
      this.ball.position.x = player.positionX;
    }
       
    var ballPos = this.ball.position;
    image(cBI, ballPos.x, ballPos.y, 40, 40);
    
    this.dummySprite.position.x = ballPos.x;
    this.dummySprite.position.y = ballPos.y;

        
      
    if (
      this.ball.position.x > width + 60 || 
      this.ball.position.x < -60 ||
      this.ball.position.y > height + 60
    ){
      this.removeBall(index);

      return;
    };

    var collision = Matter.SAT.collides(this.ball, game.ground);
    if (collision.collided) {
      this.removeBall(index);

      return;
    }


    const i = firebaseIndex.get(`cannonBalls[${index}]`);
    if (i !== undefined) {
      firebase.ref(`players/player${player.index}/cannonBalls/${i}`)
        .update({
          posX: Math.round(this.ball.position.x),
          posY: Math.round(this.ball.position.y)
        }
      );  
    }  
  }

  shoot(launcher) {
    var newAngle = launcher.rotation-50;
    newAngle = newAngle * (3.14 / 180);
    var velocity = p5.Vector.fromAngle(newAngle);
    velocity.mult(0.5);
    Body.setStatic(this.ball, false);
    
  if (player.index === 1) {
      Body.setVelocity(this.ball, {
        x: velocity.x * (180 / 3.14),
        y: velocity.y * (180 / 3.14),
      });
    }
    
    if (player.index===2) {
      Body.setVelocity(this.ball, {
        x: (-1)*(velocity.x * (180 / 3.14)),
        y: velocity.y * (180 / 3.14),
      });
    }
    this.shot = true;
  }

  removeBall (index) {
    World.remove(world, this.ball);
    this.ball = null;
    delete this.ball;

    this.ballRemoved = true

    const i = firebaseIndex.get(`cannonBalls[${index}]`);
    firebase.ref(`players/player${player.index}/cannonBalls/${i}`)
      .update({
        removed: true,
        posX: 0,
        posY: 0
      }
    );

    this.dummySprite = null;
    delete this.dummySprite;
  }
}