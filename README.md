# Introduction

This is a backendless app and is built with `React v18`, `Material UI`, and heavily leans on `material-react-table`. On initial load, it fetches `zipRucaData.csv` and uses it for a data source and stores the data in localStorage. 

The main table is built with `material-react-table` that has many built-in functions to allow for reordering and copying cells. 

The basic idea is that the search zip textfield allows for a user to search the data source for a zip code and then appends to the material-react-table. You also have other options such as exporting the data.

# Updating data source

If a need to update the zip code data source occurs, then you will first need to entirely replace the `zipRucaData.csv` (or update the associated records ) file located in the public directory. To ensure the users are using the latest updated version, update the version number in `zipRucaDataVersion.txt`. This version number is stored in localStorage and is compared on initial laod. If the versions mismatch then a new fetch is made effectively updating the data source in the user's localStorage.

# How to run app

    npm run start

