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
