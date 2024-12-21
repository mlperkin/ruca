// import * as React from "react";
// import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { Divider, Grid, Tooltip } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import HelpIcon from "@mui/icons-material/Help";
import RucaInfo from "./RucaInfo";
import ApiIcon from "@mui/icons-material/Api";

const drawerWidth = 240;

function DrawerAppBar(props) {
  const { window, toggleColorMode, showAllFlag, setRunTour } = props;

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  function showRunTour() {
    localStorage.setItem("runTour", true);
    setRunTour(true);
  }

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // This will center the content horizontally.
        marginTop: "10px",
      }}
    >
      <Box sx={{ textAlign: "center", display: "flex" }}>
        <Box
          component="img"
          src="/header-logo.png"
          alt="RUCA Logo"
          sx={{
            width: 150,
            height: "auto",
            marginRight: "8px",
            textAlign: "center",
            display: { xs: "block" },
          }}
        />
      </Box>
      <Typography variant="h6" sx={{ my: 2 }}>
        RUCA Zip Search
      </Typography>
      <Divider style={{ width: "100%" }} />
      <List>
        <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
          {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        <IconButton
          sx={{ ml: 1 }}
          color="inherit"
          component="a"
          href="https://ruca.wakehealth.edu/ruca-api/api-docs/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ApiIcon />
        </IconButton>
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            RUCA Zip Search
          </Typography>
          <RucaInfo />
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {!showAllFlag && (
              <Tooltip title="Play Tour">
                <IconButton
                  className={"my-seventh-step"}
                  sx={{ ml: 1 }}
                  onClick={showRunTour}
                  color="inherit"
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="API Docs">
              <IconButton
                sx={{ ml: 1 }}
                color="inherit"
                component="a"
                href="https://ruca.wakehealth.edu/ruca-api/api-docs/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ApiIcon />
              </IconButton>
            </Tooltip>

            <IconButton
              className={"my-sixth-step"}
              sx={{ ml: 1 }}
              onClick={toggleColorMode}
              color="inherit"
            >
              {theme.palette.mode === "dark" ? (
                <Tooltip title="Light Mode">
                  <LightModeIcon />
                </Tooltip>
              ) : (
                <Tooltip title="Dark Mode">
                  <DarkModeIcon />
                </Tooltip>
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Centered Logo Section */}
      <Box
        component="nav"
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          component="img"
          src="/header-logo.png"
          alt="RUCA Logo"
          sx={{
            width: 250,
            mt: 10,
            display: { xs: "none", sm: "block" },
          }}
        />
      </Box>

      {/* Drawer Section */}
      <Drawer
        container={container}
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

export default DrawerAppBar;
