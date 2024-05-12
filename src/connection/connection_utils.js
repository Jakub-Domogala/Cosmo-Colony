import * as PIXI from "pixi.js";

export function get_line_shape(this_connection) {
  const line = new PIXI.Graphics();
  line.moveTo(this_connection.width / 2, this_connection.distance / 2);

  line.lineTo(-this_connection.width / 2, this_connection.distance / 2);
  line.lineTo(-this_connection.width / 2, -this_connection.distance / 2);
  line.lineTo(this_connection.width / 2, -this_connection.distance / 2);
  line.lineTo(this_connection.width / 2, this_connection.distance / 2);

  line.closePath();
  line.fill(0xffffff);
  line.stroke({
    width: this_connection.width / 2,
    color: 0xffffff,
    alpha: 1,
    join: "round",
  });
  return line;
}

export function get_hit_area(this_connection) {
  return new PIXI.Polygon([
    this_connection.width / 2,
    this_connection.distance / 2,

    this_connection.width * 5,
    this_connection.distance / 4,

    this_connection.width * 5,
    -this_connection.distance / 4,

    this_connection.width / 2,
    -this_connection.distance / 2,

    -this_connection.width / 2,
    -this_connection.distance / 2,

    -this_connection.width * 5,
    -this_connection.distance / 4,

    -this_connection.width * 5,
    this_connection.distance / 4,

    -this_connection.width / 2,
    this_connection.distance / 2,
  ]);
}

export function get_hover_line_shape(this_connection) {
  const line = new PIXI.Graphics();
  line.moveTo(this_connection.width / 2, this_connection.distance / 2);

  line.lineTo(-this_connection.width / 2, this_connection.distance / 2);
  line.lineTo(-this_connection.width * 2, this_connection.distance / 4);
  line.lineTo(-this_connection.width * 2, -this_connection.distance / 4);
  line.lineTo(-this_connection.width / 2, -this_connection.distance / 2);

  line.lineTo(this_connection.width / 2, -this_connection.distance / 2);
  line.lineTo(this_connection.width * 2, -this_connection.distance / 4);
  line.lineTo(this_connection.width * 2, this_connection.distance / 4);
  line.lineTo(this_connection.width / 2, this_connection.distance / 2);

  line.closePath();
  line.fill(this_connection.color);
  line.stroke({
    width: 1,
    color: 0xffffff,
    alpha: 1,
    join: "round",
  });
  const cross_width = 10;
  const cross_size = 40;
  line.moveTo(cross_width, 0);
  line.lineTo(cross_width + cross_size, cross_size);
  line.lineTo(cross_width + cross_size, cross_size + cross_width);
  line.lineTo(cross_size, cross_size + cross_width);
  line.lineTo(0, cross_width);
  line.lineTo(-cross_size, cross_width + cross_size);
  line.lineTo(-cross_width - cross_size, cross_size + cross_width);
  line.lineTo(-cross_size - cross_width, cross_size);
  line.lineTo(-cross_width, 0);
  line.lineTo(-cross_size - cross_width, -cross_size);
  line.lineTo(-cross_size - cross_width, -cross_size - cross_width);
  line.lineTo(-cross_size, -cross_size - cross_width);
  line.lineTo(0, -cross_width);
  line.lineTo(cross_size, -cross_width - cross_size);
  line.lineTo(cross_width + cross_size, -cross_size - cross_width);
  line.lineTo(cross_size + cross_width, -cross_size);
  line.lineTo(cross_width, 0);

  line.closePath();
  line.fill(0xff0000);
  return line;
}
