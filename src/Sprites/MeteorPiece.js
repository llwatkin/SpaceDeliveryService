class MeteorPiece extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, trajectory) {
        super(scene, x, y, texture, frame);
        this.visible = false;
        this.active = false;

        this.speed = 2; // Default speed
        this.trajectory = trajectory;

        scene.add.existing(this);
        return this;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    setTrajectory(trajectory) {
        this.trajectory = trajectory;
    }

    makeActive() {
        this.visible = true;
        this.active = true;
    }

    makeInactive() {
        this.visible = false;
        this.active = false;
    }

    update() {
        if (this.active == true) {
            this.rotation += 0.1;
            if (this.y >= game.config.height || this.x < 0 || this.x > game.config.width) {
                this.makeInactive();
            }
            this.x += this.trajectory[0] * this.speed;
            this.y += this.trajectory[1] * this.speed;
        }
    }
}