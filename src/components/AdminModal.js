import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AdminModal = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pc',
    download: '',
    img: '',
    priority: 0
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

  useEffect(() => {
    if (isOpen) {
      checkAuth();
      loadGames();
    }
  }, [isOpen]);

  useEffect(() => {
    // Listen for auth changes
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
    const { data } = await supabase
      .from('games')
      .select('*')
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
      const { error } = await supabase
        .from('games')
        .insert(formData);
      
      if (error) throw error;
      
      setStatus('✅ Game added successfully!');
      setFormData({ title: '', description: '', type: 'pc', download: '', img: '', priority: 0 });
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
      setStatus('✅ Game deleted');
      loadGames();
    }
  };

  const updatePriority = async (id, priority) => {
    const { error } = await supabase
      .from('games')
      .update({ priority })
      .eq('id', id);
    
    if (!error) loadGames();
  };

  if (!isOpen) return null;

  const isAdmin = user && user.email === ADMIN_EMAIL;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#1a1a1a',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90%',
        overflow: 'auto',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid #333'
        }}>
          <h2 style={{ color: '#ff4747', margin: 0 }}>🔐 Admin Panel</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {!user ? (
            <div style={{ maxWidth: '300px', margin: '0 auto' }}>
              <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px' }}>
                {isSignUp ? 'Create Admin Account' : 'Admin Sign In'}
              </h3>
              <form onSubmit={signInWithEmail}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '10px',
                    borderRadius: '6px',
                    border: '1px solid #333',
                    background: '#2a2a2a',
                    color: '#fff'
                  }}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '15px',
                    borderRadius: '6px',
                    border: '1px solid #333',
                    background: '#2a2a2a',
                    color: '#fff'
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: '#4285f4',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Loading...' : (isSignUp ? '📝 Sign Up' : '🔐 Sign In')}
                </button>
              </form>
              <p style={{ textAlign: 'center', marginTop: '15px', color: '#999' }}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4285f4',
                    cursor: 'pointer',
                    marginLeft: '5px',
                    textDecoration: 'underline'
                  }}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          ) : !isAdmin ? (
            <div style={{ textAlign: 'center', color: '#ff4747' }}>
              <p>❌ Access Denied</p>
              <p>Signed in as: {user.email}</p>
              <button onClick={signOut} style={{ background: '#ff4747', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}>
                Sign Out
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ color: '#4CAF50', margin: 0 }}>✅ Welcome, {user.email}</p>
                <button onClick={signOut} style={{ background: '#ff4747', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                  Sign Out
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {['add', 'manage', 'stats'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: activeTab === tab ? '#ff4747' : '#333',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {tab === 'add' ? '➕ Add Game' : tab === 'manage' ? '⚙️ Manage' : '📊 Stats'}
                  </button>
                ))}
              </div>

              {activeTab === 'add' && (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <input
                      type="text"
                      placeholder="Game Title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                      required
                    />
                    <textarea
                      placeholder="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', minHeight: '80px', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', flex: 1 }}
                      >
                        <option value="pc">PC</option>
                        <option value="android">Android</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Priority"
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', width: '100px' }}
                      />
                    </div>
                    <input
                      type="url"
                      placeholder="Image URL"
                      value={formData.img}
                      onChange={(e) => setFormData({...formData, img: e.target.value})}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                      required
                    />
                    <input
                      type="url"
                      placeholder="Download URL"
                      value={formData.download}
                      onChange={(e) => setFormData({...formData, download: e.target.value})}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        background: '#4CAF50',
                        color: '#fff',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                      }}
                    >
                      {loading ? 'Adding...' : '➕ Add Game'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'manage' && (
                <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                  <p style={{ color: '#fff', marginBottom: '15px' }}>Total Games: {games.length}</p>
                  {games.map(game => (
                    <div key={game.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      background: '#2a2a2a',
                      borderRadius: '6px',
                      marginBottom: '10px'
                    }}>
                      <img src={game.img} alt="" style={{ width: '50px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ flex: 1, color: '#fff' }}>
                        <div style={{ fontWeight: 'bold' }}>{game.title}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>{game.type?.toUpperCase()} • Views: {game.views} • Downloads: {game.downloads}</div>
                      </div>
                      <input
                        type="number"
                        value={game.priority}
                        onChange={(e) => updatePriority(game.id, parseInt(e.target.value) || 0)}
                        style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
                        title="Priority"
                      />
                      <button
                        onClick={() => deleteGame(game.id)}
                        style={{ background: '#ff4747', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'stats' && (
                <div style={{ color: '#fff' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>{games.length}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>Total Games</div>
                    </div>
                    <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>{games.filter(g => g.type === 'pc').length}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>PC Games</div>
                    </div>
                    <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>{games.filter(g => g.type === 'android').length}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>Android Games</div>
                    </div>
                    <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9C27B0' }}>{games.reduce((sum, g) => sum + (g.views || 0), 0)}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>Total Views</div>
                    </div>
                  </div>
                  
                  <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '6px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#ff4747' }}>Top 5 Games by Views</h4>
                    {games
                      .sort((a, b) => (b.views || 0) - (a.views || 0))
                      .slice(0, 5)
                      .map((game, i) => (
                        <div key={game.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 4 ? '1px solid #333' : 'none' }}>
                          <span>{game.title}</span>
                          <span style={{ color: '#4CAF50' }}>{game.views || 0} views</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {status && (
                <p style={{ 
                  marginTop: '15px', 
                  padding: '10px', 
                  borderRadius: '6px',
                  background: status.includes('✅') ? '#1B5E20' : '#B71C1C',
                  color: '#fff'
                }}>
                  {status}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;