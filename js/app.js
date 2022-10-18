let player;
let ground;
let air_ground;

class MainScene extends Phaser.Scene {
    constructor(){
        super('gameScene');
    }  

    preload(){
        this.load.image('ground', './assets/Tiles/ground.png');
        this.load.image('air_ground', './assets/Tiles/air_ground.png');
        this.load.image('player', './assets/sprites/penguin_walk01.png');

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
            ground = this.physics.add.image(256, 600, 'ground');
            ground.body.allowGravity = false;
            ground.setImmovable();

            air_ground = this.physics.add.staticGroup();
            // air_ground.create(256, 350, 'air_ground').setSize(100 ,20, true).setScale(.5); 
            // air_ground.create(0, 150, 'air_ground').setSize(100 ,20, true).setScale(.5); 
        /* -- */

        /* player */
            player = this.physics.add.sprite(256, 400, 'player');
            player.setSize(55, 60, false);

            //camera
            // this.cameras.main.setBounds(0, 0, 512, 0);
            this.cameras.main.startFollow(player, true);
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
    }

    update(){

        // 
        air_ground.children.iterate(child => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = child
            const scrollY = this.cameras.main.scrollY
            console.log(this.cameras.main.scrollY);
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

        if (scanner.left.isDown){
            player.setVelocityX(-velocityX);
        }else if (scanner.right.isDown){
            player.setVelocityX(velocityX);
        }else {
            player.setVelocityX(0);
        }

        if (player.body.touching.down){
            player.setVelocityY(-velocityY);
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