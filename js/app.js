let player;
let ground;
let air_ground;
let camera;
let goLeft;
let goRight;

class MainScene extends Phaser.Scene {
    constructor(){
        super('gameScene');
    }  

    preload(){
        this.load.image('background', './assets/BG/BG.png');
        this.load.image('ground', './assets/Tiles/ground.png');
        this.load.image('air_ground', './assets/Tiles/air_ground.png');
        this.load.image('player', './assets/sprites/penguin_jump3.png');
        this.load.spritesheet('jump', './assets/sprites/jump.png', {frameWidth: 64, frameHeight: 64});

        // loadFont('Snowtop Caps', './assets/fonts/Snowtop-Caps.ttf');
        // function loadFont(name, url) {
        //     var newFont = new FontFace(name, `url(${url})`);
        //     newFont.load().then(function (loaded) {
        //         document.fonts.add(loaded);
        //     }).catch(function (error) {
        //         return error;
        //     });
        // }
    }    
 
    create(){
        /* Env */
            this.add.image(256, 320, 'background').setScrollFactor(1, 0);
            ground = this.physics.add.image(256, 600, 'ground');
            ground.body.allowGravity = false;
            ground.setImmovable();

            air_ground = this.physics.add.staticGroup();
            // air_ground.create(256, 350, 'air_ground').setSize(100 ,20, true).setScale(.5); 
            // air_ground.create(0, 150, 'air_ground').setSize(100 ,20, true).setScale(.5); 
        /* -- */

        /* MOBILE CONTROLLLS */ 
            if (screen.width <= 900){
                /* x, y, alto, ancho */
                    let leftZone = this.add.zone(0, 0, (this.scale.width/2), this.scale.height);
                    leftZone.setOrigin(0);
                    leftZone.setScrollFactor(1, 0);
                    leftZone.setInteractive();

                    let rightZone = this.add.zone((this.scale.width/2), 0, (this.scale.width/2), this.scale.height);
                    rightZone.setOrigin(0);
                    rightZone.setScrollFactor(1, 0);
                    rightZone.setInteractive();
                /* --- */

                /* EVENTS */
                    leftZone.on('pointerdown', () => goLeft = true);
                    leftZone.on('pointerup', () => goLeft = false);
                    leftZone.on('pointerout', () => goLeft = false);

                    rightZone.on('pointerdown', () => goRight = true);
                    rightZone.on('pointerup', () => goRight = false);
                    rightZone.on('pointerout', () => goRight = false);
                /* --- */
            }
        /* --- */

        /* player */
            player = this.physics.add.sprite(256, 400, 'player');
            player.setSize(55, 60, false);

            //camera
            // this.cameras.main.setBounds(0, 0, 0, 0);
            // camera = this.cameras.main.startFollow(player, true);
            camera = this.cameras.main;
            camera.startFollow(player, true);
            camera.setLerp(0, 0.1);
            camera.setDeadzone(this.scale.width);
        /* --- */ 

        /* Collide */
            this.physics.add.collider(ground, player);
            this.physics.add.collider(air_ground, player);
            player.body.checkCollision.up = false
            player.body.checkCollision.left = false
            player.body.checkCollision.right = false
            // this.physics.add.overlap(player, air_ground, player_airground, null, this);
        /* --- */

        // then create 5 platforms from the group
        for (let i = 0; i < 3; ++i) { 
            const x = Phaser.Math.Between(64, 448)
            
            const y = 200 * i;
        
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = air_ground.create(x, y, 'air_ground')
            platform.scale = .5
        
            /** @type {Phaser.Physics.Arcade.StaticBody} */
            const body = platform.body
            body.updateFromGameObject()
        }

        /* animations */
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('jump', {start: 0, end: 2}),
            frameRate: 8,
            repeat: 0
        });

        /* --- */
    }

    update(){
        // Reutilizacion de platafomras
        air_ground.children.iterate(child => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = child
            const scrollY = this.cameras.main.scrollY
            // console.log(this.cameras.main.scrollY);
            if (platform.y >= scrollY + 650){
                platform.y = scrollY + Phaser.Math.Between(48, 50);
                platform.x = Phaser.Math.Between(64, 448);
                platform.body.updateFromGameObject();
            }
        })
        // 

        let scanner = this.input.keyboard.createCursorKeys();
        let velocityY = 500;
        let velocityX = 160;

        if (scanner.left.isDown || goLeft){
            player.setVelocityX(-velocityX);
            player.flipX = true;
        }else if (scanner.right.isDown || goRight){
            player.setVelocityX(velocityX);
            player.flipX = false;
        }else {
            player.setVelocityX(0);
        }

        if (player.body.touching.down){
            player.anims.play('jump', true);
            player.setVelocityY(-velocityY);
        }

        this.horizontalWrap(player);
    }

    horizontalWrap(sprite)
	{
		const halfWidth = sprite.displayWidth * 0.5
		const gameWidth = this.scale.width
		if (sprite.x < -halfWidth)
		{
			sprite.x = gameWidth + halfWidth
		}
		else if (sprite.x > gameWidth + halfWidth)
		{
			sprite.x = -halfWidth
		}
	}
}

// Configuracion general
const config = {
    // Phaser.AUTO, intenta usa WebGL y si el navegador no lo tiene, usa canva.
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 512,
    height: 640,
    scene: [MainScene],
    scale: {
        // mode: Phaser.Scale.FIT
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: { y: 550 }
        }
    }
}

// Inicializacion del objeto
game = new Phaser.Game(config)