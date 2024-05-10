class Meteor extends Phaser.GameObjects.PathFollower {
    constructor(scene, path, x, y, texture, frame) {
        super(scene, path, x, y, texture, frame);
        this.visible = false;
        this.active = false;

        this.setSpeed(10000);

        scene.add.existing(this);
        return this;
    }

    setSpeed(speed) {
        this.config = {
            from: 0,
            to: 1,
            delay: 0,
            duration: speed,
            ease: 'Sine.easeIn'
        };
    }

    makeActive() {
        this.x = this.path.points[0].x;
        this.y = this.path.points[0].y;
        this.startFollow(this.config);
        this.visible = true;
        this.active = true;
    }

    makeInactive() {
        this.stopFollow();
        this.visible = false;
        this.active = false;
    }

    update() {
        if (this.active == true) {
            this.rotation += 0.1;
            if (this.y >= game.config.height) {
                this.makeInactive();
            }
        }
    }
}