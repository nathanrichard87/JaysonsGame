(function (win) {
	listenEventResize();

	/**
	 * Listen the resize envent and set the windows width - height.
	 * @function
	 * @returns {Function}
	 * @example
	 * initialize();
	 */
	function listenEventResize() {
		// Register an event listener to call the resizeCanvas() function each time the window is resized.
		win.addEventListener('resize', function () {
			canvasPlayer.width = win.innerWidth;
			canvasPlayer.height = win.innerHeight;

			canvasBackground.width = win.innerWidth;
			canvasBackground.height = win.innerHeight;

			redraw();
		});
	}

	/**
	 * Display custom canvas
	 * @function
	 * @example
	 * redraw();
	 */
	function redraw() {
		contextPlayer.strokeStyle = 'blue';
		contextPlayer.lineWidth = '5';
		contextPlayer.strokeRect(0, 0, win.innerWidth, win.innerHeight);

		contextBackground.strokeStyle = 'red';
		contextBackground.lineWidth = '5';
		contextBackground.strokeRect(0, 0, win.innerWidth, win.innerHeight);
	}

})(this);