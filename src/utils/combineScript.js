const fs = require("fs"); // Use the standard 'fs' module for createReadStream
const csv = require("csv-parser");
const fsPromises = require("fs/promises"); // For promise-based file operations
const path = require("path"); // Path module for consistent paths

// Base directory for data files
const dataDir = path.resolve(__dirname, "../../public/data");

// File paths for the input datasets
const zipToRucaFile = path.join(dataDir, "zips_to_ruca.csv");
const zipToFipsFile = path.join(dataDir, "zips_to_fips.csv");
const fipsToCountiesFile = path.join(dataDir, "fips_to_counties.csv");
// Output file
const outputFile = path.join(dataDir, "combined_dataset.json");

// Function to normalize keys (trim whitespace)
function normalizeKeys(row) {
  const normalizedRow = {};
  for (const key in row) {
    //   console.log('key', key)
    const trimmedKey = key.trim(); // Trim whitespace from keys
    normalizedRow[trimmedKey] = row[key];
  }
  return normalizedRow;
}

// Adjust loadCsv for fipsToCounties to normalize keys
async function loadCsv(filePath, normalize = false) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        results.push(normalize ? normalizeKeys(data) : data);
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}
// Combine datasets
async function combineDatasets() {
  console.log("Combining....");
  try {
    // Step 1: Load all datasets
    const zipToRuca = await loadCsv(zipToRucaFile, true); // ZIP to RUCA scores

    const zipToFips = await loadCsv(zipToFipsFile, true); // ZIP to FIPS mapping
    const fipsToCounties = await loadCsv(fipsToCountiesFile, true); // FIPS to counties mapping

    // Step 2: Create mappings for faster lookups
    const zipToFipsMap = zipToFips.reduce((map, row) => {
      const zipKey = String(row.zip); // Ensure the key is a string
      if (!map[zipKey]) map[zipKey] = [];
      map[zipKey].push(row); // Handle 1-to-many relationships
      return map;
    }, {});

    // console.log("fipstocounties", fipsToCounties);
    const fipsToCountyMap = fipsToCounties.reduce((map, row) => {
      const fipsKey = `${row["State Code"]}${row["County Code"]}`;
      map[fipsKey] = row;
      return map;
    }, {});

    // console.log("zipToFipsmap", zipToFipsMap);
    // Step 3: Merge datasets
    const combinedResults = zipToRuca.map((rucaRow) => {
      const zip = rucaRow.ZIP_CODE;
      const fipsRecords = zipToFipsMap[zip] || [];
      const counties = fipsRecords
        .map((fipsRecord) => {
          const fipsKey = fipsRecord.county.padStart(5, "0"); // Ensure FIPS is 5 digits
          const county = fipsToCountyMap[fipsKey] || null;
          return county
            ? {
                ...county,
                res_ratio: fipsRecord.res_ratio,
                bus_ratio: fipsRecord.bus_ratio,
                oth_ratio: fipsRecord.oth_ratio,
                tot_ratio: fipsRecord.tot_ratio,
              }
            : null;
        })
        .filter(Boolean); // Remove nulls if no matching county found

      return {
        ...rucaRow,
        counties, // Add array of county data
      };
    });

    // Step 4: Save the combined results to a JSON file
    await fsPromises.writeFile(
      outputFile,
      JSON.stringify(combinedResults, null, 2),
      "utf8"
    );
    console.log(`Combined dataset saved as '${outputFile}'`);
  } catch (error) {
    console.error("Error combining datasets:", error);
  }
}

// Execute the script
combineDatasets();
