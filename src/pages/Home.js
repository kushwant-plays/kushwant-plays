import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import AdSense from '../components/AdSense';

const Home = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFloatingSearch, setShowFloatingSearch] = useState(false);
  const [floatingSearchExpanded, setFloatingSearchExpanded] = useState(false);

  const navigate = useNavigate();

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
      .select('id, title, img, type, category, priority, created_at')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading games:', error);
      return;
    }
    
    // Cache the data
    localStorage.setItem('games_cache', JSON.stringify(data || []));
    localStorage.setItem('games_cache_time', Date.now().toString());
    setGames(data || []);
  };

  useEffect(() => {
    loadGamesWithCache(); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Real-time subscription for games
    const subscription = supabase
      .channel('games_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games' },
        async (payload) => {
          console.log('Database change detected:', payload);
          // Clear cache and reload games
          localStorage.removeItem('games_cache');
          localStorage.removeItem('games_cache_time');
          await loadGamesWithCache();
        }
      )
      .subscribe();
    
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
      setShowFloatingSearch(window.scrollY > 200 || searchTerm.length > 0);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    filterGames(); // eslint-disable-line react-hooks/exhaustive-deps
  }, [games, searchTerm, filter, categoryFilter]);

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
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(game => game?.category === categoryFilter);
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
          <button
            onClick={() => navigate('/about')}
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
          >
            About
          </button>

        </div>
      </header>

      <div className="disclaimer">
        <span>⚠️ Disclaimer: Kushwant Plays only provides external game links. No copyrighted files are hosted on this site.</span>
      </div>

      <main className="main">
        <h1>Free Games</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Search games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px 15px', borderRadius: '6px', border: 'none', width: '260px', fontSize: '14px' }}
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <div style={{ color: '#999', fontSize: '14px', alignSelf: 'center', marginRight: '10px' }}>Platform:</div>
          {['all', 'pc', 'android'].map(type => (
            <button 
              key={type}
              onClick={() => setFilter(type)}
              style={{ 
                padding: '8px 16px', 
                background: filter === type ? '#ff4747' : 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(255,255,255,0.2)', 
                borderRadius: '6px', 
                color: 'white', 
                cursor: 'pointer',
                fontSize: '13px',
                textTransform: 'capitalize'
              }}
            >
              {type === 'all' ? 'All' : type.toUpperCase()}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <div style={{ color: '#999', fontSize: '14px', alignSelf: 'center', marginRight: '10px' }}>Genre:</div>
          {['all', 'action', 'adventure', 'horror', 'rpg', 'strategy', 'racing', 'sports', 'puzzle', 'simulation'].map(category => (
            <button 
              key={category}
              onClick={() => setCategoryFilter(category)}
              style={{ 
                padding: '8px 16px', 
                background: categoryFilter === category ? '#4CAF50' : 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(255,255,255,0.2)', 
                borderRadius: '6px', 
                color: 'white', 
                cursor: 'pointer',
                fontSize: '13px',
                textTransform: 'capitalize'
              }}
            >
              {category === 'all' ? 'All Genres' : category === 'rpg' ? 'RPG' : category}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '35px' }}>
          <button 
            onClick={() => navigate('/request-game')}
            style={{ 
              padding: '12px 24px', 
              background: 'linear-gradient(45deg, #ff4747, #ff6b6b)', 
              border: 'none', 
              borderRadius: '8px', 
              color: 'white', 
              fontWeight: '600', 
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 4px 15px rgba(255,71,71,0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🎮 Request Game
          </button>
        </div>

        {/* AdSense Banner */}
        <div style={{ margin: '30px 0', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          <AdSense slot="1234567890" style={{ minHeight: '250px' }} />
        </div>

        <div className="gallery-grid">
          <a 
            className="gallery-item tutorial-item"
            href="https://drive.google.com/file/d/1ExdpITjQd-AumQhbghJqJwXrxcHbTjOV/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            style={{ cursor: 'pointer', display: 'block', textDecoration: 'none' }}
          >
            <img 
              src="/assets/playslogo.png" 
              alt="Tutorial: How to Download Games"
              style={{ width: '100%', height: '180px', borderRadius: '12px', objectFit: 'cover' }}
            />
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
          </a>
          
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
        
        {/* AdSense Banner */}
        <div style={{ margin: '40px 0', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          <AdSense slot="9876543210" style={{ minHeight: '300px' }} />
        </div>
      </main>

      {showFloatingSearch && (
        <div 
          onClick={() => setFloatingSearchExpanded(!floatingSearchExpanded)}
          style={{
            position: 'fixed',
            top: '140px',
            left: '20px',
            zIndex: 9999,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: floatingSearchExpanded ? '25px' : '50%',
            padding: floatingSearchExpanded ? '12px 20px' : '12px',
            border: '1px solid rgba(255,71,71,0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div style={{ fontSize: '16px' }}>🔍</div>
          {floatingSearchExpanded && (
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#fff', 
                outline: 'none', 
                fontSize: '14px',
                width: '150px'
              }}
              autoFocus
            />
          )}
        </div>
      )}
      
      {showScrollTop && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          ↑
        </button>
      )}
      
      <Footer />
    </div>
  );
};

export default Home;