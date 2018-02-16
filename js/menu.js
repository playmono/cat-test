menuState = {
	catknight : null,
	xToPlay : null,

	preload: function() {
		this.game.load.spritesheet('catknight', 'assets/knight.png', 100, 100);
	},

	create : function() {
		this.game.add.text(120, 100, "Cat VS Bats&Rats", {fill: "white", fontSize: 50});

		this.catknight = this.game.add.sprite(220, 170, 'catknight');
		this.catknight.scale.set(scaleFactor);

		this.game.add.text(150, 500, "Press X to Play", {fill: "white", fontSize: 50});

		this.xToPlay = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
	},

	update : function() {
		if (this.xToPlay.justPressed()) {
			this.game.state.start("mainState");
		}
	}
}