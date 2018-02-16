scaleFactor = 2.5;
gameWidth = 256 * scaleFactor;
gameHeight = 256 * scaleFactor;

var game = new Phaser.Game(gameWidth, gameWidth, Phaser.AUTO, '', {
	cursors : null,
	catknightDirection : 'right',
	catknightStatus : 'idle',
	catknight : null,
	attackKey: null,
	attackTimer: 0,

	preload: function() {
		// Just to debug FPS
		this.game.time.advancedTiming = true;

		this.game.load.image('background', 'assets/castlebg.png');
		this.game.load.spritesheet('catknight', 'assets/knight.png', 100, 100);
	},

	create: function() {
		background = this.game.add.image(0, 0, 'background')
			.scale.set(scaleFactor);

		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.physics.arcade.setBounds(0,0, gameWidth, 545);
		this.game.physics.arcade.gravity.y = 2000;

		this.catknight = this.game.add.sprite(300, 295, 'catknight');
		this.catknight.scale.set(scaleFactor);
		this.catknight.anchor.x = 0.45;
		this.catknightDirection = 'right';
		this.catknightStatus = 'idle';
		this.catknight.smoothed = false;

		// This gives "body" to catknight
		this.game.physics.arcade.enable([this.catknight]);

		//this.catknight.body.width = 160;
		//this.catknight.body.position.x = 160;
		//this.catknight.body.height = 500;
		//this.catknight.body.height = 100;

		this.catknight.body.collideWorldBounds = true;

		this.cursors = this.game.input.keyboard.createCursorKeys();
		this.attackKey = this.game.input.keyboard.addKey(Phaser.Keyboard.X);

		// Adnimations
		this.catknight.animations.add('idle', [0, 1, 2, 3], 8, true);
		this.catknight.animations.add('run', [4, 5, 6, 7], 8, true);
		this.catknight.animations.add('attack', [8, 9, 10, 10, 10, 11, 11], 20);
		this.catknight.animations.add('jump_up', [12]);
		this.catknight.animations.add('jump_down', [13]);
		this.catknight.animations.add('hit', [14]);
	},

	update: function() {
		this.catknight.body.velocity.x = 0;

		if (this.catknight.body.onFloor()) {
			this.catknightStatus = 'idle';
		}

		if (this.catknight.body.velocity.y != 0) {
			this.catknightStatus = 'jumping';
		}

		if (this.cursors.up.isDown && this.catknight.body.onFloor()) {
			this.catknight.body.velocity.y = -800;

			this.catknightStatus = 'jumping';
		}

		if (this.cursors.left.isDown)
	    {
	    	if (this.catknightDirection == 'right') {
				this.catknight.scale.x *=-1;
			}

			if (this.catknightStatus == 'idle') {
				this.catknightStatus = 'running';
			}

			this.catknight.body.velocity.x = -400;

			this.catknightDirection = 'left';
		}
		else if (this.cursors.right.isDown)
		{
			if (this.catknightDirection == 'left') {
				this.catknight.scale.x *=-1;
			}

			if (this.catknightStatus == 'idle') {
				this.catknightStatus = 'running';
			}

			this.catknight.body.velocity.x = 400;

			this.catknightDirection = 'right';
		}

		if (this.attackKey.justPressed() && this.game.time.now > this.attackTimer) {
			this.attackTimer = this.game.time.now + 200;
		}

		if (this.game.time.now < this.attackTimer) {
			this.catknightStatus = 'attacking';
		}

		this.resolveAnimations();
	},

	render: function() {
		this.game.debug.text('FPS: ' + this.time.fps, gameWidth - 100, 50);
		this.game.debug.text('Debug: ' + this.catknightDirection + ' - ' + this.catknightStatus, gameWidth - 300, 100);
		this.game.debug.body(this.catknight);
	},

	resolveAnimations: function() {
		if (this.catknightStatus == 'attacking') {
			this.catknight.animations.play('attack');
			return;
		}

		if (this.catknightStatus == 'jumping') {
			if (this.catknight.body.velocity.y < 0) {
				this.catknight.animations.play('jump_up');
			} else {
				this.catknight.animations.play('jump_down');
			}

			return;
		}

		if (this.catknightStatus == 'running') {
			this.catknight.animations.play('run');

			return;
		}

		this.catknight.animations.play('idle');
	}
});