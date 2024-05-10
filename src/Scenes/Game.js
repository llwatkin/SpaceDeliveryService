class Game extends Phaser.Scene {
    constructor() {
        super("gameScene");

        this.gameActive = true;
        this.gameOver = false;

        // Create variables to hold constant values for sprite locations
        this.miniX = 20;
        this.miniGoalY = 50;
        this.midX = game.config.width / 2;
        this.midY = game.config.height / 2;
        this.playerY = game.config.height - 50;
        this.systemY = this.playerY + 35;

        // Laser variables
        this.defaultCooldown = 10;
        this.longCooldown = 40;
        this.laserCooldown = this.defaultCooldown;
        this.laserCooldownCounter = 0;

        // Systems
        this.systemsUp = 2;
        this.laserMalfunction = false;

        // Meteor/wave variables
        this.wave = 0;
        this.waveLength = 500; // Increases with each wave
        this.waveBreak = 100; // Break in bewteen waves
        this.waveLengthCounter = this.waveLength;
        this.meteorCooldown = 20;
        this.meteorCooldownCounter = this.waveBreak;
        this.largeMeteorChance = 0; // Percentage chance increases with each wave
        this.maxMeteors = 2; // Amount of meteors increases with each wave
        this.activeMeteors = 0;
        this.curves = [
            new Phaser.Curves.Spline([0, -50, 400, 700]),
            new Phaser.Curves.Spline([0, -50, 300, 700]),
            new Phaser.Curves.Spline([0, -50, 200, 700]),
            new Phaser.Curves.Spline([200, -50, 400, 700]),
            new Phaser.Curves.Spline([200, -50, 300, 700]),
            new Phaser.Curves.Spline([200, -50, 0, 700]),
            new Phaser.Curves.Spline([400, -50, 300, 700]),
            new Phaser.Curves.Spline([400, -50, 200, 700]),
            new Phaser.Curves.Spline([400, -50, 0, 700])
        ];

        // Score
        this.deliveries = 0;

        // Planet keys
        this.planetKeys = [
            "planet00", "planet01", "planet02", 
            "planet03", "planet04", "planet05", 
            "planet06", "planet07", "planet08",
            "planet09"
        ];

        this.collisionPadding = 25;
    }

    game_init() {
        // Reset variables to default values
        this.gameActive = true;
        this.gameOver = false;
        this.wave = 0;
        this.waveLength = 500;
        this.waveLengthCounter = this.waveLength;
        this.meteorCooldownCounter = this.waveBreak;
        this.largeMeteorChance = 0;
        this.maxMeteors = 2;
        this.deliveries = 0;
        this.laserCooldown = this.defaultCooldown;
        this.laserCooldownCounter = 0;
        this.laserMalfunction = false;
        this.systemsUp = 2;
    }

    create() {
        this.game_init();

        // Stars
        my.sprite.stars = new Stars(this, this.midX, this.midY, game.config.width, game.config.height, "stars");
        // Planet
        let randomIndex = Math.floor(Math.random() * this.planetKeys.length);
        my.sprite.planet = this.add.sprite(this.midX, this.playerY, this.planetKeys[randomIndex]).setScale(0.4);

        // Player
        my.sprite.player = new Player(this, this.midX, this.playerY, "ship");
        // System icons
        my.sprite.system1 = this.add.sprite(my.sprite.player.x - 10, this.systemY, "diamondGreen");
        my.sprite.system2 = this.add.sprite(my.sprite.player.x + 10, this.systemY, "diamondGreen");

        // Keys
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey = this.input.keyboard.addKey("R");
        this.cKey = this.input.keyboard.addKey("C");

        // Lasers
        my.sprite.laserGroup = this.add.group({
            active: true,
            defaultKey: "laser",
            maxSize: 10,
            runChildUpdate: true
        });
        my.sprite.laserGroup.createMultiple({
            classType: Laser,
            active: false,
            key: my.sprite.laserGroup.defaultKey,
            setScale: { x: 0.1, y: 1 },
            setXY: { x: 0, y: -50 },
            repeat: my.sprite.laserGroup.maxSize-1
        });

        // Meteors & pieces
        my.sprite.meteorGroup = this.add.group({
            active: true,
            defaultKey: "meteor_small",
            maxSize: 20, // Create 20 meteors, small by default
            runChildUpdate: true
        });
        my.sprite.meteorGroup.createMultiple({
            classType: Meteor,
            active: false,
            key: my.sprite.meteorGroup.defaultKey,
            setXY: { x: 0, y: -50},
            repeat: my.sprite.meteorGroup.maxSize-1
        });
        my.sprite.piecesGroup = this.add.group({
            active: true,
            defaultKey: "diamond",
            maxSize: 60,
            runChildUpdate: true
        });
        my.sprite.piecesGroup.createMultiple({
            classType: MeteorPiece,
            active: false,
            key: my.sprite.piecesGroup.defaultKey,
            setXY: { x: 0, y: -50 },
            repeat: my.sprite.piecesGroup.maxSize-1
        })

        // Text
        this.scoreText = this.add.bitmapText(this.midX, 20, "rocketSquare", "Deliveries: " + this.deliveries, 20).setOrigin(0.5).setCenterAlign();
        this.lasersText = this.add.bitmapText(this.midX, 150, "rocketSquareRed", "WARNING:\nMalfunctioning Lasers", 16).setOrigin(0.5).setCenterAlign();
        this.lasersText.visible = false;
        this.boostersText = this.add.bitmapText(this.midX, 100, "rocketSquareRed", "WARNING:\nMalfunctioning Boosters", 16).setOrigin(0.5).setCenterAlign();
        this.boostersText.visible = false;
        this.gameOverText = this.add.bitmapText(this.midX, 150, "rocketSquare", "Game Over").setOrigin(0.5).setCenterAlign();
        this.gameOverText.visible = false;
        this.winText = this.add.bitmapText(this.midX, 150, "rocketSquare", "Delivery\nCompleted!").setOrigin(0.5).setCenterAlign();
        this.winText.visible = false;
        this.restartText = this.add.bitmapText(this.midX, 280, "rocketSquareRed", "Restart? [R]", 20).setOrigin(0.5).setCenterAlign();
        this.restartText.visible = false;
        this.continueText = this.add.bitmapText(this.midX, 320, "rocketSquareGreen", "Continue? [C]", 20).setOrigin(0.5).setCenterAlign();
        this.continueText.visible = false;

        // Minimap
        my.sprite.startMiniPlanet = this.add.sprite(this.miniX, this.playerY, my.sprite.planet.texture.key).setScale(0.025);
        randomIndex = Math.floor(Math.random() * this.planetKeys.length);
        my.sprite.endMiniPlanet = this.add.sprite(this.miniX, this.miniGoalY, this.planetKeys[randomIndex]).setScale(0.025);
        my.sprite.miniPlayer = this.add.sprite(this.miniX, this.playerY, "ship").setScale(0.5);

        // Sounds
        this.boosterSound = this.sound.add("boosterMalfunction").setLoop(true);
        this.laserSound = this.sound.add("laserMalfunction").setLoop(true);
    }

    update() {
        // ------ Aliases for readability ------ //
        let stars = my.sprite.stars;
        let planet = my.sprite.planet;
        let player = my.sprite.player;
        let miniPlayer = my.sprite.miniPlayer;
        let startMiniPlanet = my.sprite.startMiniPlanet;
        let endMiniPlanet = my.sprite.endMiniPlanet;
        let laserGroup = my.sprite.laserGroup;
        let meteorGroup = my.sprite.meteorGroup;
        let piecesGroup = my.sprite.piecesGroup;
        let system1 = my.sprite.system1;
        let system2 = my.sprite.system2;
        // ------------------------------------ //

        if (this.gameActive) {
            // Handle laser firing
            this.laserCooldownCounter--; // Countdown laser firing cooldown every frame
            if (this.laserCooldownCounter < 0 && Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
                let laser = laserGroup.getFirstDead();
                if (laser != null) {
                    this.sound.play("fire", { volume: 0.5 });
                    this.laserCooldownCounter = this.laserCooldown; // Reset cooldown
                    if (this.laserMalfunction) { 
                        let randomCooldown = Math.floor(Math.random() * this.longCooldown) + this.defaultCooldown;
                        this.laserCooldownCounter = randomCooldown;
                    }
                    laser.makeActive();
                    laser.x = player.x;
                    laser.y = player.y;
                }
            }
            
            // Check if lasers collide with any meteors or pieces
            for (let laser of laserGroup.getChildren()) {
                for (let meteor of meteorGroup.getChildren()) {
                    if (laser.active && meteor.active) {
                        if (this.collides(laser, meteor)) {
                            this.sound.play("explosion");
                            laser.makeInactive();
                            meteor.makeInactive();

                            // Spawn pieces
                            let pieces = 2;
                            if (meteor.texture.key == "meteor_large") { pieces++; } // One extra piece if large 
                            let xTrajectory = -1;
                            for (let i = 0; i < pieces; i++) {
                                let piece = piecesGroup.getFirstDead();
                                if (piece != null) {
                                    piece.setTrajectory([xTrajectory, 1 + i]);
                                }
                                piece.setPosition(meteor.x, meteor.y);
                                piece.makeActive();
                                xTrajectory*=-1;
                            }
                        }
                    }
                }
                for (let piece of piecesGroup.getChildren()) {
                    if (laser.active && piece.active) {
                        if (this.collides(laser, piece)) {
                            laser.makeInactive();
                            piece.makeInactive();
                        }
                    }
                }
            }

            // Check if any meteors collide with the player
            for (let meteor of meteorGroup.getChildren()) {
                if (meteor.active) {
                    if (this.collides(meteor, player)) {
                        meteor.makeInactive();
                        this.player_hit();
                    }
                }
            }

            // Check if any meteor pieces collide with the player
            for (let piece of piecesGroup.getChildren()) {
                if (piece.active) {
                    if (this.collides(piece, player)) {
                        piece.makeInactive();
                        this.player_hit();
                    }
                }
            }

            // Run update functions
            player.update();
            stars.update();

            // Set system icon positions
            system1.x = player.x - 10;
            system2.x = player.x + 10;

            // Increment mini player position
            if (miniPlayer.y > this.miniGoalY) {
                miniPlayer.y -= 0.2; // 5,000 units between planets
                if (planet.y > game.config.height + 200) {
                    // Traveled 250 units (550 to 800)
                    // Must travel 4,750 more (-4200 to 550)
                    planet.y = -4200;
                    planet.setTexture(endMiniPlanet.texture.key);
                }
            } else {
                this.gameActive = false; // Pause game
                this.boosterSound.stop();
                this.laserSound.stop();
                this.sound.play("computerNoise");
                // Reset systems
                this.boostersText.visible = false;
                this.lasersText.visible = false;
                system1.setTexture("diamondGreen");
                system2.setTexture("diamondGreen");
                this.systemsUp = 2;
                // Display text
                this.winText.visible = true;
                this.restartText.visible = true;
                this.continueText.visible = true;
                this.deliveries++;
                this.scoreText.setText("Deliveries: " + this.deliveries);
            }

            // Increment planet position
            planet.y += 2;

            // ------ Wave and meteor handling ------ //
            this.meteorCooldownCounter--; // Countdown meteor cooldown every frame
            this.activeMeteors = meteorGroup.countActive();
            this.waveLengthCounter--; // Countdown wave length every frame
            // Spawn a meteor if possible
            if (miniPlayer.y > 150 && this.waveLengthCounter > 0 && this.meteorCooldownCounter < 0 && this.activeMeteors < this.maxMeteors) {
                let meteor = meteorGroup.getFirstDead();
                if (meteor != null) {
                    console.log("meteor spawned");
                    this.meteorCooldownCounter = this.meteorCooldown; // Reset cooldown
                    // Give random curve
                    let randomIndex = Math.floor(Math.random() * this.curves.length);
                    let curve = this.curves[randomIndex];
                    meteor.setPath(curve);
                    // Set meteor type based on chance
                    let chance = Math.floor(Math.random() * 100);
                    if (chance > this.largeMeteorChance) {
                        meteor.setTexture("meteor_small");
                    } else {
                        meteor.setSpeed(15000);
                        meteor.setTexture("meteor_large");
                    }
                    meteor.makeActive();
                }
            }
            // If wave is over: increment wave, increase max meteors, increase wave length
            if (this.waveLengthCounter < 0 && this.activeMeteors == 0) {
                console.log("wave over");
                this.meteorCooldownCounter = this.waveBreak;
                this.wave++;
                this.maxMeteors++;
                this.waveLength += 30;
                if (this.largeMeteorChance < 90) { this.largeMeteorChance += 5; }
                this.waveLengthCounter = this.waveLength;
            }
            // ----------------------------------------- //
        } else {
            if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
                this.scene.start("titleScene");
                this.sound.play("bloop");
            }
            if (Phaser.Input.Keyboard.JustDown(this.cKey) && !this.gameOver) {
                // Update mini map
                miniPlayer.y = this.playerY;
                startMiniPlanet.setTexture(planet.texture.key);
                let randomIndex = Math.floor(Math.random() * this.planetKeys.length);
                endMiniPlanet.setTexture(this.planetKeys[randomIndex]);

                // Reset text and start game
                this.winText.visible = false;
                this.restartText.visible = false;
                this.continueText.visible = false;

                // Reset systems and start game
                this.laserMalfunction = false;
                player.disable_booster_malfunction();
                this.gameActive = true;
            }
        }
    }

    player_hit() {
        let player = my.sprite.player;
        let system1 = my.sprite.system1;
        let system2 = my.sprite.system2;

        this.sound.play("error");
        this.sound.play("explosion");

        if (this.systemsUp > 0) {
            this.systemsUp--;
            if (this.systemsUp == 1) {
                player.enable_booster_malfunction();
                this.boostersText.visible = true;
                system2.setTexture("diamondRed");
                this.boosterSound.play({ volume: 0.05 });
            } else {
                this.laserMalfunction = true;
                this.lasersText.visible = true;
                system1.setTexture("diamondRed");
                this.laserSound.play({ volume: 0.05 });
            }
        } else {
            // TODO: Game over
            this.gameOver = true;
            this.gameActive = false;
            this.boosterSound.stop();
            this.laserSound.stop();
            this.sound.play("computerNoise");
            player.make_inactive();
            system1.visible = false;
            system2.visible = false;
            this.lasersText.visible = false;
            this.boostersText.visible = false;
            this.gameOverText.visible = true;
            this.restartText.visible = true;
        }
    }

    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > ((a.displayWidth/2 + b.displayWidth/2) - this.collisionPadding)) return false;
        if (Math.abs(a.y - b.y) > ((a.displayHeight/2 + b.displayHeight/2) - this.collisionPadding)) return false;
        return true;
    }
}