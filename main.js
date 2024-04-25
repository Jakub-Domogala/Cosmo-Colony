// import * as PIXI from "pixi.js";
import { Application, Assets } from "pixi.js";
import Planet from "./src/planet.js";
import StarSystem from "./src/star_system.js";
import Spaceship from "./src/spaceship.js";

// import json file named sys1.json
import sys1 from "./resource/solar_systems/sys1.json";
import circle_img from "./resource/img/circle.svg";

//import Victor from "victor";
//import Matter from "matter-js";

(async () => {
  // // Create a new application
  // const app = new Application();
  // // Initialize the application
  // await app.init({ background: "#1099bb", resizeTo: window });
  // // Append the application canvas to the document body
  // document.body.appendChild(app.canvas);
  // // Load the bunny texture
  // const texture = await Assets.load("https://pixijs.com/assets/bunny.png");
  // // Create a bunny Sprite
  // const bunny = new Sprite(texture);
  // // Center the sprite's anchor point
  // bunny.anchor.set(0.5);
  // // Move the sprite to the center of the screen
  // bunny.x = app.screen.width / 2;
  // bunny.y = app.screen.height / 2;
  // app.stage.addChild(bunny);
  // // Listen for animate update
  // app.ticker.add((time) => {
  //   // Just for fun, let's rotate mr rabbit a little.
  //   // * Delta is 1 if running at 100% performance *
  //   // * Creates frame-independent transformation *
  //   bunny.rotation += 0.1 * time.deltaTime;
  // });

  const app = new Application();

  // Initialize the application
  await app.init({ background: "#061536", resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  const circle_png = await Assets.load(circle_img);

  // Example planet
  // const planet = new Planet(
  //   "example",
  //   app.screen.width / 2,
  //   app.screen.height / 2,
  //   50,
  //   0x00ff00,
  //   "alive",
  //   app,
  //   circle_png,
  // );
  // app.stage.addChild(planet.sprite);

  // Example spaceship

  const starSystem = new StarSystem(sys1, app, circle_png);

  // const spaceship = new Spaceship(
  //   1,
  //   starSystem.planets_dict["Earth"],
  //   starSystem.planets_dict["Venus"],
  //   app,
  // );
  // app.stage.addChild(spaceship.sprite);

  let elapsed = 0.0;
  // make general loop for the game
  app.ticker.add((ticker) => {
    elapsed += ticker.deltaTime;
    // planet.x =
    //   500 +
    //   20 * Math.cos(elapsed / 10) +
    //   40 * Math.cos(elapsed / 40) +
    //   200 * Math.cos(elapsed / 100);
    // planet.y = 200 + 10 * Math.sin(elapsed / 5) + 40 * Math.sin(elapsed / 40);
    // update the game
    // update the physics
    // update the graphics
    // console.log("delta", ticker.deltaTime);

    // spaceship.update(ticker.deltaTime);
    starSystem.update(ticker.deltaMS / 1000);
  });
})();
