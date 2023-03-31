import React, { useState, useEffect } from "react";
import {
  TextField,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack,
} from "@mui/material";
import { Box } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import Papa from "papaparse";

const RocaPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState([]);
  const [data, setData] = useState([]);
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/zipRocaData.csv")
      .then((response) => response.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            console.log("Parsed results:", results.data);
            setData(results.data);
          },
          error: (err) => {
            console.error("Error parsing the CSV:", err);
          },
        });
      })
      .catch((error) => console.error("Error fetching the CSV:", error));
  }, []);

  const handleChange = (event) => {
    let value = event.target.value;
    setInputValue(value);

    // Check if the input value matches the 5-digit ZIP code pattern
    if (value.match(/^\d{5}$/)) {
      // If valid, clear the validation message
      setValidationMessage("");
    } else {
      // If invalid, set the validation message
      setValidationMessage("Please enter a valid 5-digit ZIP code");
    }
  };

  const handleSubmit = (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();
    const data = getRoca(inputValue);
    setResults(data);
  };

  const getRoca = (input) => {
    // Find matching ZIP_CODE in the data array
    const matchingData = data.filter((item) => item.ZIP_CODE === input);
    console.log("search input", input);
    console.log("matching data", matchingData);
    return matchingData;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "background.default",
        paddingTop: "3rem",
        margin: "50px",
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Roca Search
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Typography variant="h6" gutterBottom>
            Search
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Search"
              variant="outlined"
              value={inputValue}
              onChange={handleChange}
              sx={{ minWidth: 300 }}
              inputProps={{ maxLength: 5 }} // Limit input length to 5 characters
              helperText={validationMessage} // Display validation message
              error={!!validationMessage} // Show error style if validation message exists
            />
            <Button
              type="submit" // Add type="submit" to the Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              sx={{ marginTop: "10px", marginLeft: "10px" }}
            >
              Submit
            </Button>
          </form>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="h6" gutterBottom>
            Results
          </Typography>
          <TableContainer component={Paper} sx={{ minWidth: 600 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Combined Results</TableCell>
                  <TableCell>Zip</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Zip Type</TableCell>
                  <TableCell>RUCA1</TableCell>
                  <TableCell>RUCA2</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.ZIP_CODE}>
                    <TableCell>
                      {[
                        result.ZIP_CODE,
                        result.STATE,
                        result.ZIP_TYPE,
                        result.RUCA1,
                        result.RUCA2,
                      ].join(", ")}
                    </TableCell>
                    <TableCell>{result.ZIP_CODE}</TableCell>
                    <TableCell>{result.STATE}</TableCell>
                    <TableCell>{result.ZIP_TYPE}</TableCell>
                    <TableCell>{result.RUCA1}</TableCell>
                    <TableCell>{result.RUCA2}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RocaPage;
