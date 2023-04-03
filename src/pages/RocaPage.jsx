import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Collapse,
  TextField,
  Grid,
  Button,
  Tooltip,
} from "@mui/material";
import { Box } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import MaterialReactTable from "material-react-table";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ShowChartIcon from "@mui/icons-material/ShowChart";

const RocaPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState([]);
  const [data, setData] = useState([]);
  const [tempSavedData, setTempSavedData] = useState([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [hasDuplicate, setHasDuplicate] = useState(false);

  let showAllFlag = useRef(false);

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
      enableClickToCopy: false,
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
    } else {
      showAllFlag.current = true;
    }
  }, []);

  const exportToCSV = () => {
    // Convert the results array to CSV format using papaparse
    const csvData = Papa.unparse(results);

    // Create a Blob from the CSV data
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });

    // Use FileSaver to save the generated CSV file
    saveAs(blob, "rucaZIP_Export.csv");
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
    const newUniqueData = _data.filter((newItem) => {
      const duplicate = results.some(
        (existingItem) => existingItem.ZIP_CODE === newItem.ZIP_CODE
      );

      if (duplicate) {
        setHasDuplicate(true);
        setTimeout(() => {
          setHasDuplicate(false);
        }, 5000);
      }

      return !duplicate;
    });

    // Use spread operator to concatenate existing results with new unique data
    const updatedResults = [...results, ...newUniqueData];

    // Update the state with the concatenated results
    setResults(updatedResults);
    setInputValue("");

    // Store the updated results in localStorage as a JSON string
    localStorage.setItem("resultsData", JSON.stringify(updatedResults));
  };

  const getRoca = (input) => {
    // Find matching ZIP_CODE in the data array
    const matchingData = data.filter((item) => item.ZIP_CODE === input);
    return matchingData;
  };

  const viewAllData = () => {
    showAllFlag.current = !showAllFlag.current;
    if (showAllFlag.current) {
      setResults(data);
      setTempSavedData(results);
    } else {
      setResults(tempSavedData);
    }
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
            <Collapse in={hasDuplicate}>
              <Alert
                onClose={() => setHasDuplicate(false)}
                severity="error"
                sx={{ width: "100%", marginTop: "10px" }}
              >
                This ZIP code already exists in the table.
              </Alert>
            </Collapse>
          </form>
        </Grid>
        <Grid item xs={12} sm={8} md={9}>
          <MaterialReactTable
            title="Roca Search Table"
            columns={columns}
            data={results}
            enableColumnResizing
            columnResizeMode="onEnd" //instead of the default "onChange" mode
            enableClickToCopy={true}
            autoWidth={true}
            enableRowOrdering
            enableSorting={true}
            muiTableBodyRowDragHandleProps={({ table }) => ({
              onDragEnd: () => {
                const { draggingRow, hoveredRow } = table.getState();
                if (hoveredRow && draggingRow) {
                  results.splice(
                    hoveredRow.index,
                    0,
                    results.splice(draggingRow.index, 1)[0]
                  );
                  setResults([...results]);
                  // Store the updated results in localStorage as a JSON string
                  localStorage.setItem("resultsData", JSON.stringify([...results]));
                }
              },
            })}
            muiTablePaperProps={{
              elevation: 2, //change the mui box shadow
              //customize paper styles
              sx: {
                borderRadius: "0",
                border: "1px solid #e0e0e0",
              },
            }}
            muiTableBodyProps={{
              sx: {
                "& .subrow": {
                  backgroundColor: "pink",
                },
              },
            }}
            muiTableHeadProps={{
              sx: (theme) => ({
                "& tr": {
                  backgroundColor: "#4a4a4a",
                  color: "#ffffff",
                },
              }),
            }}
            muiTableHeadCellProps={{
              sx: (theme) => ({
                div: {
                  backgroundColor: "#4a4a4a",
                  color: "#ffffff",
                },
              }),
            }}
            renderTopToolbarCustomActions={({ table }) => (
              <Box
                width="100%"
                sx={{
                  display: "flex",
                  gap: "1rem",
                  p: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  startIcon={<FileDownloadIcon />}
                  variant="outlined"
                  color="primary"
                  onClick={exportToCSV}
                >
                  Export to CSV
                </Button>
                {showAllFlag.current ? (
                  <Button
                    startIcon={<ShowChartIcon />}
                    variant="contained"
                    color="primary"
                    onClick={viewAllData}
                  >
                    Show Saved Data
                  </Button>
                ) : (
                  <Button
                    startIcon={<QueryStatsIcon />}
                    variant="contained"
                    color="primary"
                    onClick={viewAllData}
                  >
                    View All Data
                  </Button>
                )}
              </Box>
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RocaPage;
