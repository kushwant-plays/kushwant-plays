import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer style={{ 
      background: '#1a1a1a', 
      borderTop: '1px solid rgba(255,255,255,0.1)', 
      padding: '40px 20px 20px', 
      marginTop: '60px' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '30px' }}>
          
          {/* Brand Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <img src="/assets/playslogo.png" alt="Kushwant Plays" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
              <h3 style={{ color: '#ff4747', margin: 0 }}>Kushwant Plays</h3>
            </div>
            <p style={{ color: '#999', fontSize: '14px', lineHeight: '1.6' }}>
              Your trusted source for free PC and Android games. Safe downloads and quality gaming content.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: '15px', fontSize: '16px' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#999', fontSize: '14px', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Home</button>
              <button onClick={() => navigate('/about')} style={{ background: 'none', border: 'none', color: '#999', fontSize: '14px', cursor: 'pointer', textAlign: 'left', padding: 0 }}>About</button>
              <button onClick={() => navigate('/request-game')} style={{ background: 'none', border: 'none', color: '#999', fontSize: '14px', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Request Game</button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: '15px', fontSize: '16px' }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="mailto:prady346@gmail.com" style={{ color: '#999', fontSize: '14px', textDecoration: 'none' }}>📧 prady346@gmail.com</a>

            </div>
          </div>


        </div>

        {/* Copyright */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            © 2024 Kushwant Plays. All rights reserved. | Safe gaming downloads & entertainment.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;