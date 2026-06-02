import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import './Admin.css';

const PASSWORD = 'kushwant123';

const EMPTY_FORM = { title: '', description: '', img: '', game_url: '', type: 'pc', category: 'action', priority: 0 };

const clearCache = () => {
  localStorage.removeItem('games_cache');
  localStorage.removeItem('games_cache_time');
};

const Admin = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1');
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const showMsg = (text, isError = false) => {
    setMsg({ text, isError });
    setTimeout(() => setMsg(null), 3000);
  };

  const fetchGames = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) showMsg('Failed to load games', true);
    else setGames(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) fetchGames();
  }, [authed, fetchGames]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pwInput === PASSWORD) {
      sessionStorage.setItem('admin_auth', '1');
      setAuthed(true);
    } else {
      setPwError(true);
    }
  };

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'priority' ? parseInt(value) || 0 : value }));
  };

  const startEdit = (game) => {
    setEditId(game.id);
    setForm({
      title: game.title || '',
      description: game.description || '',
      img: game.img || '',
      game_url: game.game_url || '',
      type: game.type || 'pc',
      category: game.category || 'action',
      priority: game.priority || 0,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form };

    let error;
    if (editId) {
      ({ error } = await supabase.from('games').update(payload).eq('id', editId));
    } else {
      ({ error } = await supabase.from('games').insert([payload]));
    }

    if (error) {
      showMsg(`Error: ${error.message}`, true);
    } else {
      clearCache();
      showMsg(editId ? 'Game updated!' : 'Game added!');
      cancelEdit();
      fetchGames();
    }
    setSaving(false);
  };

  const deleteGame = async (id) => {
    if (!window.confirm('Delete this game?')) return;
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (error) showMsg('Delete failed', true);
    else { clearCache(); showMsg('Game deleted'); fetchGames(); }
  };

  const filtered = games.filter(g =>
    g.title?.toLowerCase().includes(search.toLowerCase()) ||
    g.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (!authed) {
    return (
      <div className="admin-login">
        <form onSubmit={handleLogin} className="login-form">
          <h2>Admin Login</h2>
          <input
            type="password"
            placeholder="Password"
            value={pwInput}
            onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
            autoFocus
          />
          {pwError && <span className="error-msg">Incorrect password</span>}
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button className="logout-btn" onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false); }}>
          Logout
        </button>
      </div>

      {msg && <div className={`admin-msg ${msg.isError ? 'error' : 'success'}`}>{msg.text}</div>}

      <div className="admin-section">
        <h2>{editId ? '✏️ Edit Game' : '➕ Add New Game'}</h2>
        <form onSubmit={handleSubmit} className="game-form">
          <div className="form-row">
            <input name="title" placeholder="Game Title" value={form.title} onChange={handleField} required />
            <input name="img" placeholder="Image URL" value={form.img} onChange={handleField} required />
          </div>
          <div className="form-row">
            <input name="game_url" placeholder="Game URL (download/play link)" value={form.game_url} onChange={handleField} required />
            <input name="priority" type="number" placeholder="Priority (higher = first)" value={form.priority} onChange={handleField} />
          </div>
          <div className="form-row">
            <select name="type" value={form.type} onChange={handleField}>
              <option value="pc">PC</option>
              <option value="android">Android</option>
            </select>
            <select name="category" value={form.category} onChange={handleField}>
              {['action','adventure','horror','rpg','strategy','racing','sports','puzzle','simulation'].map(c => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <textarea name="description" placeholder="Game Description" value={form.description} onChange={handleField} rows={3} />
          <div className="form-actions">
            <button type="submit" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update Game' : 'Add Game'}</button>
            {editId && <button type="button" className="cancel-btn" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="admin-section">
        <div className="section-header">
          <h2>Manage Games ({filtered.length})</h2>
          <input
            className="search-input"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="admin-loading">Loading...</div>
        ) : (
          <div className="games-grid">
            {filtered.map((game) => (
              <div key={game.id} className="game-card">
                <img src={game.img || '/assets/playslogo.png'} alt={game.title} onError={(e) => e.target.src = '/assets/playslogo.png'} />
                <div className="game-card-info">
                  <h3>{game.title}</h3>
                  <div className="game-meta">
                    <span className={`badge ${game.type}`}>{game.type?.toUpperCase()}</span>
                    <span className="badge category">{game.category}</span>
                    <span className="badge priority">P: {game.priority}</span>
                  </div>
                  {game.description && <p>{game.description}</p>}
                </div>
                <div className="card-actions">
                  <button className="edit-btn" onClick={() => startEdit(game)}>Edit</button>
                  <button className="delete-btn" onClick={() => deleteGame(game.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
