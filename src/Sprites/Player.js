class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        // Keys
        this.left = scene.input.keyboard.addKey("A");
        this.right = scene.input.keyboard.addKey("D");
        // Movement variables
        this.defaultSpeed = 5;
        this.slowSpeed = 1;
        this.speed = this.defaultSpeed;
        this.moveDirection = 0;
        // Position variables
        this.leftBound = 20;
        this.rightBound = game.config.width - 20;
        // Systems
        this.boosterMalfunction = false;
        this.active = true;

        scene.add.existing(this);
        return this;
    }

    enable_booster_malfunction() {
        this.boosterMalfunction = true;
    }

    disable_booster_malfunction() {
        this.boosterMalfunction = false;
    }

    make_inactive() {
        this.visible = false;
        this.active = false;
    }

    update() {
        if (this.active) {
            // Detect input to change movement direction
            if (Phaser.Input.Keyboard.JustDown(this.left)) {
                this.speed = this.defaultSpeed;
                this.moveDirection = -1;
            }
            if (Phaser.Input.Keyboard.JustDown(this.right)) {
                this.speed = this.defaultSpeed;
                this.moveDirection = 1;
            }
            if (!this.boosterMalfunction) {
                if (Phaser.Input.Keyboard.JustUp(this.left) && this.moveDirection == -1) {
                    this.speed = this.slowSpeed;
                }
                if (Phaser.Input.Keyboard.JustUp(this.right) && this.moveDirection == 1) {
                    this.speed = this.slowSpeed;
                }
            }
            // Move ship within bounds
            this.x += this.speed * this.moveDirection;
            if (this.x < this.leftBound) { this.x = this.leftBound; }
            if (this.x > this.rightBound) { this.x = this.rightBound; }
        }
    }
}