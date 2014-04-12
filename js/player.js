var canvasPlayer = document.getElementById('player'),
	canvasBackground = document.getElementById('background'),
	canvasExtras = document.getElementById('extras'),
	contextPlayer = canvasPlayer.getContext('2d'),
	contextBackground = canvasBackground.getContext('2d'),
	contextExtras = canvasExtras.getContext('2d'),
	onObstacle,
	playerOnObstacle,
	playerLife = $('#playerLife'),
	playerScore = $('#playerScore'),
	playerHeartsDragon = $('#playerHeartsDragon'),
	controls = document.getElementById('controls'),
	mobileJump,
	mobileCrouch,
	mobileLeft,
	mobileRight,
	mobileAttack,
	walkingLeft = false,
	walkingRight = false,
	crouch = false,
	jump = false,
	attacking = false,
	backgroundPlusImages;


(function (win) {
	// requestAnimationFrame fallback
    var requestAnimationFrame = win.requestAnimationFrame || win.mozRequestAnimationFrame || win.webkitRequestAnimationFrame || win.msRequestAnimationFrame;
    win.requestAnimationFrame = requestAnimationFrame;

	var canvasWidth = win.innerWidth,
    	canvasHeight = win.innerHeight + 200, // plus 230 to fix the space withe that leaves the rotation diagonal of the canvas
    	playerWidth,
    	playerHeight,
		player = {
			x : (canvasWidth / 2) - 80,
			y : canvasHeight - 350, // y position of the player: 230 + the heigth of the player
			playerWidth : 80,
			playerHeight : 166,
			speed: 4,
			velX: 0,
			velY: 0,
			jumping : false,
			life : 5100,
			score : 0,
			heartsDragon : 0,
			attack : false,
			aggressive : 25
		},
		background = {
			x : 0,
			y : 0,
			backgroundWidth : canvasWidth,
			backgroundHeight : canvasHeight,
			speed: 4,
			velX: 0,
			velY: 0,
			friction: 0.75,
			jumping : false
		},
		extras = {
			x : 0,
			y : 0,
			extrasWidth : canvasWidth,
			extrasHeight : canvasHeight,
			speed: 6,
			velX: 0,
			velY: 0,
			friction: 0.85,
			jumping : false
		},
		keys = [],
		gravity = 0.25;


	// Set the canvas dimentions equal to the window dimentions
	canvasPlayer.width = canvasWidth + 200;
	canvasPlayer.height = canvasHeight;

	canvasBackground.width = canvasWidth + 200;
	canvasBackground.height = canvasHeight;

	canvasExtras.width = canvasWidth + 200;
	canvasExtras.height = canvasHeight;

	// Rotate the background canvas
	contextPlayer.rotate(-5.3 * Math.PI / 180);
	contextBackground.rotate(-5.3 * Math.PI / 180);
	contextExtras.rotate(-5.3 * Math.PI / 180);

	// Create images objects to use in the game.
	// ATTENTION, for testing, the images must have the url with ip. Does' t work with localhost
	var backgroundImage1 = new Image(),
		backgroundImage2 = new Image(),

		wolfImage = new Image(),
		warlockImage = new Image(),

		playerImage = new Image(),

		smallRockObstacle = new Image(),
		bigRockObstacle = new Image(),
		waterObstacle = new Image(),

		extras1 = new Image(),
		extras2 = new Image();


	// backgrounds images
	backgroundImage1.src = 'http://localhost/2d-platform-game/img/background-1.jpg';
	// backgroundImage1.onload = function () {
	// 	// Create a pattern with this image, and set it to "repeat".
	// 	backgroundPattern1 = contextBackground.createPattern(backgroundImage1, 'repeat');
	// }

	backgroundImage2.src = 'http://localhost/2d-platform-game/img/background-1.jpg';

	// enemies images
	wolfImage.src = 'http://localhost/2d-platform-game/img/enemie.png';
	warlockImage.src = 'http://localhost/2d-platform-game/img/warlock.png';

	// player images
	playerImage.src = 'http://localhost/2d-platform-game/img/player.png';

	// obstacles images
	smallRockObstacle.src = 'http://localhost/2d-platform-game/img/small-rock.png';
	bigRockObstacle.src = 'http://localhost/2d-platform-game/img/big-rock.png';

	waterObstacle.src = 'http://localhost/2d-platform-game/img/water.png';

	// extras images
	extras1.src = 'http://localhost/2d-platform-game/img/extras-1.png';
	extras2.src = 'http://localhost/2d-platform-game/img/extras-2.png';

	/**
	 * Class constructor of obstacles
	 * @function
	 * @params {image, x, y, width, height}
	 * @example
	 * new Obstacles(rockObstacle, canvasWidth, canvasHeight -120 -(the height of the image plus 230 of the canvas), 150, 150);
	 */
	function Obstacles (name, image, x, y, width, height, differenceY) {
		this.name = name;
		this.image = image;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.differenceY = differenceY;
	}

	// Array to add and remove obstacles in the game
	var obstaclesArray = [];

	// Push obstacles into the array
	obstaclesArray.push(
				  new Obstacles('rock', smallRockObstacle, canvasWidth + 700, canvasHeight - 280, 159, 125, 50),
				  new Obstacles('rock', bigRockObstacle, canvasWidth + 1100, canvasHeight - 302, 247, 194, 92),
				  new Obstacles('water', waterObstacle, canvasWidth + 1500, canvasHeight - 220, 222, 70, 70)
				  );

	/**
	 * Class constructor of enemies
	 * @function
	 * @params {image, x, y, width, height, velX}
	 * @example
	 * new Enemies(100, 'wolf', wolfImage, canvasWidth, canvasHeight -80, 50, 50, 0, 0.9, 2, 50);
	 */
	function Enemies (life, name, image, x, y, width, height, velocityX, friction, speed, aggressive) {
		this.life = life;
		this.name = name;
		this.image = image;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.velocityX = velocityX;
		this.friction = friction;
		this.speed = speed;
		this.aggressive = aggressive;
	}

	// Array to add and remove enemies in the game
	var enemiesArray = [];

	// Push enemies into the array
	function pushEnemies () {
		enemiesArray.push(
					  new Enemies(400, 'wolf', wolfImage, canvasWidth + (-(background.x)), canvasHeight -250, 50, 50, 0, 0.9, 2, 50)
					  );
	}

	// Add random enemies
	var randomTimeEnemies = Math.floor(Math.random() * (7000 - 4000 + 1)) + 4000;

	setInterval(function() {
		pushEnemies();
	}, randomTimeEnemies);


    /**
	 * Move the players and the enemies and update it with requesAnimationFrame.
	 * @returns {renders(), requestAnimationFrame(update)}
	 * @function
	 * @example
	 * update();
	 */
	function update () {

		// up arrow or space
		if (keys[38] || keys[32] || mobileJump) {

			onObstacle = false;

			if (!background.jumping) {
				background.jumping = true;

				setFramesPlayerSprite('jumpingRight', 0, 9, 55);

				if (frame == 6) {

					background.velY =+ (background.speed * 2);

				}
				// This run when the character touch the land.
				// if (background.velY <= 0) {
				//   	//frame = 0;
				// }
			}
		}


		// down arrow
		if (keys[40] || mobileCrouch) {
			// Function OK when the player only walk from right
			setFramesPlayerSprite('crouchRight', 0, 9, 100);

			if (frame == 4) {
				// Only show the 6 frame becouse my animation start in 6 and have 1 frame of lenght
				setFramesPlayerSprite('crouchRight', 4, 1, 100);
			}
		}


		// If down arrow is drop
		// if (keys[40] == false) {

		// 	if (frame >= 4) {

		// 		setFramesPlayerSprite('crouch', 5, 9, 100);

		// 		if (frame == 8) {
		// 			//setFramesPlayerSprite('crouch', 8, 1, 100);
		// 			setFramesPlayerSprite('walkingRight', 0, 9, 100);
		// 		}
		// 	}
		// }



		// left arrow
		if (keys[37] || mobileLeft) {
			if (background.velX < background.speed  ||  extras.velX < extras.speed) {

				background.velX++;

				extras.velX++;

				walkingLeft = true;

				setFramesPlayerSprite('walkingLeft', 0, 9, 100);
			}
		}

		// right arrow
		if (keys[39] || mobileRight) {
			if (background.velX >- background.speed && extras.velX >- extras.speed) {

				background.velX--;

				extras.velX--;

				walkingRight = true;

				setFramesPlayerSprite('walkingRight', 0, 9, 100);
			}
		}

		// If the player is on the start position
		if (walkingLeft == false && walkingRight == false) {
			if (crouch == false) {
				setFramesPlayerSprite('walkingStopRight', 0, 9, 100);
			}
		}

		// If left arrow is drop
		if (keys[37] == false) {
			if (!walkingRight) {
				setFramesPlayerSprite('walkingStopLeft', 0, 9, 100);
			}
		}

		// If right arrow is drop
		if (keys[39] == false) {
			if (!walkingLeft) {
				setFramesPlayerSprite('walkingStopRight', 0, 9, 100);
			}
		}

		// a key
		if (keys[65] || mobileAttack) {
			player.attack = true;

			// run the sprite animation for the attack
			setFramesPlayerSprite('attackRight');
			attacking = true;
		}

		// reset the player attack to false when the user drop the key a or the mobile button attack
		if (keys[65] == false || mobileAttack == false) {
			player.attack = false;
		}




		// apply friction to the horizontal movement of the background
		background.velX *= background.friction;

		extras.velX *= extras.friction;


		// apply gravity to the up movement of the background
		if (onObstacle) {
			background.velY = 0;
		} else {
			background.velY -= gravity;
		}

		// Move the the background
		background.x += background.velX;
		background.y += background.velY;

		// Move the the extras
		extras.x += extras.velX;


		// reset the jump property when the background hits the ground
		if (background.y <= canvasHeight - background.backgroundHeight) {
			background.y = canvasHeight - background.backgroundHeight;
			background.jumping = false;
		}

		// the player stop and not go outside of the canvas and add the last enemie
		// plus the with images that repeat in the background
		backgroundPlusImages = backgroundImage1.width * 5

		if (background.x > 0) {
			background.x = 0;

		} else if ( -(background.x) >= backgroundPlusImages - canvasWidth - 200) {

			background.x = -(backgroundPlusImages - canvasWidth - 200);

			// add the final enemie
			addFinalEnemie();
		}


		// render all the game
		renders();


		var lengthEnemiesArray = enemiesArray.length,
			lengthobstaclesArray = obstaclesArray.length,
			j,
			k,
			h;

		// move the enemies
		// for (j = 0; lengthEnemiesArray > j; j += 1) {
		// 	// Check if the velocityX is less that the speed. If this condition is true continuous substracting the velocityX.
		// 	if (enemiesArray[j].velocityX >- enemiesArray[j].speed) {
		// 		enemiesArray[j].velocityX--;
		// 	}

		// 	enemiesArray[j].velocityX *= friction;

		// 	enemiesArray[j].x += enemiesArray[j].velocityX;
		// };

		onObstacle = false;

		//check the collision whit the enemies and if the enemie is out the canvas
		// for (k = 0; lengthEnemiesArray > k; k += 1) {

		// 	checkCollision(player, enemiesArray[k]);
		// 	// if (lengthEnemiesArray > 5) {
		// 	// 	enemiesIsOutTheCanvas(enemiesArray[k]);
		// 	// }
		// }

		// //check the collision with the obstacles
		// for (h = 0; lengthobstaclesArray > h; h += 1) {
		// 	if (obstaclesArray[h].name == 'rock') {
		// 		checkCollision(player, obstaclesArray[h]);
		// 	}
		// }

		// Update player life
		playerLife.html('PLAYER LIFE :' + player.life);

		// Update player score
		playerScore.html('PLAYER SCORE :' + player.score);

		// Update player hearts dragon
		playerHeartsDragon.html('PLAYER HEARTS DRAGON :' + player.heartsDragon);

		// run through the loop again to refresh the game all time
		requestAnimationFrame(update);
	}


	/**
	 * Render the player in the middle of the scene game
	 * @function
	 * @example
	 * renderPlayer();
	 */
	function renderPlayer () {
		//contextPlayer.drawImage(imageSrc, x, y, width, height);
		contextPlayer.drawImage(
			playerImage,
			player.x,
			player.y,
			player.playerWidth,
			player.playerHeight
			);
	}


	/**
	 * Render the background in the game
	 * @function
	 * @example
	 * renderBackground();
	 */
	function renderBackground () {
		// Less the canvasHeight to the height of the image to position the y positon of the image in the bottom of the page.
		var backgroundImage1Difference = backgroundImage1.height - canvasHeight;

		contextBackground.clearRect(0, 0, canvasWidth, canvasHeight);

		if ( -(background.x) <= (backgroundImage1.width - 200) ) {
			contextBackground.drawImage(backgroundImage1, background.x - 200, background.y - backgroundImage1Difference, backgroundImage1.width, backgroundImage1.height);
		}

		// Ask if the background.x position is less than the backgroundImage1.width - 200 AND ask if the background.x position is higher
		// than backgroundImage1.width * 2) - 200 tha is the position where start the third image.
		if ( -(background.x) >= (backgroundImage1.width - 200) - canvasWidth  &&  -(background.x) <= ( (backgroundImage1.width * 2) - 200 ) ) {
			contextBackground.drawImage(backgroundImage1, background.x + (backgroundImage1.width - 200), background.y - backgroundImage1Difference, backgroundImage2.width, backgroundImage2.height);
		}

		if ( -(background.x) >= (backgroundImage1.width * 2 - 200) - canvasWidth  &&  -(background.x) <= ( (backgroundImage1.width * 3) - 200 ) ) {
			contextBackground.drawImage(backgroundImage1, background.x + ((backgroundImage1.width * 2) - 200), background.y - backgroundImage1Difference, backgroundImage2.width, backgroundImage2.height);
		}

		if ( -(background.x) >= (backgroundImage1.width * 3 - 200) - canvasWidth  &&  -(background.x) <= ( (backgroundImage1.width * 4) - 200 ) ) {
			contextBackground.drawImage(backgroundImage1, background.x + ((backgroundImage1.width * 3) - 200), background.y - backgroundImage1Difference, backgroundImage2.width, backgroundImage2.height);
		}

		if ( -(background.x) >= (backgroundImage1.width * 4 - 200) - canvasWidth  &&  -(background.x) <= ( (backgroundImage1.width * 5) - 200 ) ) {
			contextBackground.drawImage(backgroundImage1, background.x + ((backgroundImage1.width * 4) - 200), background.y - backgroundImage1Difference, backgroundImage2.width, backgroundImage2.height);
		}
	}


	/**
	 * Render all the enemies in the game
	 * @function
	 * @example
	 * renderObstacles();
	 */
	function renderEnemies () {

		var wolfImageDifference = canvasHeight - wolfImage.height,
		lengthEnemiesArray = enemiesArray.length,
		i;

		for (i = 0; lengthEnemiesArray > i; i += 1) {
			// plus this: enemiesArray[i].x + background.x: becouse i need to know all time where the background.x is and plus it to the positio of the enemie.
			contextBackground.drawImage(
				enemiesArray[i].image,
				enemiesArray[i].x + background.x,
				enemiesArray[i].y + background.y,
				enemiesArray[i].width,
				enemiesArray[i].height);
		};

	}


	/**
	 * Render all the obstacles in the game
	 * @function
	 * @example
	 * renderObstacles();
	 */
	function renderObstacles () {

		var lengthObstaclesArray = obstaclesArray.length,
		n;

		for (n = 0; lengthObstaclesArray > n; n += 1) {
			contextBackground.drawImage(
					obstaclesArray[n].image,
					obstaclesArray[n].x + background.x,
					obstaclesArray[n].y + background.y,
					obstaclesArray[n].width,
					obstaclesArray[n].height);
		}
	}


	/**
	 * Render all the extras in the game
	 * @function
	 * @example
	 * renderExtras();
	 */
	function renderExtras () {
		contextExtras.clearRect(-200, 0, canvasWidth + 200, canvasHeight);
		contextExtras.drawImage(extras1, extras.x, background.y - (extras1.height - canvasHeight), extras1.width, extras1.height);
	}


	/**
	 * Add the final enemie to the game.
	 * @function
	 * @example
	 * addFinalEnemie();
	 */
	function addFinalEnemie () {
		enemiesArray.push(
				new Enemies(100, 'warlock', warlockImage, (backgroundPlusImages - 200) - warlockImage.width, canvasHeight -450, 245, 258, 0, 0, 0, 150)
				);
	}


	/**
	 * Check the right/left top/button collisions between the player and enemies or obstacles.
	 * @param {object} player, {object} enemie or obstacle array position. Later i get the position of the array with indexOF
	 * @returns {collisionDirection}
	 * @function
	 * @example
	 * checkCollision(player, enemiesArray[k]);
	 */
	function checkCollision(player, enemieOrObstacle) {
		// get the vectors to check against
		// Here less the background.x to the player.x becouse the player.x is allways the same. The player isn't animated. The background is animated.
		var distanceToCollisionX = (player.x - background.x + (player.playerWidth / 2)) - (enemieOrObstacle.x + (enemieOrObstacle.width / 2)),
			distanceToCollisionY = (player.y - background.y + (player.playerHeight / 2)) - (enemieOrObstacle.y + (enemieOrObstacle.height / 2)),

			// add the half widths and half heights of the objects
			halfWidths = (player.playerWidth / 2) + (enemieOrObstacle.width / 2),
			halfHeights = (player.playerHeight / 2) + (enemieOrObstacle.height / 2),
			collisionDirection = null;

		// if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
		if (Math.abs(distanceToCollisionX) < halfWidths && Math.abs(distanceToCollisionY) < halfHeights) {
			// figures out on which side we are colliding (top, bottom, left, or right)
			var oX = halfWidths - Math.abs(distanceToCollisionX),
				oY = halfHeights - Math.abs(distanceToCollisionY);

			if (oX >= oY) {
				if (onObstacle == false) {
					if (distanceToCollisionY > 0) {
						collisionDirection = "BUTTON";
					} else {
						// Block de background
						collisionDirection = "TOP";

						// if the collision come from wolf
						if (enemieOrObstacle.name == 'wolf') {

							background.y = enemieOrObstacle.height;

						// when te collision is with obstacle
						} else if (enemieOrObstacle.name == 'rock') {

							background.y = enemieOrObstacle.height - enemieOrObstacle.differenceY;
							onObstacle = true;
						}
						// } else if (enemieOrObstacle.name == 'water') {
						// 	//console.log('estoy sobre water');
						// 	background.velX -= 0.5;
						// 	onObstacle = true;
						// }
					}
				}

			} else {
				if (distanceToCollisionX > 0) {
					// Block de background
					collisionDirection = "LEFT";
					background.velX = 0;
					background.velX--;

					// if the collision come from wolf
					if (enemieOrObstacle.name == 'wolf') {

						// if the player is attacking
						if (player.attack) {
							//remove enemie life
							// cuando el jugador esta atacando tengo que hace que no le saque vida al jugador
							enemieOrObstacle.life -= player.aggressive;
						} else {
							//remove player life
							player.life -= enemieOrObstacle.aggressive;
						}

						// check if the player or enemie is alive
						entityIsAlive(player, enemieOrObstacle);

					} else if (enemieOrObstacle.name == 'warlock') {

						// if the player is attacking
						if (player.attack) {
							//remove enemie life
							enemieOrObstacle.life -= player.aggressive;

						} else {
							//remove player life
							player.life -= enemieOrObstacle.aggressive;
						}

						// check if the player or enemie is alive
						entityIsAlive(player, enemieOrObstacle);

					}
					// else if (enemieOrObstacle.name == 'water') {
 					// console.log('left');
 					// onObstacle = true;
					// }


				} else {
					// Block de background
					collisionDirection = "RIGHT";
					background.velX = 0;
					background.velX++;

					// If the collision come from enemie remove player life
					if (enemieOrObstacle.name == 'wolf') {

						// if the player is attacking
						if (player.attack) {
							//remove enemie life
							enemieOrObstacle.life -= player.aggressive;

						} else {
							//remove player life
							player.life -= enemieOrObstacle.aggressive;
						}

						// check if the player or enemie is alive
						entityIsAlive(player, enemieOrObstacle);

					} else if (enemieOrObstacle.name == 'warlock') {

						// if the player is attacking
						if (player.attack) {
							//remove enemie life
							enemieOrObstacle.life -= player.aggressive;
						} else {
							//remove player life
							player.life -= enemieOrObstacle.aggressive;
						}

						// check if the player or enemie is alive
						entityIsAlive(player, enemieOrObstacle);

 					}
 				// 	else if (enemieOrObstacle.name == 'water') {
 				// 		background.velX -= 0.5;
 				// 		onObstacle = true;
					// }

				}
			}
		}

		return collisionDirection;
	}


	/**
	 * Check the right/left top/button collisions between the player and enemies or obstacles.
	 * @param {object} player, {object} enemie array
	 * @returns {collisionDirection}
	 * @function
	 * @example
	 * checkCollision(player, enemies);
	 */
	function entityIsAlive (player, enemies) {

		var enemiesArrayPosition = enemiesArray.indexOf(enemies);

		if (player.life < 0) {
			console.log('GAME OVER');
			// Display inline or block to an element in the html that is diplay none and z-index -100 whit the menu desing and buttons.
			// Player a la position 0.
			// Enemies and obstacles reset the array.
			// Life player set to 100%.

		} else if (enemies.life < 0) {
			//get the position of the enemie died;
			var enemiesArrayPosition = enemiesArray.indexOf(enemies);
			//remove the enemie died;
			enemiesArray.splice(enemiesArrayPosition, 1);

			// The player get 100 points becouse kill one enemie
			playerUpdateScore(100);
		}
	}


	/**
	 * Update the player score when the player kill an enemie.
	 * @param {number} score,
	 * @function
	 * @example
	 * playerUpdateScore(100);
	 */
	function playerUpdateScore (scoreGet) {
		player.score += scoreGet;
	}


	/**
	 * Chek if the enemie is out the canvas
	 * @param {Array} enemiesArray[j],
	 * @function
	 * @example
	 * enemiesIsOutTheCanvas(enemiesArray[j]);
	 */
	function enemiesIsOutTheCanvas (enemies) {
		var positionXOfEnemie = enemiesArray[enemiesArray.indexOf(enemies)].x;
		if (positionXOfEnemie < 100) {
			//no me deja eliminarlo porque todavía esta chequeando si tiene colition
			//enemiesArray.splice(enemiesArray[enemiesArray.indexOf(enemies)], 1);
			console.log(enemiesArray.indexOf(enemies));
			enemiesArray.splice(enemiesArray.indexOf(enemies), 1);
		}
	}

	/* Sprite animation */
	var playerSpriteRight = new Image(),
		playerSpriteLeft = new Image(),
		frame = 0,
		delta,
		lastUpdateTime = 0,
		updateDelta = 0,
		msPerFrame = 100;

	playerSpriteRight.src = 'http://localhost/2d-platform-game/img/player-actions-right.png';
	playerSpriteLeft.src = 'http://localhost/2d-platform-game/img/player-actions-left.png';


	/**
	 * Set the frames amount and speed.
	 * @param {String} walkingRight,
	 * @function
	 * @example
	 * setFramesPlayerSprite('walkingRight', 9, 0, 100);
	 */
	function setFramesPlayerSprite (walkingDirection, frameStartPosition, frameCuantity, msPerFrame) {

		delta = Date.now() - lastUpdateTime;

		if (updateDelta > msPerFrame) {
			updateDelta = 0;

			drawSpriteAnimation(walkingDirection);

			frame += 1;

			if (frame >= frameCuantity) {
				frame = frameStartPosition;
			}

		} else {
			updateDelta += delta;
		}

		lastUpdateTime = Date.now();
	}


	/**
	 * Draw the sprite animation depending on the direction of the arrow down
	 * @param {String} walkingRight,
	 * @function
	 * @example
	 * drawSpriteAnimation('walkingRight');
	 */
	function drawSpriteAnimation (walkingDirection) {

		// 	contextPlayer.drawImage(img, sx, sy, swidth, sheight, x, y, width, height);
		// 	img	Specifies the image, canvas, or video element to use
		// 	sx	Optional parameter. The x coordinate where to start clipping
		// 	sy	Optional parameter. The y coordinate where to start clipping
		// 	swidth	Optional parameter. The width of the clipped image
		// 	sheight	Optional parameter. The height of the clipped image
		// 	x	The x coordinate where to place the image on the canvas
		// 	y	The y coordinate where to place the image on the canvas
		// 	width	Optional parameter. The width of the image to use (stretch or reduce the image)
		// 	height	Optional parameter. The height of the image to use (stretch or reduce the image)

		contextPlayer.clearRect(0, 0, canvasWidth, canvasHeight);

		switch (walkingDirection) {
            case 'walkingRight':
          		contextPlayer.drawImage(playerSpriteRight, frame * 149, 0, 149, 200, (canvasWidth / 2) -100, canvasHeight - 355, 149, 200);
            break;

            case 'walkingStopRight':
            	contextPlayer.drawImage(playerSpriteRight, frame * 148, 190, 148, 200, (canvasWidth / 2) -100, canvasHeight - 355, 148, 200);
            break;

            case 'crouchRight':
            	contextPlayer.drawImage(playerSpriteRight, frame * 149, 380, 149, 200, (canvasWidth / 2) -100, canvasHeight - 355, 149, 200);
            break;

            case 'jumpingRight':
            	contextPlayer.drawImage(playerSpriteRight, frame * 149, 570, 149, 200, (canvasWidth / 2) -100, canvasHeight - 355, 149, 200);
            break;

            case 'attackRight':
            	contextPlayer.drawImage(playerSpriteRight, frame * 151, 778, 151, 200, (canvasWidth / 2) -100, canvasHeight - 355, 151, 200);
            break;

            case 'walkingLeft':
          		contextPlayer.drawImage(playerSpriteLeft, frame * 149, 0, 149, 200, (canvasWidth / 2) -100, canvasHeight - 355, 149, 200);
            break;

            case 'walkingStopLeft':
            	contextPlayer.drawImage(playerSpriteLeft, frame * 148, 190, 148, 200, (canvasWidth / 2) -100, canvasHeight - 355, 148, 200);
            break;

            case 'crouchLeft':
            	contextPlayer.drawImage(playerSpriteLeft, frame * 149, 380, 149, 200, (canvasWidth / 2) -100, canvasHeight - 355, 149, 200);
            break;

            case 'jumpingLeft':
            	contextPlayer.drawImage(playerSpriteLeft, frame * 149, 570, 149, 200, (canvasWidth / 2) -100, canvasHeight - 355, 149, 200);
            break;

            case 'attackLeft':
            	contextPlayer.drawImage(playerSpriteLeft, frame * 151, 778, 151, 200, (canvasWidth / 2) -100, canvasHeight - 355, 151, 200);
            break;

        }
	}


	/**
	 * Render all the game's component.
	 * @returns {renderPlayer(), renderBackground(), renderEnemies(), renderObstacles()}
	 * @function
	 * @example
	 * renders();
	 */
	function renders () {
		// Call the function tha render the player
		//renderPlayer();

		// Call the function tha render the background image
		renderBackground();

		// Call the function tha render the enemies. I have to call this function random or when y want to a enemie appear.
		renderEnemies();

		// Call the function tha render the obstacles. I have to call this function random or when y want to a obstacle appear.
		//renderObstacles();

		// Call the function tha render the extras.
		renderExtras();
	}


	// Run the function renderExtras() each 9 seconds
	// setInterval(function() {
	// 	// Clean the context para que no se vayan agregando una imagen arriba de la otra
	// 	contextExtras.clearRect(0, 0, canvasWidth, canvasHeight);

	// 	// Call the function tha render the extras.
	// 	renderExtras();
	// }, 9000);


	// ATENCION: VER SI SETEANDO ALGUN FLAGA ACA PUEDO ARREGLAR LO DE DEJAR DE SALTAR OBSTACLES
	// listen when a key is pressed
	document.body.addEventListener("keydown", function (event) {
		keys[event.keyCode] = true;
	});

	// listen when a key is dropped
	document.body.addEventListener("keyup", function (event) {
		keys[event.keyCode] = false;

	});

	// listen when a mobile button is pressed
	controls.addEventListener("touchstart", function (event) {
		switch (event.target.className) {
            case 'top-arrow':
          		mobileJump = true;
            break;

            case 'down-arrow':
          		mobileCrouch = true;
            break;

            case 'left-arrow':
            	mobileLeft = true;
            break;

            case 'right-arrow':
            	mobileRight = true;
            break;

            case 'attack-key':
            	mobileAttack = true;
            break;
        }
	});

	// listen when a mobile button is pressed
	controls.addEventListener("touchend", function (event) {
		switch (event.target.className) {
            case 'top-arrow':
          		mobileJump = false;
            break;

            case 'down-arrow':
          		mobileCrouch = true;
            break;

            case 'left-arrow':
            	mobileLeft = false;
            break;

            case 'right-arrow':
            	mobileRight = false;
            break;

            case 'attack-key':
            	mobileAttack = false;
            break;
        }
	});

	//Call de update function when the page load.
	win.addEventListener("load", function(){
		update();
	});

})(this);