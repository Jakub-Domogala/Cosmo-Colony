import * as PIXI from "pixi.js";
import { COLOR_INDICATOR_NEUTRAL } from "./settings.js";

export default class Pointer {
  constructor(app) {
    this.app = app;
    this.sprite = null;
    this.isActive = false;
    this.speed = 20;
    this.startPosition = { x: 0, y: 0 };
    this.targetPosition = { x: 0, y: 0 };
    this.currentPosition = { x: 0, y: 0 };
    this.color = COLOR_INDICATOR_NEUTRAL;
    this.init();
  }

  init() {
    this.sprite = new PIXI.Graphics();
    this.sprite.hitArea = new PIXI.Circle(0, 0, 0); // disable hit area
    this.app.stage.addChild(this.sprite);
  }

  setPointerPosition(
    positionA,
    positionB,
    dt,
    color = COLOR_INDICATOR_NEUTRAL,
  ) {
    if (!this.isActive) {
      this.isActive = true;
      this.currentPosition = positionA;
    }
    this.color = color;
    this.startPosition = positionA;
    this.targetPosition = positionB;
  }

  update(dt) {
    if (!this.isActive) {
      this.sprite.clear();
      return;
    }
    const endX = this.calc_position(
      this.currentPosition.x,
      this.targetPosition.x,
      dt,
    );
    const endY = this.calc_position(
      this.currentPosition.y,
      this.targetPosition.y,
      dt,
    );
    this.sprite.clear();
    this.sprite.moveTo(this.startPosition.x, this.startPosition.y);
    this.sprite.lineTo(endX, endY);
    this.sprite.fill();
    this.sprite.stroke({ width: 2, color: this.color });
    this.currentPosition = { x: endX, y: endY };
  }

  calc_position(position, target, dt) {
    return position + (target - position) * (1.0 - Math.exp(-this.speed * dt));
    // return target;
  }
}
