# Canvas Lava Lamp

**[Live Demo (Original)](https://exzenter.github.io/lava-lamp/)** | **[Canvas Version (High Performance)](https://exzenter.github.io/lava-lamp/canvas-version/index.html)**

A high-performance, interactive lava lamp simulation using the HTML5 Canvas API.

## Features

- **High Performance**: Uses Canvas API for efficient rendering of smooth blobs.
- **Stroke-Only Style**: A clean, outlined aesthetic.
- **Physics Simulation**:
  - Interactive explosion effect (click or button).
  - Configurable inter-blob gravity.
  - Adjustable max speed.
  - Time-step independent physics (slow motion works correctly).
- **Customizable**: Settings panel to adjust:
  - Background and outline colors.
  - Number of blobs (max 15).
  - Blob sizes (min/max).
  - Rise speed, animation speed, and goo blur amount.
  - Stroke width.
- **Self-Contained Export**: One-click export to a single HTML snippet for embedding in WordPress or other sites.

## Project Structure

- `canvas-version/index.html`: The main, self-contained application file. This file contains all the HTML, CSS, and JavaScript.
- `index.html`: Original prototype/version.

## Usage

1. Open `canvas-version/index.html` in a modern web browser.
2. Use the settings panel on the left to customize the lamp.
3. Click "Explode!" to scatter the blobs.
4. Click "Copy Self-Contained HTML" to copy the code for embedding.

## Embedding

The application is designed to be easily embeddable. The export feature generates code that includes:
- Scoped CSS to prevent conflicts.
- A self-executing JavaScript function to encapsulate logic.
- All necessary HTML markup.

Simply paste the exported code into an HTML block in your CMS or website.

## License

Free to use and modify.
