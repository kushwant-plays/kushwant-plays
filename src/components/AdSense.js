import React, { useEffect } from 'react';

const AdSense = ({ slot, style = {}, format = 'auto', responsive = true }) => {
  useEffect(() => {
    try {
      if (window.adsbygoogle && window.adsbygoogle.loaded) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.log('AdSense error:', error);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{
        display: 'block',
        textAlign: 'center',
        minHeight: '100px',
        ...style
      }}
      data-ad-client="ca-pub-5302998986096245"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
  );
};

export default AdSense;