import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const Home = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);


  const navigate = useNavigate();

  useEffect(() => {
    loadGamesWithCache();
    
    // Background slideshow animation
    const images = document.querySelectorAll('.bg-slideshow img');
    let currentIndex = 0;

    const showNextImage = () => {
      images[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % images.length;
      images[currentIndex].classList.add('active');
    };

    const interval = setInterval(showNextImage, 3000);
    
    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        navigate('/admin');
      }
    };
    
    // Header and disclaimer scroll behavior
    const handleScroll = () => {
      const header = document.querySelector('.header');
      const disclaimer = document.querySelector('.disclaimer');
      
      if (window.scrollY > 50) {
        header.style.transform = 'translateY(-100%)';
        header.style.opacity = '0';
        disclaimer.style.top = '0';
      } else {
        header.style.transform = 'translateY(0)';
        header.style.opacity = '1';
        disclaimer.style.top = '80px';
      }
      
      setShowScrollTop(window.scrollY > 300);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [navigate]);

  useEffect(() => {
    filterGames();
  }, [games, searchTerm, filter]);

  const loadGamesWithCache = async () => {
    // Check cache first (5 minutes)
    const cached = localStorage.getItem('games_cache');
    const cacheTime = localStorage.getItem('games_cache_time');
    
    if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 300000) {
      setGames(JSON.parse(cached));
      return;
    }
    
    // Load from database
    const { data, error } = await supabase
      .from('games')
      .select('id, title, img, type, priority, created_at')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading games:', error);
      return;
    }
    
    // Cache the data
    localStorage.setItem('games_cache', JSON.stringify(data || []));
    localStorage.setItem('games_cache_time', Date.now().toString());
    console.log('All games:', data);
    setGames(data || []);
  };

  const filterGames = () => {
    let filtered = games || [];
    
    if (searchTerm) {
      filtered = filtered.filter(game => 
        game?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filter !== 'all') {
      filtered = filtered.filter(game => game?.type === filter);
    }
    
    setFilteredGames(filtered);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  return (
    <div>
      <SEO 
        title="Free Games - Kushwant Plays"
        description="Browse and download free PC and Android games. Discover the latest gaming content and entertainment."
        keywords="free games, PC games, Android games, game gallery, download games"
      />
      <div className="bg-slideshow">
        <img src="/assets/bg1.jpg" className="active" alt="" />
        <img src="/assets/bg2.jpg" alt="" />
        <img src="/assets/bg3.jpg" alt="" />
      </div>

      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/assets/playslogo.png" alt="Kushwant Plays" />
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#ff4747' }}>Kushwant Plays</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <a href="https://www.youtube.com/@kushwantplays" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#ff0000">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
          <a href="https://www.instagram.com/kushwant_plays/?hl=en" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
              <defs>
                <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f09433" />
                  <stop offset="25%" stopColor="#e6683c" />
                  <stop offset="50%" stopColor="#dc2743" />
                  <stop offset="75%" stopColor="#cc2366" />
                  <stop offset="100%" stopColor="#bc1888" />
                </linearGradient>
              </defs>
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a href="https://discord.gg/Ezfk9D7Z2Q" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#5865F2">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
            </svg>
          </a>
        </div>
      </header>

      <div className="disclaimer">
        <span>⚠️ Disclaimer: Kushwant Plays only provides external game links. No copyrighted files are hosted on this site.</span>
      </div>

      <main className="main">
        <h1>Free Games</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '35px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px 15px', borderRadius: '6px', border: 'none', width: '260px' }}
          />
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
            style={{ padding: '10px 18px', background: filter === 'all' ? '#ff4747' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white', cursor: 'pointer' }}
          >
            All
          </button>
          <button 
            className={filter === 'pc' ? 'active' : ''}
            onClick={() => setFilter('pc')}
            style={{ padding: '10px 18px', background: filter === 'pc' ? '#ff4747' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white', cursor: 'pointer' }}
          >
            PC
          </button>
          <button 
            className={filter === 'android' ? 'active' : ''}
            onClick={() => setFilter('android')}
            style={{ padding: '10px 18px', background: filter === 'android' ? '#ff4747' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white', cursor: 'pointer' }}
          >
            Android
          </button>
        </div>

        <div className="gallery-grid">
          <div className="gallery-item tutorial-item">
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <video 
                controls 
                preload="metadata"
                style={{ width: '100%', height: '180px', borderRadius: '12px', objectFit: 'cover' }}
                onClick={(e) => e.target.requestFullscreen()}
              >
                <source src="/assets/tutorial.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: '#fff',
                color: '#ff4747',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                boxShadow: '0 0 10px rgba(255,71,71,0.5)'
              }}>
                ⭐ Recommended
              </div>
              <div className="game-title">📺 Tutorial: How to Download Games</div>
            </div>
          </div>
          
          {filteredGames?.map((game, index) => {
            if (!game?.id || !game?.title) return null;
            return (
              <div 
                key={game.id} 
                className="gallery-item"
                onClick={() => navigate(`/game/${game.id}`)}
                style={{ position: 'relative' }}
              >
                <img 
                  src={game.img || '/assets/playslogo.png'} 
                  alt={game.title}
                  onError={(e) => e.target.src = '/assets/playslogo.png'}
                />
                {index === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: '#ff4747',
                    color: '#fff',
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    borderRadius: '6px',
                    boxShadow: '0 0 10px rgba(255,71,71,0.5)'
                  }}>
                    ⭐ Recommended
                  </div>
                )}
                <div className="game-title">{game.title}</div>
              </div>
            );
          })?.filter(Boolean)}
        </div>
      </main>

      {showScrollTop && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          ↑
        </button>
      )}



    </div>
  );
};

export default Home;