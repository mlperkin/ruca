import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Grid } from "@mui/material";
import "leaflet/dist/leaflet.css";

// Example geocoding function (replace with an actual geocoding API)
const geocodeZip = async (zip) => {
  const geocodedLocations = {
    27045: [36.3, -80.2],
    28683: [36.5, -80.8],
    27455: [36.1, -79.8],
    "00001": [61.1, -149.9], // Fallback for unknown ZIPs
  };
  return geocodedLocations[zip] || null;
};

const MapComponent = ({ results }) => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const geocodedResults = await Promise.all(
        results.map(async (entry) => {
          const location = await geocodeZip(entry.ZIP_CODE);
          return location ? { ...entry, location } : null;
        })
      );
      setLocations(geocodedResults.filter(Boolean)); // Filter out null results
    };

    fetchLocations();
  }, [results]);

  return (
      <Grid container sx={{ mt: 5, justifyContent: 'center'}}>
      <Grid item xs={12} lg={6}>
        <MapContainer
          center={[37.8, -96]} // Center of the US
          zoom={5}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {locations.map((entry, index) => (
            <Marker key={index} position={entry.location}>
              <Popup>
                <strong>ZIP Code:</strong> {entry.ZIP_CODE}
                <br />
                <strong>State:</strong> {entry.STATE}
                <br />
                <strong>RUCA1:</strong> {entry.RUCA1}, <strong>RUCA2:</strong>{" "}
                {entry.RUCA2}
                <br />
                <strong>Counties:</strong>{" "}
                {entry.counties.length > 0
                  ? entry.counties
                      .map((county) => county["County Name"])
                      .join(", ")
                  : "No counties available"}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Grid>
    </Grid>
  );
};

export default MapComponent;
