import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Collapse,
  TextField,
  Grid,
  Button,
  Tooltip,
  IconButton,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import MaterialReactTable from "material-react-table";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { Workbook } from "exceljs";
import csvIcon from "../assets/csv.png";
import xlsxIcon from "../assets/xlsx.png";
import Autocomplete from "@mui/material/Autocomplete";

const RucaPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState([]);
  const [data, setData] = useState([]);
  const [tempSavedData, setTempSavedData] = useState([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [hasDuplicate, setHasDuplicate] = useState(false);
  const [zipNotFound, setZipNotFound] = useState(false);
  const [zipAdded, setZipAdded] = useState(false);
  const [showAllFlag, setShowAllFlag] = useState(false);
  const [closestMatch, setClosestMatch] = useState();
  const [allRucaData, setAllRucaData] = useState([]);
  const [tempZip, setTempZip] = useState("")
  const [tempZipDupe, setTempZipDupe] = useState("")
  const [tempUnfoundZip, setTempUnfoundZip] = useState("")

  let _showAllFlag = useRef(false);

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
    ...(_showAllFlag.current
      ? []
      : [
          {
            header: "Remove",
            accessorKey: "remove",
            Cell: RemoveRowCell,
            enableClickToCopy: false,
          },
        ]),
  ];

  useEffect(() => {
    const fetchData = async () => {
      // Get the latest version identifier from your server.
      // You need to host the identifier somewhere, e.g., as a separate file or as part of an API response.
      const latestVersion = await fetch(
        process.env.PUBLIC_URL + "/zipRucaDataVersion.txt"
      ).then((res) => res.text());

      const storedVersion = localStorage.getItem("rawDataVersion");
      const storedRawData = localStorage.getItem("rawData");

      // If the stored version is different from the latest version, update the data.
      if (latestVersion !== storedVersion || !storedRawData) {
        fetch(process.env.PUBLIC_URL + "/zipRucaData.csv")
          .then((response) => response.text())
          .then((text) => {
            Papa.parse(text, {
              header: true,
              complete: (results) => {
                setData(results.data);
                setAllRucaData(results.data);
                localStorage.setItem("rawData", JSON.stringify(results.data));
                localStorage.setItem("rawDataVersion", latestVersion);
              },
              error: (err) => {
                console.error("Error parsing the CSV:", err);
              },
            });
          })
          .catch((error) => console.error("Error fetching the CSV:", error));
      } else {
        setData(JSON.parse(storedRawData));
        setAllRucaData(JSON.parse(storedRawData));
      }

      const storedResultsData = localStorage.getItem("resultsData");
      const parsedResultsData = storedResultsData
        ? JSON.parse(storedResultsData)
        : [];

      if (parsedResultsData.length > 0) {
        setShowAllFlag(false);
        setResults(parsedResultsData);
      }
    };

    fetchData();
  }, []);

  const exportToCSV = () => {
    // Convert the results array to CSV format using papaparse
    const csvData = Papa.unparse(results);

    // Create a Blob from the CSV data
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });

    // Use FileSaver to save the generated CSV file
    saveAs(blob, "rucaZIP_Export.csv");
  };

  const exportToXLSX = async () => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Write data to the worksheet
    worksheet.columns = Object.keys(results[0]).map((key) => ({
      header: key,
      key,
    }));
    worksheet.addRows(results);

    // Bold the header row
    worksheet.getRow(1).font = { bold: true };

    // Freeze the header row
    worksheet.views = [
      {
        state: "frozen",
        xSplit: 0,
        ySplit: 1,
        activeCell: "A2",
      },
    ];

    // Export the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Save the buffer as a .xlsx file
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "rucaZIP_Export.xlsx");
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

  // Update the handleChange function to accept a value directly
  const handleChange = (value) => {
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

  // Create a separate function to handle changes from the Autocomplete component
  const handleAutocompleteChange = (event, newValue) => {
    handleChange(newValue || ""); // Use an empty string if newValue is undefined
  };

  const handleSubmit = (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();
    if(!inputValue) return;

    if (showAllFlag) return; //do not submit if on all results
    const _data = getRuca(inputValue);

    // Filter out any data that already exists in the results based on the ZIP_CODE
    const newUniqueData = _data.filter((newItem) => {
      const duplicate = results.some(
        (existingItem) => existingItem.ZIP_CODE === newItem.ZIP_CODE
      );

      if (duplicate) {
        setHasDuplicate(true);
        setTempZipDupe(inputValue)
        setTimeout(() => {
          setHasDuplicate(false);
          setTempZipDupe('')
        }, 15000);
      } else {
        //zip found and added
        setZipNotFound(false);
        setHasDuplicate(false)
        setZipAdded(true);      
        setTempZip(inputValue)
        setTimeout(() => {
          setZipAdded(false);
          setTempZip('')
        }, 15000);
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

  const getRuca = (input) => {
    // Find matching ZIP_CODE in the data array
    const matchingData = data.filter((item) => item.ZIP_CODE === input);

    const findClosestZip = (data, input) => {
      return data.reduce((closest, item) => {
        const inputNum = parseInt(input, 10);
        const zipNum = parseInt(item.ZIP_CODE, 10);
        const currentDifference = Math.abs(inputNum - zipNum);
        const closestDifference = Math.abs(
          inputNum - parseInt(closest.ZIP_CODE, 10)
        );

        return currentDifference < closestDifference ? item : closest;
      }, data[0]);
    };

    if (matchingData.length <= 0) {
      let _closestMatch = findClosestZip(data, input);
      setClosestMatch(_closestMatch.ZIP_CODE);

      setZipNotFound(true);
      setTempUnfoundZip(inputValue)
      setTimeout(() => {
        setZipNotFound(false);
        setTempUnfoundZip('')
      }, 15000);
    }
    return matchingData;
  };

  const viewAllData = () => {
    _showAllFlag.current = !_showAllFlag.current;
    if (_showAllFlag.current) {
      setResults(data);
      setTempSavedData(results);
      setShowAllFlag(true);
    } else {
      setResults(tempSavedData);
      setShowAllFlag(false);
    }
  };

  // Extract ZIP_CODE values from allRucaData array
  const zipCodeOptions = allRucaData.map((item) => item.ZIP_CODE);

  const MIN_CHARACTERS = 1;

  // Define a custom filter function with a 2-minimum-character limit
  const filterOptions = (options, { inputValue }) => {
    // If the input value's length is less than 2 characters, return an empty array
    if (inputValue.length < MIN_CHARACTERS) {
      return [];
    }

    const lowerInputValue = inputValue.toLowerCase();
    return options.filter((option) =>
      option.toLowerCase().startsWith(lowerInputValue)
    );
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
        <Grid item xs={12} md={3}>
          <form onSubmit={handleSubmit}>
            {showAllFlag ? (
              <Tooltip title={"Switch back to Your Zips to search."}>
                <TextField
                  label="Zip Code Search"
                  variant="outlined"
                  value={inputValue}
                  onChange={handleChange}
                  disabled={showAllFlag}
                  sx={{ minWidth: 300 }}
                  inputProps={{ maxLength: 5 }} // Limit input length to 5 characters
                  helperText={validationMessage} // Display validation message
                  error={!!validationMessage} // Show error style if validation message exists
                />
              </Tooltip>
            ) : (
              <Autocomplete
                options={zipCodeOptions} // Use extracted ZIP_CODE values as options
                value={inputValue}
                onChange={handleAutocompleteChange} // Use the handleAutocompleteChange function
                disableClearable
                freeSolo // Allow any input value, not just available options
                filterOptions={filterOptions} // Custom filter function with a minimum character limit
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Zip Code Search"
                    variant="outlined"
                    disabled={showAllFlag}
                    sx={{ minWidth: 300 }}
                    inputProps={{
                      ...params.inputProps,
                      maxLength: 5, // Limit input length to 5 characters
                    }}
                    helperText={validationMessage} // Display validation message
                    error={!!validationMessage} // Show error style if validation message exists
                  />
                )}
              />
            )}

            <Button
              type="submit" // Add type="submit" to the Button
              variant="contained"
              color="primary"
              disabled={showAllFlag}
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
                Zip {tempZipDupe} already exists in Your Zips.
              </Alert>
            </Collapse>
            <Collapse in={zipNotFound}>
              <Alert
                onClose={() => setZipNotFound(false)}
                severity="error"
                sx={{ width: "100%", marginTop: "10px" }}
              >
                Zip {tempUnfoundZip} does not exist in the data. Did you mean {closestMatch}
                ?
              </Alert>
            </Collapse>
            <Collapse in={zipAdded}>
              <Alert
                onClose={() => setZipAdded(false)}
                severity="success"
                sx={{ width: "100%", marginTop: "10px" }}
              >
                Zip {tempZip} added.
              </Alert>
            </Collapse>
          </form>
        </Grid>
        <Grid item xs={12} sm={8} md={9}>
          <MaterialReactTable
            title="Ruca Search Table"
            columns={columns}
            data={results}
            enableColumnResizing
            columnResizeMode="onEnd" //instead of the default "onChange" mode
            enableClickToCopy={true}
            autoWidth={true}
            // enableSorting={true}
            enableRowOrdering={!showAllFlag}
            muiTableBodyRowDragHandleProps={({ table }) =>
              showAllFlag
                ? {}
                : {
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
                        localStorage.setItem(
                          "resultsData",
                          JSON.stringify([...results])
                        );
                      }
                    },
                  }
            }
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
                {showAllFlag ? (
                  <>
                    <Tooltip title="View Saved Data" placement="top">
                      <IconButton
                        color="primary"
                        onClick={viewAllData}
                        sx={{ width: "60px", height: "60px" }}
                      >
                        <ShowChartIcon />
                      </IconButton>
                    </Tooltip>
                    <Typography variant={"h4"} sx={{ margin: "auto" }}>
                      All Zips
                    </Typography>
                  </>
                ) : (
                  <>
                    <Tooltip title="View All Data" placement="top">
                      <IconButton
                        color="primary"
                        onClick={viewAllData}
                        sx={{ width: "60px", height: "60px" }}
                      >
                        <QueryStatsIcon />
                      </IconButton>
                    </Tooltip>
                    <Typography variant={"h4"} sx={{ margin: "auto" }}>
                      Your Zips
                    </Typography>
                  </>
                )}
                <Tooltip title={"Export to CSV"} placement="top">
                  <Button onClick={exportToCSV}>
                    <img
                      src={csvIcon}
                      alt="Export to CSV"
                      style={{ width: "40px", height: "40px" }}
                    />
                  </Button>
                </Tooltip>
                <Tooltip title={"Export to XLSX"} placement="top">
                  <Button onClick={exportToXLSX}>
                    <img
                      src={xlsxIcon}
                      alt="Export to XLSX"
                      style={{ width: "40px", height: "40px" }}
                    />
                  </Button>
                </Tooltip>
              </Box>
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RucaPage;
