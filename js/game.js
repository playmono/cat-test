gameState = {
	controls : {
		cursors : null,
		xKey : null
	},
	catknight : {
		group: null,
		mainSprite : null,
		attackSprite: null,
		shadowSprite: null,	
		direction : 'right',
		action: 'idle',
	},
	attackTimer: 0,

	preload: function() {
		// Just to debug FPS
		this.game.time.advancedTiming = true;

		this.game.load.image('background', 'assets/castlebg.png');
		this.game.load.spritesheet('catknight', 'assets/knight.png', 100, 100);
	},

	create: function() {
		// Workd Creation
		this.game.add.image(0, 0, 'background').scale.set(scaleFactor);

		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.physics.arcade.setBounds(0,0, gameWidth, 525);
		this.game.physics.arcade.gravity.y = 2000;

		this.catknight.group = this.game.add.group();

 		// Sprite Knight Creation
		this.catknight.mainSprite = this.game.add.sprite(300, 300, 'catknight');
		this.catknight.mainSprite.scale.set(scaleFactor);
		this.catknight.mainSprite.anchor.x = 0.45;
		this.catknight.mainSprite.smoothed = false;
		this.catknight.direction = 'right';
		this.catknight.status = 'idle';

		this.catknight.group.add(this.catknight.mainSprite);

		// Sprite Attack Creation
		// @todo

		// Shadow creation
		this.catknight.shadowSprite = this.game.add.sprite(180, 300, 'catknight', 15);
		this.catknight.shadowSprite.scale.set(scaleFactor);
		this.catknight.shadowSprite.smoothed = false;

		// This gives "body" to catknight
		this.game.physics.arcade.enable([this.catknight.group]);

		this.catknight.mainSprite.body.setSize(40, 50, 25, 40);
		this.catknight.mainSprite.body.collideWorldBounds = true;

		// Controls
		this.controls.cursors = this.game.input.keyboard.createCursorKeys();
		this.controls.xKey = this.game.input.keyboard.addKey(Phaser.Keyboard.X);

		// Adnimations
		this.catknight.mainSprite.animations.add('idle', [0, 1, 2, 3], 8, true);
		this.catknight.mainSprite.animations.add('run', [4, 5, 6, 7], 8, true);
		this.catknight.mainSprite.animations.add('attack', [8, 9, 10, 10, 10, 11, 11], 20);
		this.catknight.mainSprite.animations.add('jump_up', [12]);
		this.catknight.mainSprite.animations.add('jump_down', [13]);
		this.catknight.mainSprite.animations.add('hit', [14]);
	},

	update: function() {
		this.resolveActions();
		this.resolveCatknightStatus();
		this.resolveAnimations();
	},

	render: function() {
		if (debug) {
			this.game.debug.text('FPS: ' + this.time.fps, gameWidth - 100, 50);
			this.game.debug.text('Debug: ' + this.catknight.mainSprite.width + ' - ' + this.catknight.shadowSprite.width, gameWidth - 300, 100);
			this.game.debug.body(this.catknight.mainSprite);
			//this.game.debug(this.catknight.shadowSprite);
		}
	},

	resolveActions() {
		this.catknight.group.setAll('body.velocity.x', 0);

		if (this.controls.cursors.up.justPressed() && this.catknight.mainSprite.body.onFloor()) {
			this.catknight.mainSprite.body.velocity.y = -800;
		}

		if (this.controls.xKey.justPressed() && this.game.time.now > this.attackTimer) {
			this.attackTimer = this.game.time.now + 200;
		}

		if (this.controls.cursors.left.isDown) {
	    	if (this.catknight.direction == 'right') {
	    		this.catknight.mainSprite.scale.x *= -1;
	    		this.catknight.shadowSprite.scale.x *= -1;
			}

			this.catknight.group.setAll('body.velocity.x', -400);
			this.catknight.direction = 'left';
		}
		else if (this.controls.cursors.right.isDown) {
			if (this.catknight.direction == 'left') {
				this.catknight.mainSprite.scale.x *= -1;
	    		this.catknight.shadowSprite.scale.x *= -1;
			}

			this.catknight.group.setAll('body.velocity.x', 400);
			this.catknight.direction = 'right';
		}

		// Shadow
		// @todo: hay un desfase de 120 pixeles respecto al catknight no sé por qué
		if (this.catknight.direction == 'right') {
			this.catknight.shadowSprite.position.x = this.catknight.mainSprite.position.x - 120;
		} else {
			this.catknight.shadowSprite.position.x = this.catknight.mainSprite.position.x + 120;
		}

		if (this.catknight.mainSprite.body.velocity.y != 0) {
			this.catknight.shadowSprite.alpha = 1;
		} else {
			this.catknight.shadowSprite.alpha = 0;
		}
	},

	resolveCatknightStatus: function() {
		// Priority here is important: lower is greater

		if (this.catknight.mainSprite.body.onFloor()) {
			this.catknight.status = 'idle';
		}

		if (this.catknight.mainSprite.body.velocity.x != 0) {
			this.catknight.status = 'running';
		}

		if (this.catknight.mainSprite.body.velocity.y != 0) {
			this.catknight.status = 'jumping';
		}

		if (this.game.time.now < this.attackTimer) {
			this.catknight.status = 'attacking';
		}
	},

	resolveAnimations: function() {
		switch (this.catknight.status) {
			case 'attacking':
				this.catknight.mainSprite.animations.play('attack');
			break;

			case 'jumping':
				if (this.catknight.mainSprite.body.velocity.y < 0) {
					this.catknight.mainSprite.animations.play('jump_up');
				} else {
					this.catknight.mainSprite.animations.play('jump_down');
				}
			break;

			case 'running':
				this.catknight.mainSprite.animations.play('run');
			break;

			default:
				this.catknight.mainSprite.animations.play('idle');
			break;
		}
	}
}