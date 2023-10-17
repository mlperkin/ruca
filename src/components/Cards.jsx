import {
  Card,
  CardActions,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BusinessIcon from "@mui/icons-material/Business";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import LandscapeIcon from "@mui/icons-material/Landscape";
import NotInterestedIcon from "@mui/icons-material/NotInterested";

const getBackgroundColorBasedOnRuca = (ruca) => {
  // Add color codes and gradient backgrounds based on RUCA1 value
  const colorMap = {
    1: {
      color: "linear-gradient(45deg, #c62828, #b71c1c)",
      icon: <ApartmentIcon />,
    },
    2: {
      color: "linear-gradient(45deg, #d32f2f, #c62828)",
      icon: <ApartmentIcon />,
    },
    3: {
      color: "linear-gradient(45deg, #e53935, #d32f2f)",
      icon: <ApartmentIcon />,
    },
    4: {
      color: "linear-gradient(45deg, #f44336, #e53935)",
      icon: <BusinessIcon />,
    },
    5: {
      color: "linear-gradient(45deg, #a5d6a7, #81c784)",
      icon: <BusinessIcon />,
    },
    6: {
      color: "linear-gradient(45deg, #c8e6c9, #a5d6a7)",
      icon: <BusinessIcon />,
    },
    7: {
      color: "linear-gradient(45deg, #e8f5e9, #c8e6c9)",
      icon: <HomeWorkIcon />,
    },
    8: {
      color: "linear-gradient(45deg, #fff9c4, #fff59d)",
      icon: <HomeWorkIcon />,
    },
    9: {
      color: "linear-gradient(45deg, #fffde7, #fff9c4)",
      icon: <HomeWorkIcon />,
    },
    10: {
      color: "linear-gradient(45deg, #fffff0, #fffde7)",
      icon: <LandscapeIcon />,
    },
    99: { color: "#ffffff", icon: <ApartmentIcon /> },
    gt10: {
      color: "linear-gradient(45deg, #fff59d, #fff176)",
      icon: <NotInterestedIcon />,
    },
  };

  return colorMap[ruca] || colorMap["gt10"];
};

const Cards = ({ data, removeRow }) => {
  const handleRemove = (zipCode) => {
    if (removeRow) {
      removeRow(zipCode);
    }
  };

  return (
    <Grid container spacing={2} justifyContent="center">
      {data.map((item, index) => (
        <Grid item xs={12} sm={6} md={4} key={index} sx={{marginTop: '20px'}}>
          <Card
            elevation={3}
            sx={{
              minWidth: 250,
              background: getBackgroundColorBasedOnRuca(item.RUCA1).color,
              color: "#000000",
            }}
          >
            <CardContent sx={{ padding: "16px 24px" }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                {getBackgroundColorBasedOnRuca(item.RUCA1).icon}
                {" "}{item.ZIP_CODE}
              </Typography>
              <Divider style={{width:'100%', backgroundColor: '#cdcdcd'}} />
              <Typography variant="h6" gutterBottom>
              Combined:{" "} 
              <Typography variant="subtitle1" component="span">
                {item.ZIP_CODE},{item.RUCA1},{item.RUCA2},{item.STATE},
                {item.ZIP_TYPE}
                </Typography>
              </Typography>
              {/* Add similar formatting for the other fields */}
              <Typography variant="h6" gutterBottom>
                ZIP Code:{" "}
                <Typography variant="subtitle1" component="span">
                  {item.ZIP_CODE}
                </Typography>
              </Typography>
              <Typography variant="h6" gutterBottom>
                State:{" "}
                <Typography variant="subtitle1" component="span">
                  {item.STATE}
                </Typography>
              </Typography>
              <Typography variant="h6" gutterBottom>
                ZIP Type:{" "}
                <Typography variant="subtitle1" component="span">
                  {item.ZIP_TYPE}
                </Typography>
              </Typography>
              <Typography variant="h6" gutterBottom>
                RUCA1:{" "}
                <Typography variant="subtitle1" component="span">
                  {item.RUCA1}
                </Typography>
              </Typography>
              <Typography variant="h6" gutterBottom>
                RUCA2:{" "}
                <Typography variant="subtitle1" component="span">
                  {item.RUCA2}
                </Typography>
              </Typography>
            </CardContent>
            <Divider style={{width:'100%', backgroundColor: '#cdcdcd', marginBottom: '20px'}} />
            <CardActions sx={{ padding: "0 24px 16px" }}>
              <Tooltip title="Remove">
                <IconButton
                  onClick={() => handleRemove(item.ZIP_CODE)}
                  sx={{
                    color: "rgba(0,0,0)",
                    backgroundColor: "rgba(0, 0, 0, 0.08)",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.15)",
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Cards;
