import React, { useState } from 'react';
import { TextField, IconButton, Tooltip, Dialog, DialogContent, DialogActions } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function SearchInput() {
  const [inputValue, setInputValue] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    // Submit logic here
    // console.log('Submitted:', inputValue);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Tooltip title="Open search">
        <IconButton onClick={handleOpenDialog}>
          <SearchIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogContent>
          <TextField
            label="Search"
            variant="outlined"
            value={inputValue}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Tooltip title="Submit search">
            <IconButton onClick={handleSubmit}>
              <SearchIcon />
            </IconButton>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SearchInput;