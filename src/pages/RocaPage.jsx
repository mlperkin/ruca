import React, { useState, useEffect } from "react";
import { TextField, Grid, Button, IconButton, Tooltip } from "@mui/material";
import { Box } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import MaterialReactTable from "material-react-table";

const RocaPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState([]);
  const [data, setData] = useState([]);
  const [validationMessage, setValidationMessage] = useState("");

  const CombinedResultsCell = ({ cell, row }) => {
    return [
      row.original.ZIP_CODE,
      row.original.RUCA1,
      row.original.RUCA2,
      row.original.STATE,
      row.original.ZIP_TYPE,
    ].join(", ");
  };

  const RemoveRowCell = ({ cell, row }) => {
    return (
      <Tooltip title="Remove">
        <div
          onClick={() => removeRow(row.original.ZIP_CODE)}
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
          <PlaylistRemoveIcon />
        </div>
      </Tooltip>
    );
  };

  const columns = [
    {
      header: "Combined Results",
      accessorKey: "combinedResults",
      Cell: CombinedResultsCell,
    },
    { header: "Zip", accessorKey: "ZIP_CODE" },
    { header: "RUCA1", accessorKey: "RUCA1" },
    { header: "RUCA2", accessorKey: "RUCA2" },
    { header: "State", accessorKey: "STATE" },
    { header: "Zip Type", accessorKey: "ZIP_TYPE" },
    {
      header: "Remove",
      accessorKey: "remove",
      Cell: RemoveRowCell,
    },
  ];

  useEffect(() => {
    //get the csv zip Roca data and store it
    fetch(process.env.PUBLIC_URL + "/zipRocaData.csv")
      .then((response) => response.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            setData(results.data);
          },
          error: (err) => {
            console.error("Error parsing the CSV:", err);
          },
        });
      })
      .catch((error) => console.error("Error fetching the CSV:", error));

    const storedResultsData = localStorage.getItem("resultsData");
    const parsedResultsData = storedResultsData
      ? JSON.parse(storedResultsData)
      : [];

    //if stored in local storage then go ahead and load it and show in table
    if (parsedResultsData) {
      if (parsedResultsData.length > 0) {
        setResults(parsedResultsData);
      }
    }
  }, []);

  const exportToCSV = () => {
    // Convert the results array to CSV format using papaparse
    const csvData = Papa.unparse(results);

    // Create a Blob from the CSV data
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });

    // Use FileSaver to save the generated CSV file
    saveAs(blob, "export.csv");
  };

  const removeRow = (zipCodeToRemove) => {
    // Filter out the object with the matching ZIP_CODE from the results array
    const updatedResults = results.filter(
      (item) => item.ZIP_CODE !== zipCodeToRemove
    );

    // Update the results state with the filtered array
    setResults(updatedResults);

    // Store the updated results in localStorage as a JSON string
    localStorage.setItem("resultsData", JSON.stringify(updatedResults));
  };

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
    const _data = getRoca(inputValue);

    // Filter out any data that already exists in the results based on the ZIP_CODE
    const newUniqueData = _data.filter(
      (newItem) =>
        !results.some(
          (existingItem) => existingItem.ZIP_CODE === newItem.ZIP_CODE
        )
    );

    // Use spread operator to concatenate existing results with new unique data
    const updatedResults = [...results, ...newUniqueData];

    // Update the state with the concatenated results
    setResults(updatedResults);

    // Store the updated results in localStorage as a JSON string
    localStorage.setItem("resultsData", JSON.stringify(updatedResults));
  };

  const getRoca = (input) => {
    // Find matching ZIP_CODE in the data array
    const matchingData = data.filter((item) => item.ZIP_CODE === input);
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
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4} md={3}>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Zip Code Search"
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
        <Grid item xs={12} sm={8} md={9}>
          <Button
            startIcon={<FileDownloadIcon />}
            variant="contained"
            color="primary"
            onClick={exportToCSV}
          >
            Export to CSV
          </Button>
          <MaterialReactTable
            title="Roca Search Table"
            columns={columns}
            data={results}
            enableClickToCopy={true}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RocaPage;
