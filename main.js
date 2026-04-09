import { calc_gradiental_change_float } from "./src/common/common_utils.js";
import { getApp, getPlayers, getStarSystem } from "./src/init_utils.js";
import { GAME_STATUS_GOING, GAME_STATUS_LAST_BOT_STANDING, GAME_STATUS_LOST, GAME_STATUS_WON, GAME_TEMPO } from "./src/settings.js";

// Dynamically discover all .json map files in the resource/solar_systems directory
const mapModules = import.meta.glob('./resource/solar_systems/*.json', { eager: true });
const MAP_FILES = Object.keys(mapModules)
  .map(path => path.split('/').pop()) // Extract filename from path
  .sort();

let selectedMap = null;
let mapPreviews = {}; // cache for map data
let currentApp = null; // track current PixiJS app instance
let currentStarSystem = null; // track current star system for cleanup
let currentTickerCallback = null; // track ticker callback for cleanup

function showGameOverScreen() {
  document.getElementById("gameContainer").style.display = "none";
  document.getElementById("gameOverScreen").style.display = "flex";
}

function clearValidationError() {
  document.getElementById("validationError").textContent = "";
}

function showValidationError(message) {
  document.getElementById("validationError").textContent = message;
}

function validatePlayerCounts() {
  const humanCount = parseInt(document.getElementById("humanPlayers").value) || 0;
  const aiCount = parseInt(document.getElementById("aiPlayers").value) || 0;
  const total = humanCount + aiCount;

  clearValidationError();

  if (total < 1) {
    showValidationError("Total players must be at least 1");
    return false;
  }
  if (total > 10) {
    showValidationError("Total players cannot exceed 10");
    return false;
  }
  return true;
}

function updateStartButtonState() {
  const hasSelectedMap = selectedMap !== null;
  const countsValid = validatePlayerCounts();
  document.getElementById("startButton").disabled = !(hasSelectedMap && countsValid);
}

function computeBoundingBox(planets) {
  if (planets.length === 0) return { minX: 0, maxX: 100, minY: 0, maxY: 100 };

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  for (const planet of planets) {
    minX = Math.min(minX, planet.x - planet.radius);
    maxX = Math.max(maxX, planet.x + planet.radius);
    minY = Math.min(minY, planet.y - planet.radius);
    maxY = Math.max(maxY, planet.y + planet.radius);
  }

  return { minX, maxX, minY, maxY };
}

function createSvgPreview(mapData, width, height) {
  const { planets, connections } = mapData;
  const { minX, maxX, minY, maxY } = computeBoundingBox(planets);

  const padding = 20;
  const viewBoxWidth = maxX - minX + padding * 2;
  const viewBoxHeight = maxY - minY + padding * 2;

  let svg = `<svg viewBox="${minX - padding} ${minY - padding} ${viewBoxWidth} ${viewBoxHeight}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect x="${minX - padding}" y="${minY - padding}" width="${viewBoxWidth}" height="${viewBoxHeight}" fill="#061536"/>`;

  // Draw connections first (so they appear behind planets)
  if (connections) {
    for (const conn of connections) {
      const planetA = planets.find(p => p.name === conn.A);
      const planetB = planets.find(p => p.name === conn.B);

      if (planetA && planetB) {
        svg += `<line x1="${planetA.x}" y1="${planetA.y}" x2="${planetB.x}" y2="${planetB.y}" stroke="#444" stroke-width="1.5"/>`;
      }
    }
  }

  // Draw planets
  for (const planet of planets) {
    const scaleFactor = Math.min(width / viewBoxWidth, height / viewBoxHeight);
    const r = Math.max(1.5, planet.radius * 0.8);

    const color = planet.occupied ? '#00ff00' : '#999999';
    svg += `<circle cx="${planet.x}" cy="${planet.y}" r="${r}" fill="${color}" opacity="0.85"/>`;
  }

  svg += `</svg>`;
  return svg;
}

function selectMap(filename) {
  selectedMap = filename;

  // Update UI
  document.querySelectorAll('.map-thumbnail').forEach(card => {
    card.classList.remove('selected');
  });
  document.querySelector(`[data-map="${filename}"]`)?.classList.add('selected');

  updateStartButtonState();
}

