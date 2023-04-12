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
import Papa from "papaparse";
import { saveAs } from "file-saver";
// import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import MaterialReactTable from "material-react-table";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { Workbook } from "exceljs";
import csvIcon from "../assets/csv.png";
import xlsxIcon from "../assets/xlsx.png";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import useMediaQuery from "@mui/material/useMediaQuery";
import Cards from "../components/Cards";
import DeleteIcon from "@mui/icons-material/Delete";

const RucaPage = ({ mode }) => {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [hasDuplicate, setHasDuplicate] = useState(false);
  const [zipNotFound, setZipNotFound] = useState(false);
  const [zipAdded, setZipAdded] = useState(false);
  const [showAllFlag, setShowAllFlag] = useState(false);
  const [closestMatch, setClosestMatch] = useState();
  const [allRucaData, setAllRucaData] = useState([]);
  const [tempZip, setTempZip] = useState("");
  const [tempZipDupe, setTempZipDupe] = useState("");
  const [tempUnfoundZip, setTempUnfoundZip] = useState("");
  const [highlightedZipCode, setHighlightedZipCode] = useState("");

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
          <DeleteIcon />
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
    {
      header: "Zip",
      accessorKey: "ZIP_CODE",
    },
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

  // Define a function to get row props based on the row data
  const getRowProps = ({ row }) => {
    // Check if the row's ZIP_CODE matches the highlightedZipCode
    if (!row.original) return;
    const isHighlighted = row.original.ZIP_CODE === highlightedZipCode;

    // Define the highlight styles based on the mode
    const darkModeHighlightStyles = {
      backgroundColor: isHighlighted ? "#B9352B" : "inherit", // Darker blue for dark mode
      color: isHighlighted ? "#ffffff" : "inherit",
    };
    const lightModeHighlightStyles = {
      backgroundColor: isHighlighted ? "#FDEDED" : "inherit", // Existing color for light mode
      color: isHighlighted ? "#ffffff" : "inherit",
    };

    return {
      // Apply the highlight style conditionally based on the mode
      style: {
        ...(mode === "dark"
          ? darkModeHighlightStyles
          : lightModeHighlightStyles),
        transition: "background-color 1s",
      },
    };
  };

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
                // setData(results.data);
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
        // setData(JSON.parse(storedRawData));
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

    // Set the width of the ZIP_TYPE column
    const zipTypeColumnIndex = worksheet.columns.findIndex(
      (column) => column.key === "ZIP_TYPE"
    );
    if (zipTypeColumnIndex !== -1) {
      const zipTypeColumn = worksheet.getColumn(zipTypeColumnIndex + 1); // +1 to account for zero-based index
      zipTypeColumn.width = 35;
    }

    // Iterate through each row and column to format cells
    results.forEach((row, rowIndex) => {
      Object.keys(row).forEach((colKey, colIndex) => {
        const cell = worksheet.getCell(rowIndex + 2, colIndex + 1); // +2 and +1 to account for header and zero-based index
        const cellValue = row[colKey];
        if (["RUCA1", "RUCA2"].includes(colKey) && !isNaN(cellValue)) {
          // Set the value and data type for RUCA1 and RUCA2 columns
          cell.value = Number(cellValue); // Convert cellValue to a number
        }
      });
    });

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
  const handleChange = (input) => {
    // Determine if the input is an event object or a plain string value
    const value =
      typeof input === "object" && input.target ? input.target.value : input;

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
    handleChange(newValue.value || ""); // Use an empty string if newValue is undefined
  };

  const handleSubmit = (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();
    if (!inputValue) return;

    // if (showAllFlag) return; //do not submit if on all results
    const _data = getRuca(inputValue);

    // Filter out any data that already exists in the results based on the ZIP_CODE
    const newUniqueData = _data.filter((newItem) => {
      const duplicate = results.some(
        (existingItem) => existingItem.ZIP_CODE === newItem.ZIP_CODE
      );

      if (duplicate) {
        setHasDuplicate(true);
        setTempZipDupe(inputValue);
        setTimeout(() => {
          setHasDuplicate(false);
          setTempZipDupe("");
        }, 15000);

        // Update the highlightedZipCode state
        setHighlightedZipCode(inputValue);

        // Clear the highlightedZipCode state after 5 seconds
        setTimeout(() => {
          setHighlightedZipCode("");
        }, 5000);
      } else {
        //zip found and added
        setZipNotFound(false);
        setHasDuplicate(false);
        setZipAdded(true);
        setTempZip(inputValue);
        setTimeout(() => {
          setZipAdded(false);
          setTempZip("");
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
    const matchingData = allRucaData.filter((item) => item.ZIP_CODE === input);

    const findClosestZip = (allRucaData, input) => {
      return allRucaData.reduce((closest, item) => {
        const inputNum = parseInt(input, 10);
        const zipNum = parseInt(item.ZIP_CODE, 10);
        const currentDifference = Math.abs(inputNum - zipNum);
        const closestDifference = Math.abs(
          inputNum - parseInt(closest.ZIP_CODE, 10)
        );

        return currentDifference < closestDifference ? item : closest;
      }, allRucaData[0]);
    };

    if (matchingData.length <= 0) {
      let _closestMatch = findClosestZip(allRucaData, input);
      setClosestMatch(_closestMatch.ZIP_CODE);
      setZipNotFound(true);
      setTempUnfoundZip(inputValue);
      setTimeout(() => {
        setZipNotFound(false);
        setTempUnfoundZip("");
      }, 15000);
    }
    return matchingData;
  };

  const viewAllData = () => {
    _showAllFlag.current = !_showAllFlag.current;
    if (_showAllFlag.current) {
      setShowAllFlag(true);
    } else {
      setShowAllFlag(false);
    }
  };

  // Create options with labels that include ZIP_CODE and STATE, and value as ZIP_CODE
  const zipCodeOptions = allRucaData.map((item) => ({
    label: `${item.ZIP_CODE}`, // Display both ZIP_CODE and STATE in the label
    value: item.ZIP_CODE, // Use ZIP_CODE as the value
  }));

  const MIN_CHARACTERS = 2;

  // Define a custom filter function with a 2-minimum-character limit
  const filterOptions = (options, { inputValue }) => {
    // If the input value's length is less than 2 characters, return an empty array
    if (inputValue.length < MIN_CHARACTERS) {
      return [];
    }

    const lowerInputValue = inputValue.toLowerCase();
    return options.filter((option) =>
      option.value.toLowerCase().startsWith(lowerInputValue)
    );
  };

  // Determine the data source based on the value of showAllFlag
  const dataToRender = showAllFlag ? allRucaData : results;

  // Use a media query to check if the viewport width is greater than or equal to 768 pixels
  const isTabletOrLarger = useMediaQuery("(min-width:768px)");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        minHeight: "80vh",
        backgroundColor: "background.default",
        paddingTop: "3rem",
        margin: "50px",
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={2}>
          <form onSubmit={handleSubmit}>
            <Autocomplete
              options={zipCodeOptions} // Use extracted ZIP_CODE values as options
              value={inputValue}
              onChange={handleAutocompleteChange} // Use the handleAutocompleteChange function
              disableClearable
              freeSolo // Allow any input value, not just available options
              filterOptions={filterOptions} // Custom filter function with a minimum character limit
              renderOption={(props, option) => (
                <Box
                  component="li"
                  sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                  {...props}
                >
                  {option.label}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Zip Code Search"
                  variant="outlined"
                  onChange={handleChange}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleSubmit}>
                          <ArrowRightAltIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    ...params.inputProps,
                    maxLength: 5, // Limit input length to 5 characters
                  }}
                  helperText={validationMessage} // Display validation message
                  error={!!validationMessage} // Show error style if validation message exists
                />
              )}
            />
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
                Zip {tempUnfoundZip} does not exist in the data. Did you mean{" "}
                {closestMatch}?
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
        <Grid item xs={12} md={10}>
          {isTabletOrLarger ? (
            <MaterialReactTable
              title="Ruca Search Table"
              columns={columns}
              data={dataToRender}
              enableStickyHeader
              enableColumnResizing
              enablePagination={true}
              columnResizeMode="onEnd" //instead of the default "onChange" mode
              enableClickToCopy={true}
              autoWidth={true}
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
              muiTableBodyRowProps={getRowProps} //
              muiTablePaginationProps={{
                rowsPerPageOptions: [5, 10, 25, 100, 500],
                showFirstButton: false,
                showLastButton: false,
              }}
              muiTableContainerProps={{
                sx: { maxHeight: "60vh" },
              }}
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
                      <Typography
                        variant={"h4"}
                        sx={{
                          margin: "auto",
                          fontSize: isTabletOrLarger ? "2rem" : "1rem", // Smaller font size for smaller viewports
                        }}
                      >
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
                      <Typography
                        variant={"h4"}
                        sx={{
                          margin: "auto",
                          fontSize: isTabletOrLarger ? "2rem" : "1rem", // Smaller font size for smaller viewports
                        }}
                      >
                        Your Zips
                      </Typography>
                    </>
                  )}
                  <Tooltip title={"Export to CSV"} placement="top">
                    <Button onClick={exportToCSV}>
                      <img
                        src={csvIcon}
                        alt="Export to CSV"
                        style={{ width: "32px", height: "32px" }}
                      />
                    </Button>
                  </Tooltip>
                  <Tooltip title={"Export to XLSX"} placement="top">
                    <Button onClick={exportToXLSX}>
                      <img
                        src={xlsxIcon}
                        alt="Export to XLSX"
                        style={{ width: "32px", height: "32px" }}
                      />
                    </Button>
                  </Tooltip>
                </Box>
              )}
            />
          ) : (
            <>
              <Tooltip title={"Export to CSV"} placement="top">
                <Button onClick={exportToCSV}>
                  <img
                    src={csvIcon}
                    alt="Export to CSV"
                    style={{ width: "32px", height: "32px" }}
                  />
                </Button>
              </Tooltip>
              <Tooltip title={"Export to XLSX"} placement="top">
                <Button onClick={exportToXLSX}>
                  <img
                    src={xlsxIcon}
                    alt="Export to XLSX"
                    style={{ width: "32px", height: "32px" }}
                  />
                </Button>
              </Tooltip>
              <Cards data={dataToRender} removeRow={removeRow} />
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default RucaPage;
