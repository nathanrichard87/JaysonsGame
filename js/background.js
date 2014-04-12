(function (game) {

	var background = {};
		background.x = 0,
		background.y = 0,
		background.backgroundWidth = game.canvasWidth,
		background.backgroundHeight = game.canvasHeight,
		background.speed = 4,
		background.velX = 0,
		background.velY = 0,
		background.jumping = false;

	// Create images objects to use in the game.
	// ATTENTION, for testing, the images must have the url with ip. Does' t work with localhost
		background.backgroundImage1 = new Image(),
		background.backgroundImage2 = new Image();

	// backgrounds images
	background.backgroundImage1.src = 'http://localhost/2d-platform-game/img/background-1.jpg';
	background.backgroundImage2.src = 'http://localhost/2d-platform-game/img/background-2.jpg';

	/**
     * Expose component
     */
	game.background = background;

})(game);