async function initializeMapPicker() {
  const container = document.getElementById("mapPickerContainer");

  for (const mapFile of MAP_FILES) {
    try {
      // Get map data from preloaded modules
      const modulePath = `./resource/solar_systems/${mapFile}`;
      const mapData = mapModules[modulePath]?.default || mapModules[modulePath];

      if (!mapData) {
        console.warn(`Map module not found: ${mapFile}`);
        continue;
      }

      // Cache for tooltip previews
      mapPreviews[mapFile] = mapData;
      const svgContent = createSvgPreview(mapData, 120, 90);

      const thumbnail = document.createElement("button");
      thumbnail.className = "map-thumbnail";
      thumbnail.dataset.map = mapFile;
      thumbnail.innerHTML = svgContent;
      thumbnail.type = "button";

      thumbnail.addEventListener("click", (e) => {
        e.preventDefault();
        selectMap(mapFile);
      });

      thumbnail.addEventListener("mouseenter", (e) => {
        const tooltip = document.getElementById("mapPreviewTooltip");
        const largerSvg = createSvgPreview(mapData, 300, 225);
        const mapName = mapFile.replace('.json', ''); // Remove .json extension
        tooltip.innerHTML = `<div style="padding: 8px; text-align: center; font-size: 12px; color: #00aaff; font-weight: bold; border-bottom: 1px solid #00aaff;">${mapName}</div>${largerSvg}`;

        // Position tooltip near cursor
        tooltip.style.display = "block";
        tooltip.style.left = (e.clientX + 10) + "px";
        tooltip.style.top = (e.clientY + 10) + "px";
      });

      thumbnail.addEventListener("mousemove", (e) => {
        const tooltip = document.getElementById("mapPreviewTooltip");
        tooltip.style.left = (e.clientX + 10) + "px";
        tooltip.style.top = (e.clientY + 10) + "px";
      });

      thumbnail.addEventListener("mouseleave", () => {
        document.getElementById("mapPreviewTooltip").style.display = "none";
      });

      container.appendChild(thumbnail);
    } catch (error) {
      console.error(`Failed to load map ${mapFile}:`, error);
    }
  }
}

function startGame() {
  // Clean up previous game
  if (currentStarSystem) {
    currentStarSystem.destroy();
    currentStarSystem = null;
  }

  if (currentApp) {
    // Remove ticker callback
    if (currentTickerCallback) {
      currentApp.ticker.remove(currentTickerCallback);
      currentTickerCallback = null;
    }
    // Stop ticker
    currentApp.ticker.stop();
    // Destroy app - this removes canvas and all resources
    currentApp.destroy(true, { children: true, texture: true, baseTexture: true });
    currentApp = null;
  }

  // Clear game container
  const gameContainer = document.getElementById("gameContainer");
  if (gameContainer) {
    gameContainer.innerHTML = '';
  }

  const overScreen = document.getElementById("gameOverScreen");
  if (overScreen) {
    overScreen.style.display = "none";
  }

  // Validation
  if (!selectedMap) {
    showValidationError("Please select a map");
    return;
  }

  const humanCount = parseInt(document.getElementById("humanPlayers").value) || 0;
  const aiCount = parseInt(document.getElementById("aiPlayers").value) || 0;

  if (!validatePlayerCounts()) {
    return;
  }

  document.getElementById("entryScreen").style.display = "none";
  document.getElementById("gameContainer").style.display = "flex";

  // INIT APP
  (async () => {
    const app = await getApp();
    currentApp = app; // Store for cleanup later
    const players = getPlayers(app, humanCount, aiCount);
    const starSystem = await getStarSystem(app, players, selectedMap);
    currentStarSystem = starSystem; // Store for cleanup later

    // RUN GAME LOOP
    let speedup = 1;
    let targetSpeedup = 1;
    let elapsed = 0.0;
    let epsilon = 0.001;
    let endGame = false;

    currentTickerCallback = (ticker) => {
      elapsed += ticker.deltaTime;
      const dt = ticker.deltaMS / 1000;
      speedup = calc_gradiental_change_float(speedup, targetSpeedup, dt, 1);
      const gameStatus = starSystem.update(dt * GAME_TEMPO * speedup);
      if (gameStatus === GAME_STATUS_GOING) {
        return;
      } else if (gameStatus === GAME_STATUS_WON) {
        targetSpeedup = 0;
        console.log("You won!");
      } else if (gameStatus === GAME_STATUS_LOST) {
        targetSpeedup = 2;
        console.log("You lost!");
      } else if (gameStatus === GAME_STATUS_LAST_BOT_STANDING) {
        targetSpeedup = 0;
        console.log("Last bot standing!");
      }
      if (speedup < 0.8 && !endGame) {
        showGameOverScreen();
        endGame = true;
      }

      if (speedup < epsilon) {
        console.log("Game over!");
        app.ticker.stop();
        // Cleanup star system when game ends
        starSystem.destroy();
      }
    };

    app.ticker.add(currentTickerCallback);
  })();
}

// Initialize the map picker when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeMapPicker();

  // Add event listeners for player count validation
  document.getElementById("humanPlayers").addEventListener("change", updateStartButtonState);
  document.getElementById("aiPlayers").addEventListener("change", updateStartButtonState);
});

// Event listeners for buttons
document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("restartButton").addEventListener("click", startGame);
