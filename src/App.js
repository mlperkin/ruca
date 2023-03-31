import React from "react";
import DrawerAppBar from "./components/DrawerAppBar";
import RocaPage from "./pages/RocaPage";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    primary: {
      main: "#008C95", // your custom primary color
    },
    secondary: {
      main: "#aad9dc", // your custom secondary color
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <header className="App-header"></header>
        <DrawerAppBar />
        <RocaPage />
      </div>
    </ThemeProvider>
  );
}

export default App;
