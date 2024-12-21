/* eslint-disable react/jsx-pascal-case */
import { useState, useEffect, useRef } from "react";
import {
  Alert,
  Collapse,
  TextField,
  Divider,
  Grid,
  Button,
  Tooltip,
  IconButton,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";

import csvIcon from "../assets/csv.png";
import xlsxIcon from "../assets/xlsx.png";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import useMediaQuery from "@mui/material/useMediaQuery";
import Cards from "../components/Cards";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import Joyride from "react-joyride";

import { useTheme } from "@mui/material/styles";
import {
  exportToCSV,
  exportToXLSX,
  getRuca,
  processZipCodes,
  filterOptions,
} from "../utils/functions";
import { steps } from "../utils/tourSteps";
import RucaTable from "../components/RucaTable";
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

  const [selectedRatio, setSelectedRatio] = useState("res_ratio");

  // Tooltip descriptions for each ratio type
  const ratioDescriptions = {
    res_ratio:
      "Residential Ratio: The proportion of residential population in the county.",
    bus_ratio: "Business Ratio: The proportion of businesses in the county.",
    oth_ratio:
      "Other Ratio: The proportion of non-residential, non-business entities.",
    tot_ratio:
      "Total Ratio: Combined proportion of all categories in the county.",
  };

  const ratioLabels = {
    res_ratio: "Residential Ratio",
    bus_ratio: "Business Ratio",
    oth_ratio: "Other Ratio",
    tot_ratio: "Total Ratio",
  };

  // Access the theme object
  const theme = useTheme();

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

  useEffect(() => {
    const _runTour = localStorage.getItem("runTour");

    if (_runTour !== "false") {
      setRunTour(true);
      setStepIndex(0);
    } else {
      // setRunTour(false)
    }

    const fetchData = async () => {
      fetch("/data/combined_dataset.json")
        .then((response) => response.json())
        .then((jsonData) => {
          setAllRucaData(jsonData);
          console.log("json response", jsonData);
        })
        .catch((error) => {
          console.error("Error loading JSON data:", error);
        });

      //get previous searched zips "Your Zips" list from localstorage
      const storedResultsData = localStorage.getItem("resultsData");
      let parsedResultsData = [];

      // Safely parse and verify the structure
      try {
        parsedResultsData = storedResultsData
          ? JSON.parse(storedResultsData)
          : [];
        if (!Array.isArray(parsedResultsData)) {
          console.warn(
            "Stored resultsData is not an array. Resetting to empty array."
          );
          parsedResultsData = [];
        }
      } catch (error) {
        console.error("Error parsing resultsData from localStorage:", error);
        parsedResultsData = [];
      }

      // Normalize the data
      parsedResultsData = parsedResultsData.map((entry) => ({
        ...entry,
        counties: entry.counties || [], // Ensure `counties` key exists
      }));

      // Save normalized data back to localStorage
      localStorage.setItem("resultsData", JSON.stringify(parsedResultsData));

      // Use normalized data
      // console.log("Normalized Results Data:", parsedResultsData);

      if (parsedResultsData.length > 0) {
        setShowAllFlag(false);
        setResults(parsedResultsData);
      }
    };

    fetchData();
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

  const handleSubmit = async (event) => {
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

    for (const zip of validZipCodes) {
      const { matchingData, zipNotFound, closestMatch } = getRuca(
        zip,
        allRucaData
      );

      if (zipNotFound) {
        newZipNotFounds.push({ zip, closestMatch });
      }

      // Filter out duplicates in a synchronous manner
      for (const newItem of matchingData) {
        const duplicate = updatedResults.some(
          (existingItem) => existingItem.ZIP_CODE === newItem.ZIP_CODE
        );

        if (duplicate) {
          newHasDuplicates.push({ zip });
          tempHighlightedZipCodes.push(zip);
        } else {
          newZipAddeds.push({ zip });
          updatedResults.push(newItem); // Add new unique item
        }
      }
    }

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
    }, 10000);
  };

  const handleClearAll = () => {
    // Clear all logic goes here
    setResults([]);
    clearAlerts();
    localStorage.setItem("resultsData", []);
  };

  // Create options with labels that include ZIP_CODE and STATE, and value as ZIP_CODE
  const zipCodeOptions = allRucaData.map((item) => ({
    label: `${item.ZIP_CODE}`, // Display both ZIP_CODE and STATE in the label
    value: item.ZIP_CODE, // Use ZIP_CODE as the value
  }));

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
        // paddingTop: "3rem",
        ml: 3,
        mr: 3,
        mt: { xs: 10, sm: 3 },
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
          {/* Info Icon */}
          <Tooltip
            placement="top"
            title={
              <>
                <Typography variant="body2">
                  You can enter a single ZIP code (e.g., 27045) or
                  multiple ZIP codes separated by commas or white spaces.
                </Typography>
              </>
            }
            arrow
          >
            <IconButton>
              <InfoIcon />
            </IconButton>
          </Tooltip>
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
                  placeholder="Ex. 28363, 20500, 27045"
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
          {/* Ratio Selection Buttons */}
          <Box
            sx={{
              mb: 2,
              mt: 2,
              display: "flex",
              gap: 1,
              flexDirection: "column",
            }}
          >
            {" "}
            <Divider sx={{ width: "100%", mb: 0 }} />
            <Typography
              variant="subtitle2"
              sx={{
                // fontWeight: "bold",
                textAlign: "center",
                textTransform: "uppercase",
              }}
            >
              County Ratio Type
            </Typography>
            {Object.keys(ratioDescriptions).map((ratioKey) => (
              <Tooltip
                placement="top"
                key={ratioKey}
                title={ratioDescriptions[ratioKey]}
                arrow
              >
                <Button
                  variant={
                    selectedRatio === ratioKey ? "contained" : "outlined"
                  }
                  onClick={() => setSelectedRatio(ratioKey)}
                >
                  {ratioLabels[ratioKey].replace("_", " ").toUpperCase()}
                </Button>
              </Tooltip>
            ))}
            <Divider sx={{ width: "100%", mb: 2, mt: 1 }} />
          </Box>
        </Grid>
        <Grid item xs={12} md={10}>
          {(isTabletOrLarger || showAllFlag) && (
            <RucaTable
              showAllFlag={showAllFlag}
              dataToRender={dataToRender}
              removeRow={removeRow}
              handleClearAll={handleClearAll}
              isTabletOrLarger={isTabletOrLarger}
              highlightedZipCodes={highlightedZipCodes}
              mode={mode}
              results={results}
              setShowAllFlag={setShowAllFlag}
              setRunTour={setRunTour}
              selectedRatio={selectedRatio}
              ratioLabels={ratioLabels}
              setResults={setResults}
            />
          )}

          {!isTabletOrLarger && !showAllFlag && (
            <>
              {/* <Tooltip title={"Export to CSV"} placement="top">
                <Button onClick={() => exportToCSV(results)}>
                  <img
                    src={csvIcon}
                    alt="Export to CSV"
                    style={{ width: "32px", height: "32px" }}
                  />
                </Button>
              </Tooltip> */}
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
                // variant="outlined"
                color="primary"
                startIcon={<DeleteSweepIcon />}
                onClick={handleClearAll}
              >
                Clear All
              </Button>
              <Cards
                data={dataToRender}
                removeRow={removeRow}
                selectedRatio={selectedRatio}
                ratioLabels={ratioLabels}
              />
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default RucaPage;
