import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import SEO from '../components/SEO';

const Game = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  useEffect(() => {
    loadGame();
    loadComments();
    trackView();
  }, [id]);

  const loadGame = async () => {
    // Check cache first (15 minutes)
    const cached = localStorage.getItem(`game_${id}`);
    const cacheTime = localStorage.getItem(`game_${id}_time`);
    
    if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 900000) {
      setGame(JSON.parse(cached));
      return;
    }
    
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error loading game:', error);
      return;
    }
    
    // Cache the data
    localStorage.setItem(`game_${id}`, JSON.stringify(data));
    localStorage.setItem(`game_${id}_time`, Date.now().toString());
    setGame(data);
  };

  const loadComments = async () => {
    // Load only recent 20 comments to reduce reads
    const { data, error } = await supabase
      .from('comments')
      .select('id, username, text, created_at')
      .eq('game_id', id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Error loading comments:', error);
      return;
    }
    
    setComments(data || []);
  };

  const trackView = async () => {
    const key = `kp_view_${id}`;
    const last = localStorage.getItem(key);
    if (last && Date.now() - last < 24*60*60*1000) return;
    
    await supabase.rpc('increment_views', { game_id: id });
    localStorage.setItem(key, Date.now());
  };

  const trackDownload = async () => {
    await supabase.rpc('increment_downloads', { game_id: id });
  };

  const handleDownload = () => {
    if (!game?.download) {
      alert('Download link not available');
      return;
    }
    trackDownload();
    window.open(game.download, '_blank');
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    
    const { error } = await supabase
      .from('comments')
      .insert({
        game_id: id,
        username: 'Guest',
        text: newComment
      });
    
    if (error) {
      console.error('Error adding comment:', error);
      return;
    }
    
    setNewComment('');
    loadComments();
  };

  if (!game) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎮</div>
        <div style={{ fontSize: '18px' }}>Loading game...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <SEO 
        title={`${game.title} - Kushwant Plays`}
        description={game.description || `Download ${game.title} for free. ${game.type?.toUpperCase()} game available now.`}
        keywords={`${game.title}, ${game.type} game, free download, gaming`}
        image={game.img}
      />
      {/* Hero Section */}
      <div style={{ position: 'relative', height: '60vh', overflow: 'hidden' }}>
        <img src={game.img} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7))' }} />
        
        {/* Header */}
        <header style={{ position: 'absolute', top: 0, width: '100%', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src="/assets/playslogo.png" alt="Logo" style={{ height: '45px', borderRadius: '50%' }} />
            <h1 style={{ fontSize: '22px', margin: 0 }}>Kushwant Plays</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <a href="https://www.youtube.com/@kushwantplays" target="_blank" rel="noopener noreferrer" style={{ color: '#ff0000' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <button onClick={() => navigate('/games')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>← Back</button>
          </div>
        </header>
        
        {/* Game Title & Info */}
        <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <span style={{ background: game.type === 'pc' ? '#4CAF50' : '#FF9800', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
              {game.type?.toUpperCase()}
            </span>
            <span style={{ color: '#999' }}>👁️ {game.views || 0} views</span>
            <span style={{ color: '#999' }}>⬇️ {game.downloads || 0} downloads</span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: '700', margin: '0 0 15px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>{game.title}</h1>
          <button 
            onClick={handleDownload}
            style={{ background: 'linear-gradient(45deg, #ff4747, #ff6b6b)', border: 'none', color: '#fff', padding: '15px 40px', borderRadius: '30px', fontSize: '18px', fontWeight: '600', cursor: 'pointer', marginTop: '20px', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🎮 Download Game
          </button>
        </div>
      </div>
      
      {/* Content Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '60px' }}>
          {/* Main Content */}
          <div>
            {/* Trailer Section */}
            {game.trailer_url && (
              <div style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#ff4747' }}>🎬 Game Trailer</h2>
                <div style={{ position: 'relative', borderRadius: '15px', overflow: 'hidden', background: '#1a1a1a' }}>
                  <video 
                    controls 
                    style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                    poster={game.img}
                  >
                    <source src={game.trailer_url} type="video/mp4" />
                  </video>
                </div>
              </div>
            )}
            
            {/* Screenshots Section */}
            {game.screenshots && game.screenshots.length > 0 && (
              <div style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#ff4747' }}>📸 Screenshots</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {game.screenshots?.filter(Boolean).map((screenshot, index) => (
                    <div 
                      key={index}
                      style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }}
                      onClick={() => setSelectedScreenshot(screenshot)}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <img 
                        src={screenshot} 
                        alt={`Screenshot ${index + 1}`} 
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                           onMouseOver={(e) => e.target.style.opacity = 1}
                           onMouseOut={(e) => e.target.style.opacity = 0}>
                        <span style={{ color: '#fff', fontSize: '24px' }}>🔍</span>
                      </div>
                    </div>
                  )) || []}
                </div>
              </div>
            )}
            
            {/* Description Section */}
            <div style={{ marginBottom: '50px' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#ff4747' }}>📝 About This Game</h2>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '25px' }}>
                <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#ddd', margin: 0 }}>{game.description}</p>
              </div>
            </div>
            
            {/* Comments Section */}
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '30px', color: '#ff4747' }}>💬 Comments ({comments.length})</h2>
              
              {/* Add Comment */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '25px', marginBottom: '30px' }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this game..."
                  style={{ width: '100%', height: '100px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '15px', color: '#fff', fontSize: '16px', resize: 'none' }}
                />
                <button 
                  onClick={addComment}
                  style={{ background: '#ff4747', border: 'none', color: '#fff', padding: '12px 25px', borderRadius: '25px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '15px' }}
                >
                  Post Comment
                </button>
              </div>
              
              {/* Comments List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {comments.map(comment => (
                  <div key={comment.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ff4747', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👤</div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#ff4747' }}>{comment.username}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>{new Date(comment.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                    <p style={{ margin: 0, lineHeight: '1.6' }}>{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Requirements Sidebar */}
          <div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '30px', position: 'sticky', top: '20px' }}>
              <h3 style={{ color: '#ff4747', marginBottom: '20px' }}>⚙️ System Requirements</h3>
              {game.requirements ? (
                <div style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line', color: '#ddd' }}>
                  {game.requirements}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', fontSize: '14px', padding: '20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
                  <div>No system requirements specified for this game.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedScreenshot(null)}>
          <img src={selectedScreenshot} alt="Screenshot" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '10px' }} />
          <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer' }} onClick={() => setSelectedScreenshot(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default Game;