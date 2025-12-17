import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'Kushwant Plays - Free Games Download',
  description = 'Download free PC and Android games. Your ultimate destination for gaming entertainment.',
  keywords = 'free games, PC games, Android games, game download, gaming',
  image = '/assets/playslogo.png',
  url = window.location.href
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Kushwant Plays" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;