import React, {useState, useRef} from 'react';
import { Box, TextField  } from '@mui/material';

// #region Client Side -----------------------
export const SearchBar = ({}) => {
  // #region Variable -----------------------
  const searchInputRef = useRef<HTMLInputElement>(null);
  // #endregion
  
  // #region State -----------------------
  const [isComposing, setIsComposing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  // #endregion

  // #region React Event -----------------------
  
  // #endregion


  // #region Screen Event -----------------------
  // #endregion

  // #region Logic -----------------------
  // #endregion

  // #region View -----------------------
  return (
    <Box 
      component="form"
      sx={{ 
        p: 2, 
        paddingLeft: '0px', 
        paddingRight: '0px', 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center'
      }}
      autoComplete="off"
      id="header"
    >
      <TextField 
        id="search-form" 
        label="番組タイトル・出演者で検索" 
        variant="standard" 
        value={searchInput}
        inputRef={searchInputRef}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isComposing) {
            e.preventDefault();
          }
        }}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        style={{ 
          width: '80%'
        }}
      />
    </Box>
  );
  // #endregion

};
// #endregion