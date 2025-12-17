import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pc',
    download: '',
    img: '',
    priority: 0,
    screenshots: '',
    trailer_url: '',
    requirements: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [manageFilter, setManageFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGame, setEditingGame] = useState(null);
  const [bulkData, setBulkData] = useState('');
  const [bulkUploading, setBulkUploading] = useState(false);
  const navigate = useNavigate();

  const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

  useEffect(() => {
    checkAuth();
    loadGames();
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const signInWithEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setStatus('❌ ' + error.message);
    } else if (isSignUp) {
      setStatus('✅ Check your email for verification link');
    } else {
      setStatus('✅ Signed in successfully');
    }
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const loadGames = async () => {
    // Load only essential fields for admin management
    const { data } = await supabase
      .from('games')
      .select('id, title, img, type, priority, views, downloads, created_at')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    setGames(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.email !== ADMIN_EMAIL) {
      setStatus('❌ Unauthorized');
      return;
    }

    setLoading(true);
    try {
      const gameData = {
        ...formData,
        screenshots: formData.screenshots ? formData.screenshots.split('\n').filter(url => url.trim()) : []
      };
      
      const { error } = await supabase
        .from('games')
        .insert(gameData);
      
      if (error) throw error;
      
      setStatus('✅ Game added successfully!');
      setFormData({ title: '', description: '', type: 'pc', download: '', img: '', priority: 0, screenshots: '', trailer_url: '', requirements: '' });
      loadGames();
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
    }
    setLoading(false);
  };

  const deleteGame = async (id) => {
    if (!window.confirm('Delete this game?')) return;
    
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);
    
    if (!error) {
      // Update local state immediately
      setGames(prevGames => prevGames.filter(g => g.id !== id));
      setStatus('✅ Game deleted');
      loadGames();
    } else {
      setStatus('❌ Error deleting game: ' + error.message);
    }
  };

  const updatePriority = async (id, newPriority) => {
    // Check if priority already exists
    const existingGame = games.find(g => g.priority === newPriority && g.id !== id);
    
    if (existingGame) {
      setStatus(`❌ Priority ${newPriority} already used by "${existingGame.title}"`);
      return;
    }
    
    const { error } = await supabase
      .from('games')
      .update({ priority: newPriority })
      .eq('id', id);
    
    if (!error) {
      // Update local state immediately
      setGames(prevGames => 
        prevGames.map(g => 
          g.id === id ? { ...g, priority: newPriority } : g
        ).sort((a, b) => (b.priority || 0) - (a.priority || 0))
      );
      setStatus(`✅ Priority updated to ${newPriority}`);
    }
  };

  const handleDrop = async (dropIndex) => {
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      return;
    }

    const newGames = [...games];
    const draggedGame = newGames[draggedItem];
    
    // Remove dragged item
    newGames.splice(draggedItem, 1);
    // Insert at new position
    newGames.splice(dropIndex, 0, draggedGame);
    
    // Update priorities based on new order
    const updates = newGames.map((game, index) => ({
      id: game.id,
      priority: newGames.length - index // Higher index = higher priority
    }));
    
    // Update all priorities in batch
    for (const update of updates) {
      await supabase
        .from('games')
        .update({ priority: update.priority })
        .eq('id', update.id);
    }
    
    // Update local state immediately
    setGames(newGames.sort((a, b) => (b.priority || 0) - (a.priority || 0)));
    setDraggedItem(null);
    setStatus('✅ Games reordered successfully!');
  };

  const updateGame = async (id, updatedData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('games')
        .update(updatedData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state immediately
      setGames(prevGames => 
        prevGames.map(g => 
          g.id === id ? { ...g, ...updatedData } : g
        ).sort((a, b) => (b.priority || 0) - (a.priority || 0))
      );
      
      setEditingGame(null);
      setStatus('✅ Game updated successfully!');
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const isAdmin = user && user.email === ADMIN_EMAIL;

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#ff4747', margin: 0 }}>🔐 Admin Dashboard</h1>
          <button onClick={() => navigate('/')} style={{ background: '#333', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
            ← Back to Home
          </button>
        </div>

        {!user ? (
          <div style={{ maxWidth: '400px', margin: '100px auto', background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '12px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
              {isSignUp ? 'Create Admin Account' : 'Admin Sign In'}
            </h2>
            <form onSubmit={signInWithEmail}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '16px' }}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '15px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '16px' }}
                required
              />
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', background: '#4285f4', color: '#fff', border: 'none', padding: '15px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Loading...' : (isSignUp ? '📝 Sign Up' : '🔐 Sign In')}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px', color: '#999' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                style={{ background: 'none', border: 'none', color: '#4285f4', cursor: 'pointer', marginLeft: '5px', textDecoration: 'underline' }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        ) : !isAdmin ? (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h2 style={{ color: '#ff4747' }}>❌ Access Denied</h2>
            <p>Signed in as: {user.email}</p>
            <button onClick={signOut} style={{ background: '#ff4747', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', marginTop: '20px' }}>
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px' }}>
              <p style={{ color: '#4CAF50', margin: 0, fontSize: '18px' }}>✅ Welcome, {user.email}</p>
              <button onClick={signOut} style={{ background: '#ff4747', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
                Sign Out
              </button>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
              {['add', 'bulk', 'manage', 'stats', 'performance'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: activeTab === tab ? '#ff4747' : '#333',
                    color: '#fff',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab === 'add' ? '➕ Add Game' : tab === 'bulk' ? '📦 Bulk Upload' : tab === 'manage' ? '⚙️ Manage Games' : tab === 'stats' ? '📊 Statistics' : '⚡ Performance'}
                </button>
              ))}
            </div>

            {activeTab === 'add' && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '12px' }}>
                <h2 style={{ marginBottom: '25px' }}>➕ Add New Game</h2>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <input
                      type="text"
                      name="title"
                      placeholder="Game Title"
                      value={formData.title}
                      onChange={handleChange}
                      style={{ padding: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '16px' }}
                      required
                    />
                    <input
                      type="url"
                      name="img"
                      placeholder="Image URL"
                      value={formData.img}
                      onChange={handleChange}
                      style={{ padding: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '16px' }}
                      required
                    />
                  </div>
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', minHeight: '100px', resize: 'vertical', marginTop: '20px', fontSize: '16px' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      style={{ padding: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '16px' }}
                    >
                      <option value="pc">PC</option>
                      <option value="android">Android</option>
                    </select>
                    <input
                      type="number"
                      name="priority"
                      placeholder="Priority"
                      value={formData.priority}
                      onChange={handleChange}
                      style={{ padding: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '16px' }}
                    />
                    <input
                      type="url"
                      name="download"
                      placeholder="Download URL"
                      value={formData.download}
                      onChange={handleChange}
                      style={{ padding: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '16px' }}
                    />
                  </div>
                  <input
                    type="url"
                    name="trailer_url"
                    placeholder="Trailer Video URL (optional)"
                    value={formData.trailer_url}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '16px', marginTop: '20px' }}
                  />
                  <textarea
                    name="screenshots"
                    placeholder="Screenshot URLs (one per line)"
                    value={formData.screenshots}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', minHeight: '80px', resize: 'vertical', marginTop: '20px', fontSize: '16px' }}
                  />
                  <textarea
                    name="requirements"
                    placeholder="System Requirements (e.g., OS: Windows 10, RAM: 8GB, etc.)"
                    value={formData.requirements}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', minHeight: '100px', resize: 'vertical', marginTop: '20px', fontSize: '16px' }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ background: '#4CAF50', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', marginTop: '25px', opacity: loading ? 0.6 : 1 }}
                  >
                    {loading ? 'Adding...' : '➕ Add Game'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'bulk' && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '12px' }}>
                <h2 style={{ marginBottom: '25px' }}>📦 Bulk Upload Games</h2>
                <p style={{ color: '#999', marginBottom: '20px' }}>Upload multiple games using JSON format. Each game should have: title, description, type, img, download, priority</p>
                
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#ff4747', marginBottom: '10px' }}>Example Format:</h4>
                  <pre style={{ background: '#2a2a2a', padding: '15px', borderRadius: '8px', fontSize: '12px', overflow: 'auto' }}>
{`[
  {
    "title": "Game 1",
    "description": "Description here",
    "type": "pc",
    "img": "https://example.com/image1.jpg",
    "download": "https://example.com/download1",
    "priority": 10,
    "screenshots": ["https://example.com/ss1.jpg", "https://example.com/ss2.jpg"],
    "trailer_url": "https://example.com/trailer.mp4"
  }
]`}
                  </pre>
                </div>
                
                <textarea
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  placeholder="Paste your JSON data here..."
                  style={{ width: '100%', height: '300px', padding: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '14px', fontFamily: 'monospace' }}
                />
                
                <button
                  onClick={async () => {
                    if (!bulkData.trim()) {
                      setStatus('❌ Please enter JSON data');
                      return;
                    }
                    
                    setBulkUploading(true);
                    try {
                      const games = JSON.parse(bulkData);
                      if (!Array.isArray(games)) {
                        throw new Error('Data must be an array of games');
                      }
                      
                      const { error } = await supabase
                        .from('games')
                        .insert(games);
                      
                      if (error) throw error;
                      
                      setStatus(`✅ Successfully uploaded ${games.length} games!`);
                      setBulkData('');
                      loadGames();
                    } catch (error) {
                      setStatus('❌ Error: ' + error.message);
                    }
                    setBulkUploading(false);
                  }}
                  disabled={bulkUploading}
                  style={{ background: '#4CAF50', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '8px', cursor: bulkUploading ? 'not-allowed' : 'pointer', fontSize: '16px', marginTop: '20px', opacity: bulkUploading ? 0.6 : 1 }}
                >
                  {bulkUploading ? 'Uploading...' : '📦 Upload Games'}
                </button>
              </div>
            )}

            {activeTab === 'manage' && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '12px' }}>
                <h2 style={{ marginBottom: '25px' }}>⚙️ Manage Games ({games.length})</h2>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, minWidth: '200px', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '16px' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['all', 'pc', 'android'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => setManageFilter(filter)}
                        style={{
                          background: manageFilter === filter ? '#ff4747' : '#333',
                          color: '#fff',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          textTransform: 'capitalize'
                        }}
                      >
                        {filter === 'all' ? `All (${games.length})` : `${filter.toUpperCase()} (${games.filter(g => g.type === filter).length})`}
                      </button>
                    ))}
                  </div>
                </div>
                
                <p style={{ color: '#999', marginBottom: '20px', fontSize: '14px' }}>💡 Drag and drop to reorder games</p>
                <div 
                  style={{ maxHeight: '600px', overflow: 'auto' }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    const container = e.currentTarget;
                    const rect = container.getBoundingClientRect();
                    const scrollThreshold = 50;
                    
                    if (e.clientY < rect.top + scrollThreshold) {
                      container.scrollTop -= 10;
                    } else if (e.clientY > rect.bottom - scrollThreshold) {
                      container.scrollTop += 10;
                    }
                  }}
                >
                  {games
                    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                    .filter(game => {
                      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesFilter = manageFilter === 'all' || game.type === manageFilter;
                      return matchesSearch && matchesFilter;
                    })
                    .map((game, index) => (
                    <div 
                      key={game.id} 
                      draggable
                      onDragStart={() => setDraggedItem(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDrop(index);
                      }}
                      onDragEnd={() => setDraggedItem(null)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '15px', 
                        padding: '15px', 
                        background: draggedItem === index ? '#3a3a3a' : '#2a2a2a', 
                        borderRadius: '8px', 
                        marginBottom: '15px',
                        cursor: 'grab',
                        border: draggedItem === index ? '2px dashed #ff4747' : '2px solid transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ color: '#666', fontSize: '18px', cursor: 'grab' }}>⋮⋮</div>
                      <img src={game.img} alt="" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{game.title}</div>
                        <div style={{ fontSize: '14px', color: '#999', marginTop: '5px' }}>
                          {game.type?.toUpperCase()} • Views: {game.views} • Downloads: {game.downloads} • Priority: {game.priority}
                        </div>
                      </div>
                      <input
                        type="number"
                        value={game.priority}
                        onChange={(e) => updatePriority(game.id, parseInt(e.target.value) || 0)}
                        style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: '12px' }}
                        title="Priority"
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setEditingGame(game)}
                          style={{ background: '#4CAF50', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteGame(game.id)}
                          style={{ background: '#ff4747', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '12px' }}>
                <h2 style={{ marginBottom: '25px' }}>📊 Statistics</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ background: '#2a2a2a', padding: '25px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>{games.length}</div>
                    <div style={{ fontSize: '14px', color: '#999', marginTop: '5px' }}>Total Games</div>
                  </div>
                  <div style={{ background: '#2a2a2a', padding: '25px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>{games.filter(g => g.type === 'pc').length}</div>
                    <div style={{ fontSize: '14px', color: '#999', marginTop: '5px' }}>PC Games</div>
                  </div>
                  <div style={{ background: '#2a2a2a', padding: '25px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>{games.filter(g => g.type === 'android').length}</div>
                    <div style={{ fontSize: '14px', color: '#999', marginTop: '5px' }}>Android Games</div>
                  </div>
                  <div style={{ background: '#2a2a2a', padding: '25px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9C27B0' }}>{games.reduce((sum, g) => sum + (g.views || 0), 0)}</div>
                    <div style={{ fontSize: '14px', color: '#999', marginTop: '5px' }}>Total Views</div>
                  </div>
                </div>
                
                <div style={{ background: '#2a2a2a', padding: '25px', borderRadius: '8px' }}>
                  <h3 style={{ margin: '0 0 20px 0', color: '#ff4747' }}>Top 10 Games by Views</h3>
                  {games
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 10)
                    .map((game, i) => (
                      <div key={game.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 9 ? '1px solid #333' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#999', minWidth: '20px' }}>#{i + 1}</span>
                          <span>{game.title}</span>
                        </div>
                        <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{game.views || 0} views</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '12px' }}>
                <h2 style={{ marginBottom: '25px' }}>⚡ Performance Monitoring</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px' }}>
                    <h4 style={{ color: '#4CAF50', marginBottom: '10px' }}>Page Load Times</h4>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {(() => {
                        const perfData = JSON.parse(localStorage.getItem('kushwant_performance') || '[]');
                        const avgLoadTime = perfData.length ? (perfData.reduce((sum, p) => sum + p.loadTime, 0) / perfData.length).toFixed(0) : 0;
                        return `Average: ${avgLoadTime}ms (${perfData.length} samples)`;
                      })()}
                    </div>
                  </div>
                  
                  <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px' }}>
                    <h4 style={{ color: '#2196F3', marginBottom: '10px' }}>User Interactions</h4>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {(() => {
                        const clickData = JSON.parse(localStorage.getItem('kushwant_clicks') || '[]');
                        return `Total clicks: ${clickData.length}`;
                      })()}
                    </div>
                  </div>
                </div>
                
                <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px' }}>
                  <h4 style={{ color: '#ff4747', marginBottom: '15px' }}>Recent Performance Data</h4>
                  <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                    {(() => {
                      const perfData = JSON.parse(localStorage.getItem('kushwant_performance') || '[]');
                      return perfData.slice(-10).reverse().map((perf, i) => (
                        <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #333', fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{perf.page}</span>
                            <span style={{ color: perf.loadTime > 3000 ? '#ff4747' : '#4CAF50' }}>{perf.loadTime}ms</span>
                          </div>
                          <div style={{ color: '#666', fontSize: '10px' }}>{new Date(perf.timestamp).toLocaleString()}</div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    localStorage.removeItem('kushwant_performance');
                    localStorage.removeItem('kushwant_clicks');
                    setStatus('✅ Performance data cleared');
                  }}
                  style={{ background: '#ff4747', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '20px' }}
                >
                  Clear Performance Data
                </button>
              </div>
            )}

            {status && (
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                borderRadius: '8px',
                background: status.includes('✅') ? '#1B5E20' : '#B71C1C',
                color: '#fff',
                fontSize: '16px'
              }}>
                {status}
              </div>
            )}
          </div>
        )}
        
        {/* Edit Game Modal */}
        {editingGame && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#1a1a1a', borderRadius: '12px', width: '90%', maxWidth: '600px', padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ color: '#ff4747', margin: 0 }}>✏️ Edit Game</h3>
                <button onClick={() => setEditingGame(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>✕</button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                updateGame(editingGame.id, {
                  title: e.target.title.value,
                  description: e.target.description.value,
                  type: e.target.type.value,
                  img: e.target.img.value,
                  download: e.target.download.value,
                  priority: parseInt(e.target.priority.value) || 0,
                  trailer_url: e.target.trailer_url.value,
                  screenshots: e.target.screenshots.value ? e.target.screenshots.value.split('\n').filter(url => url.trim()) : [],
                  requirements: e.target.requirements.value
                });
              }}>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <input name="title" defaultValue={editingGame.title} placeholder="Game Title" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }} required />
                  <textarea name="description" defaultValue={editingGame.description} placeholder="Description" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', minHeight: '80px', resize: 'vertical' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '10px' }}>
                    <select name="type" defaultValue={editingGame.type} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}>
                      <option value="pc">PC</option>
                      <option value="android">Android</option>
                    </select>
                    <input name="img" defaultValue={editingGame.img} placeholder="Image URL" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }} required />
                    <input name="priority" type="number" defaultValue={editingGame.priority} placeholder="Priority" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }} />
                  </div>
                  <input name="download" defaultValue={editingGame.download} placeholder="Download URL" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }} />
                  <input name="trailer_url" defaultValue={editingGame.trailer_url} placeholder="Trailer URL" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }} />
                  <textarea name="screenshots" defaultValue={editingGame.screenshots ? editingGame.screenshots.join('\n') : ''} placeholder="Screenshot URLs (one per line)" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', minHeight: '80px', resize: 'vertical' }} />
                  <textarea name="requirements" defaultValue={editingGame.requirements || ''} placeholder="System Requirements" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', minHeight: '80px', resize: 'vertical' }} />
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setEditingGame(null)} style={{ background: '#666', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" style={{ background: '#4CAF50', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer' }}>Save Changes</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;