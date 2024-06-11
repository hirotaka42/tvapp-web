import React, { useState, useEffect} from 'react';

interface Content {
  type: string;
  content: {
    id: string;
    version: number;
    title: string;
    seriesID: string;
    endAt: number;
    broadcastDateLabel: string;
    isNHKContent: boolean;
    isSubtitle: boolean;
    ribbonID: number;
    seriesTitle: string;
    isAvailable: boolean;
    broadcasterName: string;
    productionProviderName: string;
  };
  rank: number;
}


export const ItemPageComponent: React.FC<{ itemInfo: Content }> = ({ itemInfo }) => {
    // #region Variable -----------------------
    // #endregion
    
    // #region State -----------------------
    // #endregion
  
    // #region React Event -----------------------
    useEffect(() => {
  
    }, []);
    // #endregion
  
  
    // #region Screen Event -----------------------
    // #endregion
  
    // #region Logic -----------------------
    // #endregion
  
    return (
      <>
      <h1>ItemPage</h1>
  
      </>
    );
}