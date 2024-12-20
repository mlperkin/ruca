import Papa from "papaparse";
import { saveAs } from "file-saver";
import { Workbook } from "exceljs";

export const exportToCSV = (results) => {
  // Format each row to handle complex fields dynamically
  const formattedResults = results.map(formatComplexFields);

  // Convert the formatted results array to CSV using PapaParse
  const csvData = Papa.unparse(formattedResults);

  // Create a Blob from the CSV data
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });

  // Use FileSaver to save the generated CSV file
  saveAs(blob, "rucaZIP_Export.csv");
};

export const exportToXLSX = async (results) => {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  // Format each row to handle complex fields dynamically
  const formattedResults = results.map(formatComplexFields);

  // Write data to the worksheet
  worksheet.columns = Object.keys(formattedResults[0]).map((key) => ({
    header: key,
    key,
  }));
  worksheet.addRows(formattedResults);

  // Optional: Set column widths or apply formatting
  worksheet.columns.forEach((col) => {
    col.width = Math.max(
      col.header.length,
      ...formattedResults.map((row) => String(row[col.key] || "").length)
    );
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

function formatComplexFields(row) {
  const formattedRow = {};
  for (const key in row) {
    const value = row[key];
    if (Array.isArray(value)) {
      // Convert arrays of objects or values into a comma-separated string
      formattedRow[key] = value
        .map((item) => (typeof item === "object" ? JSON.stringify(item) : item))
        .join(", ");
    } else if (typeof value === "object" && value !== null) {
      // Convert objects into JSON strings
      formattedRow[key] = JSON.stringify(value);
    } else {
      // Leave other values as they are
      formattedRow[key] = value;
    }
  }
  return formattedRow;
}

export const getRuca = (input, allRucaData) => {
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

export const getRucaDescription = (rucaValue, rucaType) => {
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

export function processZipCodes(input) {
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


// Define a custom filter function with a 2-minimum-character limit
export const filterOptions = (options, { inputValue }) => {
  const MIN_CHARACTERS = 2;
  // If the input value's length is less than 2 characters, return an empty array
  if (inputValue.length < MIN_CHARACTERS) {
    return [];
  }

  const lowerInputValue = inputValue.toLowerCase();
  return options.filter((option) =>
    option.value.toLowerCase().startsWith(lowerInputValue)
  );
};
