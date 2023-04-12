import {
  Card,
  CardContent,
  Typography,
  // Box,
  Grid,
  CardActions,
  // Button,
  // IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
// import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";

const Cards = ({ data, removeRow }) => {
  const handleRemove = (zipCode) => {
    if (removeRow) {
      removeRow(zipCode);
    }
  };

  return (
    <Grid container spacing={2} justifyContent="center">
      {data.map((item, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card elevation={3} sx={{ minWidth: 250 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Combined Results:{" "}
                <Typography variant="subtitle1" component="span">
                  {item.ZIP_CODE},{item.RUCA1},{item.RUCA2},{item.STATE},
                  {item.ZIP_TYPE}
                </Typography>
              </Typography>
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
            <CardActions>
              {/* <Button variant="outlined" onClick={exportToCSV}>
                Export to CSV
              </Button>
              <Button variant="outlined" onClick={exportToXLSX}>
                Export to XLSX
              </Button> */}
              {/* <IconButton
                color="secondary"
                onClick={() => handleRemove(item.ZIP_CODE)}
              >
                <DeleteIcon />
              </IconButton> */}

              <Tooltip title="Remove">
                <div
                  onClick={() => handleRemove(item.ZIP_CODE)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    borderRadius: "50%",
                    padding: "8px",
                    backgroundColor: "rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <DeleteIcon />
                </div>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Cards;
