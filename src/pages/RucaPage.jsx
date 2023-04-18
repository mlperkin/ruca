/* eslint-disable react/jsx-pascal-case */
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
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import Joyride from "react-joyride";
import MaterialReactTable, {
  MRT_ToggleDensePaddingButton,
  MRT_FullScreenToggleButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleGlobalFilterButton,
} from "material-react-table";
import PrintIcon from "@mui/icons-material/Print";
import { useTheme } from "@mui/material/styles";

const RucaPage = ({ mode, runTour, setRunTour }) => {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [showAllFlag, setShowAllFlag] = useState(false);
  const [allRucaData, setAllRucaData] = useState([]);
  const [highlightedZipCodes, setHighlightedZipCodes] = useState([]);

  //state variables for multiple alerts
  const [hasDuplicates, setHasDuplicates] = useState([]);
  const [zipNotFounds, setZipNotFounds] = useState([]);
  const [zipAddeds, setZipAddeds] = useState([]);

  // Define state variables to control the tour
  // const [run, setRun] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);


  let _showAllFlag = useRef(false);

  // Access the theme object
  const theme = useTheme();

  const steps = [
    {
      target: ".my-first-step",
      content:
        "Add your list of zip codes here. You can add multiple either separated by a space or a comma. You can also add more granular zips (ZIP+4) that contain more than 5 digits.",
        disableBeacon: true,
          // disableOverlayClose: true,
          // hideCloseButton: true,
          // hideFooter: true,
          placement: 'top',
          spotlightClicks: true,
    },
    {
      target: ".my-second-step",
      content: "Toggle between all the ZIP codes data here and your ZIP list",
    },
    {
      target: ".my-third-step",
      content: "Clear out your entire current list of ZIPS here",
    },
    {
      target: ".my-fourth-step",
      content: "Export the table to either CSV or XLSX",
    },
    {
      target: ".my-fifth-step",
      content: "More advanced features to use the current table",
    },
    {
      target: ".my-sixth-step",
      content: "Toggle dark/light mode here",
    },
    // Add more steps as needed
  ];

  // Create event handlers for the Joyride callback
  const handleJoyrideCallback = (data) => {
    const { status, type, index, action } = data;
    if (status === "finished" || status === "skipped") {
      // If the tour is finished or skipped, stop running the tour
      // setRun(false);
      setRunTour(false)
      setStepIndex(0)
      localStorage.setItem("runTour", false);
    } else if (type === "step:after" && action !== "prev") {
      // Update the step index when the user progresses to the next step
      // Exclude action "prev" to avoid incrementing index when clicking "Back"
      setStepIndex(index + 1);
    } else if (type === "step:after" && action === "prev") {
      // Update the step index when the user navigates to the previous step
      setStepIndex(index - 1);
    }
  };

  function processZipCodes(input) {
    let zipCodes = input.split(/[\s,]+/);
    let validZipCodes = [];
    let invalidZipCodes = [];

    zipCodes.forEach((zip) => {
      // Remove the 4-digit suffix if present and trim any leading/trailing whitespaces
      const cleanedZip = zip.split("-")[0].trim();

      // Check if the cleaned zip code has exactly 5 digits
      if (/^\d{5}$/.test(cleanedZip)) {
        validZipCodes.push(cleanedZip);
      } else {
        invalidZipCodes.push(cleanedZip);
      }
    });

    return { validZipCodes, invalidZipCodes };
  }

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
    const isHighlighted = highlightedZipCodes.includes(row.original.ZIP_CODE);

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
    const _runTour = localStorage.getItem("runTour");

    if (_runTour !== 'false') {
      setRunTour(true)
      setStepIndex(0);
    } else {
      // setRunTour(false)
    }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // setValidationMessage(
      //   "Please enter a valid 5-digit ZIP code or multiple ZIP codes separated by comma or white space."
      // );
    }
  };

  // Create a separate function to handle changes from the Autocomplete component
  const handleAutocompleteChange = (event, newValue) => {
    handleChange(newValue.value || ""); // Use an empty string if newValue is undefined
  };

  function clearAlerts() {
    setHasDuplicates([]);
    setZipNotFounds([]);
    setZipAddeds([]);
    setHighlightedZipCodes([]);
  }

  const handleSubmit = (event) => {
    clearAlerts();
    event.preventDefault();
    if (!inputValue) return;

    const { validZipCodes, invalidZipCodes } = processZipCodes(inputValue);
    let updatedResults = [...results];
    let newHasDuplicates = [];
    let newZipNotFounds = [];
    let newZipAddeds = [];

    // Display alerts for invalid zip codes
    invalidZipCodes.forEach((zip) => {
      newZipNotFounds.push({ zip, closestMatch: null });
    });

    // Create a temporary array for highlighted zip codes
    let tempHighlightedZipCodes = [...highlightedZipCodes];

    validZipCodes.forEach((zip) => {
      const { matchingData, zipNotFound, closestMatch } = getRuca(zip);

      if (zipNotFound) {
        newZipNotFounds.push({ zip, closestMatch });
      }

      const newUniqueData = matchingData.filter((newItem) => {
        const duplicate = updatedResults.some(
          (existingItem) => existingItem.ZIP_CODE === newItem.ZIP_CODE
        );

        if (duplicate) {
          newHasDuplicates.push({ zip });
          // Update the temporary array with the new highlighted zip code
          tempHighlightedZipCodes.push(zip);
        } else {
          newZipAddeds.push({ zip });
        }

        return !duplicate;
      });

      updatedResults = [...updatedResults, ...newUniqueData];
    });

    setResults(updatedResults);
    setInputValue("");
    localStorage.setItem("resultsData", JSON.stringify(updatedResults));

    setHasDuplicates(newHasDuplicates);
    setZipAddeds(newZipAddeds);
    // Merge new invalid zip codes alerts with existing ones
    setZipNotFounds((prevZipNotFounds) => [
      ...prevZipNotFounds,
      ...newZipNotFounds,
    ]);
    // Update the state only once with the temporary array
    setHighlightedZipCodes(tempHighlightedZipCodes);

    setTimeout(() => {
      clearAlerts(); // Clear highlighted zip codes after the timeout
    }, 15000);
  };

  const getRuca = (input) => {
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

    let zipNotFound = false;
    let closestMatch = null;

    if (matchingData.length <= 0) {
      closestMatch = findClosestZip(allRucaData, input).ZIP_CODE;
      zipNotFound = true;
    }

    return {
      matchingData,
      zipNotFound,
      closestMatch,
    };
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

  const handleClearAll = () => {
    // Clear all logic goes here
    setResults([]);
    clearAlerts();
    localStorage.setItem("resultsData", []);
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
        {runTour && isTabletOrLarger && (
          <Joyride
            steps={steps}
            continuous={true}
            showSkipButton={true}
            showProgress={true}
            disableBeacon={true}
            disableOverlayClose={true}
            hideCloseButton={false} // Show the close button in the top-right corner
            hideFooter={false} // Show the footer with the "Back" button
            placement={"top"}
            spotlightClicks={false}
            run={runTour} // Control whether the tour is running
            stepIndex={stepIndex} // Control the current step
            callback={handleJoyrideCallback} // Listen to Joyride events
            styles={{
              options: {
                // modal arrow and background color
                arrowColor: theme.palette.primary.contrastText,
                backgroundColor: theme.palette.primary.main,
                // page overlay color
                overlayColor: "rgba(0, 0, 0, 0.4)",
                //button color
                primaryColor: theme.palette.primary.main,
                //text color
                textColor: theme.palette.primary.contrastText,
                //width of modal
                width: 500,
                //zindex of modal
                zIndex: 1000,
              },
              buttonNext: {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                // Additional custom styles...
              },
              buttonBack: {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                // Additional custom styles...
              },
              // Define additional styles for other parts of the modal...
            }}
          />
        )}

        <Grid item xs={12} md={2}>
          <form onSubmit={handleSubmit}>
            <Autocomplete
              className="my-first-step"
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
                    // maxLength: 5, // Limit input length to 5 characters
                  }}
                  helperText={validationMessage} // Display validation message
                  error={!!validationMessage} // Show error style if validation message exists
                />
              )}
            />
            {hasDuplicates.map((duplicate, index) => (
              <Collapse in={true} key={`duplicate-${index}`}>
                <Alert
                  onClose={() => {
                    const updatedHasDuplicates = [...hasDuplicates];
                    updatedHasDuplicates.splice(index, 1);
                    setHasDuplicates(updatedHasDuplicates);
                  }}
                  severity="error"
                  sx={{ width: "100%", marginTop: "10px" }}
                >
                  Zip {duplicate.zip} already exists in Your Zips.
                </Alert>
              </Collapse>
            ))}
            {zipNotFounds.map((notFound, index) => (
              <Collapse in={true} key={`not-found-${index}`}>
                <Alert
                  onClose={() => {
                    const updatedZipNotFounds = [...zipNotFounds];
                    updatedZipNotFounds.splice(index, 1);
                    setZipNotFounds(updatedZipNotFounds);
                  }}
                  severity="error"
                  sx={{ width: "100%", marginTop: "10px" }}
                >
                  Zip {notFound.zip} does not exist in the data. Did you mean{" "}
                  {notFound.closestMatch}?
                </Alert>
              </Collapse>
            ))}
            {zipAddeds.map((added, index) => (
              <Collapse in={true} key={`added-${index}`}>
                <Alert
                  onClose={() => {
                    const updatedZipAddeds = [...zipAddeds];
                    updatedZipAddeds.splice(index, 1);
                    setZipAddeds(updatedZipAddeds);
                  }}
                  severity="success"
                  sx={{ width: "100%", marginTop: "10px" }}
                >
                  Zip {added.zip} added.
                </Alert>
              </Collapse>
            ))}
          </form>
        </Grid>
        <Grid item xs={12} md={10}>
          {(isTabletOrLarger || showAllFlag) && (
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
              //customize built-in buttons in the top-right of top toolbar
              renderToolbarInternalActions={({ table }) => (
                <Box
                  className="my-fifth-step"
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  {/* add custom button to print table  */}
                  <IconButton
                    onClick={() => {
                      window.print();
                    }}
                  >
                    <PrintIcon />
                  </IconButton>
                  {/* along-side built-in buttons in whatever order you want them */}
                  <MRT_ToggleGlobalFilterButton table={table} />
                  <MRT_ToggleDensePaddingButton table={table} />
                  <MRT_FullScreenToggleButton table={table} />
                  <MRT_ToggleFiltersButton table={table} />
                </Box>
              )}
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
                          className="my-second-step"
                          color="primary"
                          onClick={viewAllData}
                          sx={{ width: "60px", height: "60px" }}
                        >
                          <QueryStatsIcon />
                        </IconButton>
                      </Tooltip>
                      <Button
                        className="my-third-step"
                        variant="outlined"
                        color="primary"
                        startIcon={<DeleteSweepIcon />}
                        onClick={handleClearAll}
                      >
                        Clear All
                      </Button>
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
                  <Box className="my-fourth-step">
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
                      <Button className="my-fourth-step" onClick={exportToXLSX}>
                        <img
                          src={xlsxIcon}
                          alt="Export to XLSX"
                          style={{ width: "32px", height: "32px" }}
                        />
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>
              )}
            />
          )}
          {!isTabletOrLarger && !showAllFlag && (
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
              <Button
                variant="outlined"
                color="primary"
                startIcon={<DeleteSweepIcon />}
                onClick={handleClearAll}
              >
                Clear All
              </Button>
              <Cards data={dataToRender} removeRow={removeRow} />
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default RucaPage;
