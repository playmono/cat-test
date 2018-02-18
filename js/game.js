gameState = {
	attackTimer : 0,
	batfliesCreationTimer : 0,
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
	batflies : null,
	batfliesTimers: null,

	preload: function() {
		// Just to debug FPS
		this.game.time.advancedTiming = true;

		this.game.load.image('background', 'assets/castlebg.png');
		this.game.load.spritesheet('catknight', 'assets/knight.png', 100, 100);
		this.game.load.spritesheet('batfly', 'assets/batfly.png', 50, 50);
		this.game.load.spritesheet('batflypoof', 'assets/batpoof.png', 50, 50);
	},

	create: function() {
		// Workd Creation
		this.game.add.image(0, 0, 'background').scale.set(scaleFactor);

		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.physics.arcade.setBounds(0,0, gameWidth, 525);

		// Shadow creation
		this.catknight.shadowSprite = this.game.add.sprite(300, 308, 'catknight', 15);
		this.catknight.shadowSprite.scale.set(2.5);
		this.catknight.shadowSprite.smoothed = false;

		this.catknight.group = this.game.add.group();

 		// Sprite Knight Creation
		this.catknight.mainSprite = this.game.add.sprite(300, 300, 'catknight');
		this.catknight.mainSprite.scale.set(scaleFactor);
		this.catknight.mainSprite.anchor.x = 0.45;
		this.catknight.mainSprite.smoothed = false;
		this.catknight.direction = 'right';
		this.catknight.status = 'idle';

		this.catknight.group.add(this.catknight.mainSprite);

		// This gives "body" to catknight
		this.game.physics.arcade.enable([this.catknight.group]);

		this.catknight.mainSprite.body.setSize(40, 50, 25, 40);
		this.catknight.mainSprite.body.gravity.y = 2000;
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

		// Batflies creation
		this.batflies = this.game.add.group();
		this.game.time.events.repeat(Phaser.Timer.SECOND * 2, 10, this.createBatfly, this);
	},

	update: function() {
		this.updateActions();
		this.updateCatknightStatus();
		this.updateAnimations();
		this.updateCollisions();

		// Batflies movement
		this.batflies.forEach(this.updateBatfly, this, true);
	},

	render: function() {
		if (debug) {
			this.game.debug.text('FPS: ' + this.time.fps, gameWidth - 100, 50);
			this.game.debug.text('Batflies count: ' + this.batflies.children.length, gameWidth - 300, 100);
			this.game.debug.body(this.catknight.mainSprite);

			if (this.catknight.attackSprite != null) {
				this.game.debug.body(this.catknight.attackSprite);
			}

			_this = this;
			this.batflies.forEach(function(batfly) {
				_this.game.debug.body(batfly);
			})
		}
	},

	updateActions() {
		this.catknight.group.setAll('body.velocity.x', 0);

		if (this.catknight.status == 'attacking' && this.game.time.now >= this.attackTimer) {
			this.stopAttack();
		}

		if (this.controls.xKey.justPressed() && this.game.time.now > this.attackTimer) {
			this.startAttack();
		}

		if (this.controls.cursors.up.justPressed() && this.catknight.mainSprite.body.onFloor()) {
			this.catknight.mainSprite.body.velocity.y = -800;
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

		// Update Attack Hitbox Position
		if (this.game.time.now < this.attackTimer) {
			this.catknight.attackSprite.body.velocity.y = this.catknight.mainSprite.body.velocity.y;

			if (this.catknight.direction == 'right') {
				x = this.catknight.mainSprite.position.x + 50;
			} else {
				x = this.catknight.mainSprite.position.x - 130;
			}

			this.catknight.attackSprite.position.x = x;
		}

		// Shadow
		// @todo: hay un desfase de 120 pixeles respecto al catknight no sé por qué
		if (this.catknight.direction == 'right') {
			this.catknight.shadowSprite.position.x = this.catknight.mainSprite.position.x - 120;
		} else {
			this.catknight.shadowSprite.position.x = this.catknight.mainSprite.position.x + 120;
		}
	},

	updateCatknightStatus: function() {
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

	updateAnimations: function() {
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
	},

	startAttack: function() {
		this.attackTimer = this.game.time.now + 200;

		if (this.catknight.direction == 'right') {
			x = this.catknight.mainSprite.position.x + 50;
		} else {
			x = this.catknight.mainSprite.position.x - 130;
		}

		this.catknight.attackSprite = this.catknight.group.create(x, this.catknight.mainSprite.y + 60);
		this.game.physics.arcade.enable([this.catknight.attackSprite]);

		this.catknight.attackSprite.body.setSize(80, 170, 0, 0);
	},

	stopAttack: function() {
		this.catknight.attackSprite.destroy();
	},

	createBatfly: function() {
		var xPositions = [-150, 850];
		var yPositions = [50, 350];

		var batfly = this.batflies.create(
			xPositions[this.game.rnd.integerInRange(0, 1)],
			this.game.rnd.integerInRange(190, 210),
			'batfly'
		);

		batfly.scale.set(scaleFactor);
		batfly.smoothed = false;

		// Batfly Body
		this.game.physics.enable(batfly, Phaser.Physics.ARCADE);
		batfly.body.setSize(40, 30, 5, 10);

		velocityy = [100, -100];

		if (batfly.position.x > 0) {
			velocityx = -100;
		} else {
			velocityx = 100;
		}

		batfly.body.velocity.setTo(velocityx, velocityy[this.game.rnd.integerInRange(0, 1)]);
		//batfly.body.collideWorldBounds = true;
		batfly.body.bounce.set(0.8);

		// Batfly Animations
		batfly.animations.add('fly',  [0, 1, 2, 3, 4, 5], 10, true);
		batfly.animations.play('fly');
	},

	updateBatfly : function(batfly) {
		if (!batfly.body.collideWorldBounds && batfly.position.x > 0 && batfly.position.x < 640) {
			batfly.body.collideWorldBounds = true;
		}
	},

	updateCollisions: function() {
		this.game.physics.arcade.overlap(this.catknight.mainSprite, this.batflies, this.gameOver, null, this);
		this.game.physics.arcade.overlap(this.catknight.attackSprite, this.batflies, this.destroyBatfly, null, this);
	},

	gameOver : function(catknight, batfly) {
		this.game.state.start("menuState");
	},

	destroyBatfly : function(attackSprite, batfly) {
		batflyDead = this.game.add.sprite(batfly.position.x, batfly.position.y, 'batflypoof');
		batfly.destroy();

		batflyDead.scale.set(scaleFactor);
		batflyDead.animations.add('dead', [0, 1, 2, 3, 4, 5], 7);
		batflyDead.animations.play('dead');
		//batfly.destroy();
	}

}