class Stars extends Phaser.GameObjects.TileSprite {
    constructor(scene, x, y, width, height, texture, frame) {
        super(scene, x, y, width, height, texture, frame);
        this.speed = 1;

        scene.add.existing(this);
        return this;
    }

    update() {
        this.tilePositionY -= this.speed;
    }
}