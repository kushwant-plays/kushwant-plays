import React, { useState } from 'react';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';

const RequestGame = () => {
  const [formData, setFormData] = useState({
    game_name: '',
    user_name: '',
    user_email: '',
    platform: 'pc',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Add timestamp to the data
      const requestData = {
        ...formData,
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('game_requests')
        .insert([requestData]);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setStatus('✅ Game request submitted successfully!');
      setFormData({ game_name: '', user_name: '', user_email: '', platform: 'pc', description: '' });
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Request submission error:', error);
      setStatus('❌ Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#ff4747', margin: 0 }}>🎮 Request a Game</h1>
          <button onClick={() => navigate('/')} style={{ background: '#333', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
            ← Back to Home
          </button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '12px' }}>
          <p style={{ color: '#999', marginBottom: '25px' }}>
            Can't find the game you're looking for? Request it here and we'll try to add it to our collection!
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ff4747', fontWeight: '600' }}>
                Game Name *
              </label>
              <input
                type="text"
                name="game_name"
                value={formData.game_name}
                onChange={handleChange}
                placeholder="Enter the game name"
                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '16px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ff4747', fontWeight: '600' }}>
                Your Name *
              </label>
              <input
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                placeholder="Enter your name"
                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '16px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ff4747', fontWeight: '600' }}>
                Email (Optional)
              </label>
              <input
                type="email"
                name="user_email"
                value={formData.user_email}
                onChange={handleChange}
                placeholder="Enter your email (optional)"
                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '16px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ff4747', fontWeight: '600' }}>
                Platform *
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '16px' }}
                required
              >
                <option value="pc">PC</option>
                <option value="android">Android</option>
              </select>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#ff4747', fontWeight: '600' }}>
                Why do you want this game? (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us why you'd like this game added..."
                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '16px', minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ 
                width: '100%',
                background: loading ? '#666' : 'linear-gradient(45deg, #ff4747, #ff6b6b)', 
                color: '#fff', 
                border: 'none', 
                padding: '15px', 
                borderRadius: '8px', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                fontSize: '16px', 
                fontWeight: '600',
                opacity: loading ? 0.6 : 1 
              }}
            >
              {loading ? 'Submitting...' : '🎮 Submit Request'}
            </button>
          </form>

          {status && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              borderRadius: '8px',
              background: status.includes('✅') ? '#1B5E20' : '#B71C1C',
              color: '#fff',
              fontSize: '16px',
              textAlign: 'center'
            }}>
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestGame;