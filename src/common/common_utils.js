export function darkenColor(color, factor) {
  let red = (color >> 16) & 0xff;
  let green = (color >> 8) & 0xff;
  let blue = color & 0xff;

  red = Math.floor(red * factor);
  green = Math.floor(green * factor);
  blue = Math.floor(blue * factor);

  red = Math.min(Math.max(0, red), 255);
  green = Math.min(Math.max(0, green), 255);
  blue = Math.min(Math.max(0, blue), 255);

  let darkenedColor =
    "#" +
    ((1 << 24) + (red << 16) + (green << 8) + blue)
      .toString(16)
      .slice(1)
      .padStart(6, "0"); // padStart ensures each component has at least two digits
  return darkenedColor;
}

export function calc_gradiental_change_float(current, target, dt, speed = 20) {
  return current + (target - current) * (1.0 - Math.exp(-speed * dt));
}

export function calc_gradiental_change_color(current, target, dt, speed = 20) {
  let red = (current >> 16) & 0xff;
  let green = (current >> 8) & 0xff;
  let blue = current & 0xff;

  let target_red = (target >> 16) & 0xff;
  let target_green = (target >> 8) & 0xff;
  let target_blue = target & 0xff;

  red = Math.floor(calc_gradiental_change_float(red, target_red, dt, speed));
  green = Math.floor(
    calc_gradiental_change_float(green, target_green, dt, speed),
  );
  blue = Math.floor(calc_gradiental_change_float(blue, target_blue, dt, speed));

  red = Math.min(Math.max(0, red), 255);
  green = Math.min(Math.max(0, green), 255);
  blue = Math.min(Math.max(0, blue), 255);

  let newColor =
    "#" +
    ((1 << 24) + (red << 16) + (green << 8) + blue)
      .toString(16)
      .slice(1)
      .padStart(6, "0"); // padStart ensures each component has at least two digits
  return newColor;
}

export function distance(positionA, positionB) {
  return Math.sqrt(
    (positionB.x - positionA.x) ** 2 + (positionB.y - positionA.y) ** 2,
  );
}
