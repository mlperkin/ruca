import Dexie from "dexie";

// Initialize the database
export const db = new Dexie("RucaDatabase");

// Define the schema
db.version(1).stores({
  zipToRuca: "ZIP_CODE", // Primary key: ZIP_CODE
});

// Open the database
db.open().catch((err) => {
  console.error("Failed to open database:", err);
});

// Function to store combined data
export async function storeCombinedData(data) {
  try {
    // Use bulkPut to store the data
    await db.zipToRuca.bulkPut(
      data.map((entry) => ({
        ZIP_CODE: entry.ZIP_CODE,
        STATE: entry.STATE,
        ZIP_TYPE: entry.ZIP_TYPE,
        RUCA1: entry.RUCA1,
        RUCA2: entry.RUCA2,
        counties: entry.counties, // Store nested counties as-is
      }))
    );

    console.log("Data stored successfully in IndexedDB!");
  } catch (error) {
    console.error("Error storing data in IndexedDB:", error);
  }
}

// Function to query data by ZIP_CODE
export async function queryDataByZip(zipCode) {
  try {
    const result = await db.zipToRuca.get(zipCode); // Query by ZIP_CODE
    return result;
  } catch (error) {
    console.error("Error querying data:", error);
    return null;
  }
}
