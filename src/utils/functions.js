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
