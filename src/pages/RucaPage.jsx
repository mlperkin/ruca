/* eslint-disable react/jsx-pascal-case */
import { useState, useEffect, useRef } from "react";
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
import Box from "@mui/material/Box";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ShowChartIcon from "@mui/icons-material/ShowChart";
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
import { exportToCSV, exportToXLSX } from "../utils/functions";
import InfoIcon from "@mui/icons-material/Info";

const RucaPage = ({
  mode,
  runTour,
  setRunTour,
  showAllFlag,
  setShowAllFlag,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState([]); //basic RUCA data
  const [validationMessage, setValidationMessage] = useState("");
  // const [showAllFlag, setShowAllFlag] = useState(false);
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
        "Add a singular ZIP or a list of ZIP codes. Either separated by spaces or commas. You can also add more granular (ZIP+4) ZIP codes",
      disableBeacon: true,
      // disableOverlayClose: true,
      // hideCloseButton: true,
      // hideFooter: true,
      placement: "top",
      spotlightClicks: true,
    },
    {
      target: ".my-second-step",
      content:
        "Toggle between all the ZIP codes data available and your ZIP list",
    },
    {
      target: ".my-third-step",
      content: "Clear out your entire current list of ZIPS",
    },
    {
      target: ".my-fourth-step",
      content: "Export table to CSV or XLSX",
    },
    {
      target: ".my-fifth-step",
      content: "More advanced table features",
    },
    {
      target: ".my-sixth-step",
      content: "Toggle dark/light mode",
    },
    {
      target: ".my-seventh-step",
      content: "Replay this guided tour",
    },
    // Add more steps as needed
  ];

  // Create event handlers for the Joyride callback
  const handleJoyrideCallback = (data) => {
    const { status, type, index, action } = data;
    if (status === "finished" || status === "skipped") {
      // If the tour is finished or skipped, stop running the tour
      // setRun(false);
      setRunTour(false);
      setStepIndex(0);
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

  const getRucaDescription = (rucaValue, rucaType) => {
    // Define your RUCA descriptions mapping
    let rucaDescriptions = {};

    if (rucaType === "ruca1") {
      rucaDescriptions = {
        1: "Metropolitan area core: primary flow within an urbanized area (UA)",
        2: "Metropolitan area high commuting: primary flow 30% or more to a UA",
        3: "Metropolitan area low commuting: primary flow 10% to 30% to a UA",
        4: "Micropolitan area core: primary flow within an Urban Cluster of 10,000 to 49,999 (large UC)",
        5: "Micropolitan high commuting: primary flow 30% or more to a large UC",
        6: "Micropolitan low commuting: primary flow 10% to 30% to a large UC",
        7: "Small town core: primary flow within an Urban Cluster of 2,500 to 9,999 (small UC)",
        8: "Small town high commuting: primary flow 30% or more to a small UC",
        9: "Small town low commuting: primary flow 10% to 30% to a small UC",
        10: "Rural areas: primary flow to a tract outside a UA or UC",
        99: "Not coded: Census tract has zero population and no rural-urban identifier information",
      };
    } else if (rucaType === "ruca2") {
      rucaDescriptions = {
        1: "Metropolitan area core: primary flow within an urbanized area (UA)",
        1.1: "Secondary flow 30% to 50% to a larger UA",
        2: "Metropolitan area high commuting: primary flow 30% or more to a UA",
        2.1: "Secondary flow 30% to 50% to a larger UA",
        3: "Metropolitan area low commuting: primary flow 10% to 30% to a UA",
        4: "Micropolitan area core: primary flow within an Urban Cluster of 10,000 to 49,999 (large UC)",
        4.1: "Secondary flow 30% to 50% to a UA",
        5: "Micropolitan high commuting: primary flow 30% or more to a large UC",
        5.1: "Secondary flow 30% to 50% to a UA",
        6: "Micropolitan low commuting: primary flow 10% to 30% to a large UC",
        7: "Small town core: primary flow within an Urban Cluster of 2,500 to 9,999 (small UC)",
        7.1: "Secondary flow 30% to 50% to a UA",
        7.2: "Secondary flow 30% to 50% to a large UC",
        8: "Small town high commuting: primary flow 30% or more to a small UC",
        8.1: "Secondary flow 30% to 50% to a UA",
        8.2: "Secondary flow 30% to 50% to a large UC",
        9: "Small town low commuting: primary flow 10% to 30% to a small UC",
        10: "Rural areas: primary flow to a tract outside a UA or UC",
        10.1: "Secondary flow 30% to 50% to a UA",
        10.2: "Secondary flow 30% to 50% to a large UC",
        10.3: "Secondary flow 30% to 50% to a small UC",
        99: "Not coded: Census tract has zero population and no rural-urban identifier information",
      };
    }

    return rucaDescriptions[rucaValue] || "Description not available";
  };

  const columns = [
    {
      header: "Combined Results",
      accessorKey: "combinedResults",
    },
    {
      header: "Counties",
      accessorKey: "counties",
      enableClickToCopy: false,
      Cell: ({ cell }) => {
        // Extract county names from the array
        const counties = cell.getValue();
        const countyNames = counties
          .map((county) => county["County Name"])
          .join(", ");
        return <span>{countyNames}</span>; // Display as a comma-separated list
      },
    },

    {
      header: "Zip",
      accessorKey: "ZIP_CODE",
      enableClickToCopy: false,
    },
    {
      header: "RUCA1",
      accessorKey: "RUCA1",
      enableClickToCopy: false,
      Cell: ({ cell }) => (
        <Tooltip title={getRucaDescription(cell.getValue(), "ruca1")} arrow>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
            }}
          >
            {cell.getValue()}
            <InfoIcon fontSize="small" />
          </span>
        </Tooltip>
      ),
    },
    {
      header: "RUCA2",
      accessorKey: "RUCA2",
      enableClickToCopy: false,
      Cell: ({ cell }) => (
        <Tooltip title={getRucaDescription(cell.getValue(), "ruca2")} arrow>
          <span>{cell.getValue()}</span>
        </Tooltip>
      ),
    },
    { header: "State", accessorKey: "STATE", enableClickToCopy: false },
    { header: "Zip Type", accessorKey: "ZIP_TYPE", enableClickToCopy: false },
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

    if (_runTour !== "false") {
      setRunTour(true);
      setStepIndex(0);
    } else {
      // setRunTour(false)
    }

    const fetchData = async () => {
      // Get the latest version identifier from your server.
      // You need to host the identifier somewhere, e.g., as a separate file or as part of an API response.
      const latestVersion = await fetch("/zipRucaDataVersion.txt").then((res) =>
        res.text()
      );

      const storedVersion = localStorage.getItem("rawDataVersion");
      // const storedRawData = localStorage.getItem("rawData");

      //First get basic RUCA data
      // If the stored version is different from the latest version, update the data.
      if (latestVersion !== storedVersion ) {
        fetch("/data/combined_dataset.json")
          .then((response) => response.json())
          .then((jsonData) => {
            setAllRucaData(jsonData);
            // localStorage.setItem("rawData", JSON.stringify(jsonData));
            localStorage.setItem("rawDataVersion", latestVersion);
          })
          .catch((error) => {
            console.error("Error loading JSON data:", error);
          });
      } else {
        // setData(JSON.parse(storedRawData));
        // setAllRucaData(JSON.parse(storedRawData));
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

      const newUniqueData = matchingData.filter(async (newItem) => {
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
      setRunTour(false);
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
  let dataToRender = showAllFlag ? allRucaData : results;
  // if (!showAllFlag) {
  // Modify your data to include the 'combinedResults' property. This is for the click to copy to work
  dataToRender = dataToRender.map((row) => {
    return {
      ...row,
      combinedResults: [
        row.ZIP_CODE,
        row.RUCA1,
        row.RUCA2,
        row.STATE,
        row.ZIP_TYPE,
      ].join(", "),
    };
  });
  // }
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
                zIndex: 1000000,
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
                      <Button onClick={() => exportToCSV(results)}>
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
                <Button onClick={() => exportToCSV(results)}>
                  <img
                    src={csvIcon}
                    alt="Export to CSV"
                    style={{ width: "32px", height: "32px" }}
                  />
                </Button>
              </Tooltip>
              <Tooltip title={"Export to XLSX"} placement="top">
                <Button onClick={() => exportToXLSX(results)}>
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
