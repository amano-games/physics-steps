const opacityXS = 0.2;
const opacityS = 0.6;
const opacityM = 0.8;
const opacityL = 1.0;

export const opacity = {
  xs: opacityXS,
  s: opacityS,
  m: opacityM,
  l: opacityL,

  staticBodies: opacityS,
};

export const stroke = {
  opacity: 0.1,
  weight: 1,
};

const white = [255, 255, 255];
const fullBlack = [0, 0, 0];
const black = [65, 67, 69];
const yellow = [255, 242, 76];
const orange = [255, 119, 76];
const aqua = [71, 255, 196];
const carmin = [255, 71, 93];
const blue = [116, 164, 183];
const violet = [174, 80, 255];
const lila = [123, 130, 219];
const gray = [180, 180, 180];
const magenta = [255, 57, 244];
const green = [99, 169, 47];

export const text = {
  sizeS: 3,
  sizeM: 20,
  sizeL: 25,
};

export const colors = {
  black,
  yellow,
  orange,
  gray,
  aqua,
  carmin,
  blue,
  violet,
  lila,
  white,
  magenta,
  green,

  bg: [65, 65, 65],
  screen: white,
  screenBorder: fullBlack,
  text: fullBlack,

  cool: [44, 162, 95],
  warm01: [255, 255, 178],
  warm02: [254, 204, 92],
  warm03: [253, 141, 60],
  warm04: [227, 26, 28],

  infoBg: fullBlack,
  infoFg: white,

  timelineBg: fullBlack,
  timelineFg: white,

  info: black,
  staticBodies: gray,
  flippers: blue,
  penetration: black,
  ball: carmin,
  ballCollided: magenta,
  ghost: aqua,
  contact01: yellow,
  contact02: orange,
  tangent: yellow,
  velocity: carmin,
  angular: violet,
  collider: lila,

  flipperVel: green,
};
