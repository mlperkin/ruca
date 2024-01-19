import { useState, useEffect, useContext, createContext, useMemo } from "react";
import DrawerAppBar from "./components/DrawerAppBar";
import RucaPage from "./pages/RucaPage";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";

const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App({ mode, runTour, setRunTour, showAllFlag, setShowAllFlag }) {
  const colorMode = useContext(ColorModeContext);

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <DrawerAppBar
        toggleColorMode={colorMode.toggleColorMode}
        runTour={runTour}
        setRunTour={setRunTour}
        showAllFlag={showAllFlag}
      />
      <RucaPage
        mode={mode}
        runTour={runTour}
        setRunTour={setRunTour}
        setShowAllFlag={setShowAllFlag}
        showAllFlag={showAllFlag}
      />
    </Box>
  );
}

export default function ToggleColorMode() {
  const storedColorPref = localStorage.getItem("colorPref");
  const initialMode = storedColorPref ? JSON.parse(storedColorPref) : "light";
  const [mode, setMode] = useState(initialMode);
  const [runTour, setRunTour] = useState(false);
  const [showAllFlag, setShowAllFlag] = useState(false);

  useEffect(() => {
    localStorage.setItem("colorPref", JSON.stringify(mode));
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode, // mode can be 'light' or 'dark'
          primary: {
            main: "rgb(0, 140, 149)",
          },
        },
      }),
    [mode]
  );
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App
          mode={mode}
          runTour={runTour}
          setRunTour={setRunTour}
          showAllFlag={showAllFlag}
          setShowAllFlag={setShowAllFlag}
        />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
