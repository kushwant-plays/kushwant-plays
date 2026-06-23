import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../config/supabase';

const Index = () => {
  const navigate = useNavigate();
  const [topGames, setTopGames] = useState([]);

  useEffect(() => {
    const images = document.querySelectorAll('.bg-slideshow img');
    let currentIndex = 0;

    const showNextImage = () => {
      images[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % images.length;
      images[currentIndex].classList.add('active');
    };

    const interval = setInterval(showNextImage, 3000);
    loadTopGames();
    return () => clearInterval(interval);
  }, []);
  
  const loadTopGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('id, title, img, type')
      .order('priority', { ascending: false })
      .limit(3);
    setTopGames(data || []);
  };

  return (
    <div className="index-page">
      <SEO 
        title="Kushwant Plays - Free Games Download"
        description="Your ultimate destination for free PC and Android games. Download the latest games and enjoy gaming entertainment."
        keywords="free games, PC games, Android games, game download, gaming, Kushwant Plays"
      />
      <div className="bg-slideshow">
        <img src="/assets/bg1.jpg" className="active" alt="" />
        <img src="/assets/bg2.jpg" alt="" />
        <img src="/assets/bg3.jpg" alt="" />
      </div>

      <button 
        onClick={() => navigate('/about')}
        style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          background: 'rgba(255,255,255,0.1)', 
          color: '#fff', 
          border: '1px solid rgba(255,255,255,0.2)', 
          padding: '10px 20px', 
          borderRadius: '8px', 
          cursor: 'pointer', 
          fontSize: '14px',
          fontWeight: '500',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.2)';
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.1)';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        About
      </button>

      <div className="index-content">
        <div className="logo-section">
          <img src="/assets/playslogo.png" alt="Kushwant Plays" className="index-logo" />
          <h1 className="index-title">Kushwant Plays</h1>
          <p className="index-description">Your ultimate destination for free games</p>
        </div>

        <div className="social-links"></div>

        <button className="enter-btn" onClick={() => navigate('/games')}>
          View Games
        </button>
        
        {topGames.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#ff4747', textAlign: 'center', marginBottom: '15px', fontSize: '16px', fontWeight: '600' }}>
              🔥 Featured
            </h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {topGames.map(game => (
                <div 
                  key={game.id}
                  onClick={() => navigate(`/game/${game.id}`)}
                  style={{ 
                    width: '100px',
                    background: 'rgba(0,0,0,0.4)', 
                    borderRadius: '8px', 
                    overflow: 'hidden', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    border: '1px solid rgba(255,71,71,0.2)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img 
                    src={game.img || '/assets/playslogo.png'} 
                    alt={game.title}
                    style={{ width: '100%', height: '60px', objectFit: 'cover' }}
                    onError={(e) => e.target.src = '/assets/playslogo.png'}
                  />
                  <div style={{ padding: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#fff' }}>
                      {game.title.length > 10 ? game.title.substring(0, 10) + '...' : game.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;