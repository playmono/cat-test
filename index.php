<!doctype html> 
<html lang="en"> 
<head> 
	<meta charset="UTF-8" />
	<title>Cat Knight Test</title>
    <style type="text/css">
        canvas {
            margin: 10px auto 0px auto;
        }
    </style>
</head>
<body>

<script src="js/phaser.min.js"></script>
<script src="js/menu.js"></script>
<script src="js/game.js"></script>

<script>
(function() {
	<?php if (array_key_exists('d', $_GET)) { ?>
	debug = true;
	<?php } else { ?>
	debug = false;
	<?php } ?>

	scaleFactor = 2.5;
	gameWidth = 256 * scaleFactor;
	gameHeight = 256 * scaleFactor;

	var game = new Phaser.Game(gameWidth, gameWidth, Phaser.AUTO, '');
	game.state.add("menuState", menuState);
	game.state.add("mainState", gameState);

	if (debug) {
		game.state.start("mainState");
	} else {
		game.state.start("menuState");
	}
})();
</script>

</body>
</html>