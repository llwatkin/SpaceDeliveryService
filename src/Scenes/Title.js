class Title extends Phaser.Scene {
    constructor() {
        super("titleScene");

        // Create variables to hold constant values for sprite locations
        this.midX = game.config.width / 2;
        this.midY = game.config.height / 2;
        this.playerY = game.config.height - 50;
        this.leftBound = 20;
        this.rightBound = game.config.width - 20;

        // Laser
        this.laserCooldownCounter = 0;
        this.laserCooldown = 10;
    }

    preload() {
        // ------- Preload all assets ------- //
        // Sprites
        this.load.setPath("./assets/");
        this.load.image("stars", "stars.png");
        this.load.image("ship", "ship.png");
        this.load.image("laser", "laser.png");
        this.load.image("diamond","diamond.png");
        this.load.image("diamondGreen", "diamondGreen.png");
        this.load.image("diamondRed", "diamondRed.png");
        this.load.image("meteor_large", "meteor_large.png");
        this.load.image("meteor_small", "meteor_small.png");
        this.load.image("planet00", "planet00.png");
        this.load.image("planet01", "planet01.png");
        this.load.image("planet02", "planet02.png");
        this.load.image("planet03", "planet03.png");
        this.load.image("planet04", "planet04.png");
        this.load.image("planet05", "planet05.png");
        this.load.image("planet06", "planet06.png");
        this.load.image("planet07", "planet07.png");
        this.load.image("planet08", "planet08.png");
        this.load.image("planet09", "planet09.png");
        // Fonts
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_Transparent.png", "KennyRocketSquare.fnt");
        this.load.bitmapFont("rocketSquareRed", "KennyRocketSquare_Red.png", "KennyRocketSquare.fnt");
        this.load.bitmapFont("rocketSquareGreen", "KennyRocketSquare_Green.png", "KennyRocketSquare.fnt");
        // Audio
        this.load.setPath("./assets/audio/");
        this.load.audio("mainTrack", "VacuumDrifting.wav");
        this.load.audio("error", "error.ogg");
        this.load.audio("bloop", "bloop.ogg");
        this.load.audio("fire", "fire.ogg");
        this.load.audio("explosion", "explosion.ogg");
        this.load.audio("computerNoise", "computerNoise.ogg");
        this.load.audio("laserMalfunction", "laserMalfunction.ogg");
        this.load.audio("boosterMalfunction", "boosterMalfunction.ogg");
        // ----------------------------------- //
    }
    
    create() {
        if (!mainTrack) {
            mainTrack = this.sound.add("mainTrack", { loop: true });
        }
        mainTrack.stop();
        mainTrack.play();

        // Stars
        my.sprite.stars = new Stars(this, this.midX, this.midY, game.config.width, game.config.height, "stars");

        // Game title
        this.add.bitmapText(this.midX, 100, "rocketSquare", "Space Delivery\nService").setOrigin(0.5).setCenterAlign();
        // Instructions
        this.add.bitmapText(this.midX, 300, "rocketSquareGreen", "Press [S] to Start", 20).setOrigin(0.5).setCenterAlign();
        this.leftInstruction = this.add.bitmapText(this.midX - 75, this.playerY, "rocketSquareRed", "[A] <--", 20).setOrigin(0.5).setCenterAlign();
        this.rightInstruction = this.add.bitmapText(this.midX + 75, this.playerY, "rocketSquareRed", "--> [D]", 20).setOrigin(0.5).setCenterAlign();
        this.fireInstruction = this.add.bitmapText(this.midX, this.playerY - 50, "rocketSquareRed", "Fire [SPACE]", 20).setOrigin(0.5).setCenterAlign();
        
        // Demo player
        my.sprite.demoPlayer = new Player(this, this.midX, this.playerY, "ship");

        // Keys
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.sKey = this.input.keyboard.addKey("S");

        // Lasers
        my.sprite.demoLaserGroup = this.add.group({
            active: true,
            defaultKey: "laser",
            maxSize: 10,
            runChildUpdate: true
        });
        my.sprite.demoLaserGroup.createMultiple({
            classType: Laser,
            active: false,
            key: my.sprite.demoLaserGroup.defaultKey,
            setScale: { x: 0.1, y: 1 },
            setXY: { x: 0, y: -50 },
            repeat: my.sprite.demoLaserGroup.maxSize-1
        });
    }

    update() {
        let demoPlayer = my.sprite.demoPlayer;
        let demoLaserGroup = my.sprite.demoLaserGroup;

        // On S press, start game
        if (Phaser.Input.Keyboard.JustDown(this.sKey)) {
            this.scene.start("gameScene");
            this.sound.play("bloop");
        }

        // Handle laser firing
        this.laserCooldownCounter--; // Countdown laser firing cooldown every frame
        if (this.laserCooldownCounter < 0 && Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            let laser = demoLaserGroup.getFirstDead();
            if (laser != null) {
                this.sound.play("fire", { volume: 0.5 });
                this.laserCooldownCounter = this.laserCooldown; // Reset cooldown
                laser.makeActive();
                laser.x = demoPlayer.x;
                laser.y = demoPlayer.y;
            }
        }

        my.sprite.demoPlayer.update();
        my.sprite.stars.update(); // Scrolling stars

        this.leftInstruction.setX(demoPlayer.x - 75);
        this.rightInstruction.setX(demoPlayer.x + 75);
        this.fireInstruction.setX(demoPlayer.x);
    }
}