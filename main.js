$(document).ready(function() {
	var KEY_LEFT = 37;
	var KEY_UP = 38;
	var KEY_RIGHT = 39;
	var KEY_DOWN = 40;

	var frameId = null;
	var dx = 0;
	var dy = 0;
	var speed = 50; // px per second
	var activeKey = 0;
	var activeMouse = false;

	window.requestAnimationFrame = window.requestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.msRequestAnimationFrame
		|| function(f){return setTimeout(f, 1000/60)};

	window.cancelAnimationFrame = window.cancelAnimationFrame
    	|| window.mozCancelAnimationFrame
		|| function(requestID){clearTimeout(requestID)};

	$(document).on("visibilitychange", function() {
		if (document.hidden && frameId) {
			// activate frame cycling when tab is active
			window.cancelAnimationFrame(frameId);
		} else if (!document.hidden) {
			// disable frame cycling when tab is not active
			frameId = window.requestAnimationFrame(recalculate);
		}
	});

	$('.success i').on('click', function() {
		$('.success').addClass('hidden');
	});

	// handle arrows on click & hold

	$('.moving_arrow a').on('mousedown mouseenter', function(event) {
		event.preventDefault();
		if (activeKey || (!activeMouse && event.type == 'mouseenter')) {
			return false;
		}
		activeMouse = true;

		if ($(this).hasClass('up')) {
			dy = -1;
			dx = 0;
		} else if ($(this).hasClass('down')) {
			dy = 1;
			dx = 0;
		} else if ($(this).hasClass('left')) {
			dx = -1;
			dy = 0;
		} else if ($(this).hasClass('right')) {
			dx = 1;
			dy = 0;
		}
		$(this).addClass("active");
		return false;
	}).on('mouseup mouseleave', function(event) {
		event.preventDefault();
		if (activeKey || !activeMouse) {
			return false;
		}
		activeMouse = false;

		if ($(this).hasClass('up') || $(this).hasClass('down')) {
			dy = 0;
		} else if ($(this).hasClass('left') || $(this).hasClass('right')) {
			dx = 0;
		}
		$(this).removeClass("active");

		return false;
	});

	// handle keyboard arrow keys
	$(document).on("keydown", function(event) {
		if (activeKey == event.keyCode || activeMouse) {
			return;
		}
		activeKey = event.keyCode;

		if (activeKey == KEY_UP) {
			dy = -1;
		} else if (activeKey == KEY_DOWN) {
			dy = 1;
		} else if (activeKey == KEY_LEFT) {
			dx = -1;
		} else if (activeKey == KEY_RIGHT) {
			dx = 1;
		}
	}).on("keyup", function(event) {
		var key = event.keyCode;

		if (key == KEY_LEFT || key == KEY_RIGHT) {
			dx = 0;
		} else if (key == KEY_DOWN || key == KEY_UP) {
			dy = 0;
		}

		activeKey = 0;
	});

	function getDirectionName() {
		return dx == 0 && dy == -1 ? 'top'
			: dx == 0 && dy == 1 ? 'bottom'
			: dx == 1 && dy == 0 ? 'right'
			: dx == -1 && dy == 0 ? 'left'
			: dx == -1 && dy == -1 ? 'top-left'
			: dx == 1 && dy == -1 ? 'top-right'
			: dx == -1 && dy == 1 ? 'bottom-left'
			: dx == 1 && dy == 1 ? 'bottom-right'
			: 'top';
	}

	function recalculate() {
		var $spaceship = $("#spaceship");

		if (!dx && !dy) { // no movement yet
			frameId = window.requestAnimationFrame(recalculate);
			$spaceship.removeClass("ignition");
			return;
		}

		$spaceship.addClass("ignition");

		var direction = getDirectionName();
		var spaceship = currentPosition($spaceship);

		spaceship.top += Math.round(dy / 10 * speed);
		spaceship.left += Math.round(dx / 10 * speed);
		spaceship.right = spaceship.left + spaceship.width;
		spaceship.bottom = spaceship.top + spaceship.height;

		// rotate rocket
		if (!$spaceship.hasClass(direction)) {
			$spaceship.removeClass(); // all
			$spaceship.addClass(direction);
			frameId = window.requestAnimationFrame(recalculate);
			return;
		}

		var collision = false;
		$(".obstacle").each(function(i, v) {
			if (collision) {
				return;
			}

			var obstacle = currentPosition($(v));
			if (
				spaceship.top < obstacle.bottom
				&& spaceship.right > obstacle.left
				&& spaceship.left < obstacle.right
				&& spaceship.bottom > obstacle.top
			) {
				collision = true;
			}
		});

		if (collision) {
			frameId = window.requestAnimationFrame(recalculate);
			return;
		}

		if (spaceship.bottom < 0) {
			$spaceship.css({
				left: spaceship.left,
				top: spaceship.top,
			});
			$('.success').removeClass('hidden');
			return;
		}

		if (spaceship.bottom > $(window).height() && ['bottom', 'bottom-left', 'bottom-right'].indexOf(direction) !== -1) {
			frameId = window.requestAnimationFrame(recalculate);
			return;
		}
		if (spaceship.left > $(window).width()) {
			spaceship.left = -spaceship.width;
		} else if (spaceship.left <= -spaceship.width) {
			spaceship.left = $(window).width();
		}

		// set new position
		$spaceship.css({
			left: spaceship.left,
			top: spaceship.top,
		});

		frameId = window.requestAnimationFrame(recalculate);
	}

	frameId = window.requestAnimationFrame(recalculate);

	function currentPosition($object) {
		var offset = $object.position();
		var left =  Math.round(offset.left);
		var top = Math.round(offset.top);
		var width = $object.width();
		var height = $object.height();

		return {
			top: top,
			left: left,
			width: width,
			height: height,
			right: left + $object.width(),
			bottom: top + $object.height()
		};
	}
});
