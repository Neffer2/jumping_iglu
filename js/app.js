let player;
let ground;
let air_ground;
let camera;
let goLeft;
let goRight;
let Score = 0;
let scoreText;
let begin_jump = false;

class MainScene extends Phaser.Scene {
    constructor(){
        super('gameScene');
    }  

    preload(){
        this.load.image('background', './assets/BG/BG.png');
        this.load.image('marco', './assets/BG/marco.png');
        this.load.image('ground', './assets/Tiles/ground.png');
        this.load.image('air_ground', './assets/Tiles/air_ground.png');
        this.load.image('player', './assets/sprites/penguin_walk01.png');
        this.load.spritesheet('jump', './assets/sprites/jump.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('walk', './assets/sprites/walk.png', {frameWidth: 59, frameHeight: 64});

        loadFont('Snowtop Caps', './assets/fonts/Snowtop-Caps.ttf');
        function loadFont(name, url) {
            var newFont = new FontFace(name, `url(${url})`);
            newFont.load().then(function (loaded) {
                document.fonts.add(loaded);
            }).catch(function (error) {
                return error;
            });
        }
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

        /* Score */
            scoreText = this.add.text(20 , 18, Score, { fontSize: 64, fontFamily: 'Snowtop Caps, "Goudy Bookletter 1911", Times, serif' }).setScrollFactor(1, 0);
        /* --- */

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

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('walk', {start: 0, end: 3}),
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
        let velocityX = 250;
        
        if (scanner.space.isDown){
            begin_jump = true;
        }

            if (scanner.left.isDown || goLeft){
                player.setVelocityX(-velocityX);
                player.flipX = true;
                if (!begin_jump){player.anims.play('walk', true);}
            }else if (scanner.right.isDown || goRight){
                player.setVelocityX(velocityX);
                player.flipX = false;
                if (!begin_jump){player.anims.play('walk', true);}
            }else {
                player.setVelocityX(0);
            }

        if (begin_jump){
            if (player.body.touching.down){
                player.anims.play('jump', true);
                player.setVelocityY(-velocityY);
            }
        }

        if (player.y < Score){
            Score = Math.trunc(player.y) ;
            scoreText.setText(Score * -1);
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

class Menu extends Phaser.Scene {
    constructor(){
        super('menuScene');
    }  

    preload(){
        this.load.image('background', './assets/BG/BG.png');
        this.load.image('menu-digital', './assets/BG/menu-digital.png');
        this.load.image('ground', './assets/Tiles/ground.png');
        this.load.image('air_ground', './assets/Tiles/air_ground.png');
        this.load.image('player', './assets/sprites/penguin_walk01.png');
        this.load.image('play_btn', './assets/Buttons/340-px/Play.png');
        this.load.spritesheet('jump', './assets/sprites/jump.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('walk', './assets/sprites/walk.png', {frameWidth: 59, frameHeight: 64});

        loadFont('Snowtop Caps', './assets/fonts/Snowtop-Caps.ttf');
        function loadFont(name, url) {
            var newFont = new FontFace(name, `url(${url})`);
            newFont.load().then(function (loaded) {
                document.fonts.add(loaded);
            }).catch(function (error) {
                return error;
            });
        }
    }    
 
    create(){
        this.add.image(256, 320, 'background').setScrollFactor(1, 0);
        // this.add.image(this.scale.width/2, this.scale.height/4, 'menu-digital').setScale(.4);

        let title = this.add.text(this.scale.width/9, this.scale.height/8, "Ice-Ice \n baby", { fontSize: 128, fill: "#ffffff", fontFamily: 'Snowtop Caps, "Goudy Bookletter 1911", Times, serif', align: "center"}).setScrollFactor(1, 0);
        let btn_play = this.add.image(this.scale.width/2, this.scale.height * .8, 'play_btn').setScale(.5).setScrollFactor(1, 0).setInteractive();
        
        btn_play.on('pointerover',function(pointer){
            btn_play.setScale(.6);
        });

        btn_play.on('pointerout',function(pointer){
            btn_play.setScale(.5);
        });

    }

    update(){
        
    }
}

// Configuracion general
const config = {
    // Phaser.AUTO, intenta usa WebGL y si el navegador no lo tiene, usa canva.
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 512,
    height: 640,
    backgroundColor: '#007EE9',
    scene: [Menu, MainScene],
    scale: {
        mode: Phaser.Scale.FIT
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