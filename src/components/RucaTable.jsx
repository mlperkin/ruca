import MaterialReactTable, {
  MRT_ToggleDensePaddingButton,
  MRT_FullScreenToggleButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleGlobalFilterButton,
} from "material-react-table";
import PrintIcon from "@mui/icons-material/Print";
import { useRef } from "react";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import csvIcon from "../assets/csv.png";
import xlsxIcon from "../assets/xlsx.png";
import { exportToXLSX, exportToCSV, getRuca, getRucaDescription } from "../utils/functions";

function RucaTable({ showAllFlag, dataToRender, removeRow, handleClearAll, isTabletOrLarger, highlightedZipCodes, mode}) {
  let _showAllFlag = useRef(false);

  const viewAllData = () => {
    _showAllFlag.current = !_showAllFlag.current;
    if (_showAllFlag.current) {
      setShowAllFlag(true);
      setRunTour(false);
    } else {
      setShowAllFlag(false);
    }
  };

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
    { header: "State", accessorKey: "STATE", enableClickToCopy: false },
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
        <>
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
              {/* <HelpOutlineIcon fontSize="small" /> */}
            </span>
          </Tooltip>
          <Box>
            <Typography sx={{ fontSize: "10px" }}>
              {getRucaDescription(cell.getValue(), "ruca1")}
            </Typography>
          </Box>
        </>
      ),
    },
    {
      header: "RUCA2",
      accessorKey: "RUCA2",
      enableClickToCopy: false,
      Cell: ({ cell }) => (
        <>
          <Tooltip title={getRucaDescription(cell.getValue(), "ruca2")} arrow>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
              }}
            >
              {cell.getValue()}
            </span>
          </Tooltip>
          <Box>
            <Typography sx={{ fontSize: "10px" }}>
              {getRucaDescription(cell.getValue(), "ruca2")}
            </Typography>
          </Box>
        </>
      ),
    },

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

  return (
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
        sx: { maxHeight: "70vh" },
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
                // variant="outlined"
                color="primary"
                startIcon={<DeleteSweepIcon />}
                onClick={handleClearAll}
              >
                Clear
              </Button>
              <Typography
                variant={"h4"}
                sx={{
                  margin: "auto",
                  fontSize: isTabletOrLarger ? "2rem" : "1rem", // Smaller font size for smaller viewports
                }}
              >
                {/* Your Zips */}
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
  );
}

export default RucaTable;
