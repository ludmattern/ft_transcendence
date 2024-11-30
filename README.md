# **Project Structure**

```
project/
├───frontend/
│   ├───public/                # Static content accessible by the browser
│   │   └───index.html         # Main page
│   │
│   └───src/
│       ├───assets/            # Static resources
│       │   ├───font/          # Custom fonts
│       │   ├───img/           # Generic images
│       │   ├───models/        # 3D models specific to the games
│       │   ├───SVG/           # SVG vector files
│       │   └───textures/      # Textures for the games
│       │
│       ├───components/        # Reusable components
│       │   ├───UI/            # Buttons, modals, etc.
│       │   ├───Menu/          # Components specific to menus
│       │   └───Games/         # Components specific to games
│       │       ├───Game1/     # Components for game 1
│       │       └───Game2/     # Components for game 2
│       │
│       ├───pages/             # Main pages
│       │   ├───Menu/          # Menu pages
│       │   │   ├───MainMenu.js
│       │   │   ├───SettingsMenu.js
│       │   │   └───CreditsMenu.js
│       │   ├───Game1/         # Pages related to game 1
│       │   │   ├───Game1Intro.js
│       │   │   ├───Game1Play.js
│       │   │   └───Game1Results.js
│       │   └───Game2/         # Pages related to game 2
│       │       ├───Game2Intro.js
│       │       ├───Game2Play.js
│       │       └───Game2Results.js
│       │
│       ├───services/          # API management
│       │   └───api.js
│       │
│       ├───hooks/             # Custom hooks
│       │   └───useGameLogic.js
│       │
│       ├───contexts/          # Global context
│       │   └───AppContext.js
│       │
│       ├───store/             # Global state
│       │   └───gameState.js   # Management of game states
│       │
│       ├───styles/             # Main folder for styles
│       │   ├───base/           # Base styles
│       │   │   ├───reset.css   # Reset default browser styles
│       │   │   ├───variables.css  # Global variables (colors, sizes, etc.)
│       │   │   ├───mixins.css     # Reusable mixins or functions
│       │   │   └───global.css  # Global styles shared throughout the project
│       │   │
│       │   ├───components/     # Styles specific to components
│       │   │   ├───Button.css  # Buttons
│       │   │   ├───Modal.css   # Modals
│       │   │   └───Header.css  # Header
│       │   │
│       │   ├───pages/          # Styles specific to pages
│       │   │   ├───Menu.css    # Styles for menu pages
│       │   │   ├───Game1.css   # Styles for game 1 pages
│       │   │   └───Game2.css   # Styles for game 2 pages
│       │   │
│       │   ├───themes/         # Custom themes (if applicable)
│       │   │   ├───light.css   # Light theme
│       │   │   └───dark.css    # Dark theme
│       │   │
│       │   └───index.css       # Entry point to import all styles
│       │
│       ├───utils/             # Utility functions
│       │   ├───gameUtils.js   # Functions specific to games
│       │   └───menuUtils.js   # Functions specific to menus
│       │
│       ├───App.js             # Main entry point of the application
│       └───index.js           # Main project entry point
```
