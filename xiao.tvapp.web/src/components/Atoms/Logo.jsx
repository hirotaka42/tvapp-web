import React from 'react';

export const Logo = () => {
  const tverLogoURLx1 = process.env.NEXT_PUBLIC_TVER_IMAG_LOGO;
  
  return (
    <img
      onClick={() => window.location.href="/"}
      src={tverLogoURLx1}
      srcSet={`${tverLogoURLx1} 1x, ${tverLogoURLx1} 2x`}
      alt="TVer" 
      style={{ 
        width: '81px', 
        height: '59px',
        marginRight: '20px'
      }}
    />
  );
};