// vite.config.js
import reactRefresh from "@vitejs/plugin-react-refresh";

// Read the homepage value from package.json
const packageJson = require("./package.json");
const homepage = packageJson.homepage || "/";

export default {
  base: homepage, // Set the base option to match the homepage value
  plugins: [reactRefresh()],
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  server: {
    open: true, // Automatically opens the app in the default browser
  },
};
