import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import Footer from '../components/Footer';

const About = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: '20px' }}>
      <SEO 
        title="About - Kushwant Plays"
        description="Learn about Kushwant Plays - your trusted source for free PC and Android games. Safe downloads and gaming content."
        keywords="about kushwant plays, game developer, safe downloads, gaming content creator"
      />
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ background: '#333', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginBottom: '30px' }}
        >
          ← Back to Home
        </button>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '12px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <img src="/assets/playslogo.png" alt="Kushwant Plays" style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '20px' }} />
            <h1 style={{ color: '#ff4747', margin: '0 0 10px 0' }}>About Kushwant Plays</h1>
            <p style={{ color: '#999', fontSize: '18px' }}>Your trusted source for free gaming content</p>
          </div>

          <div style={{ display: 'grid', gap: '30px' }}>
            <section>
              <h2 style={{ color: '#4CAF50', marginBottom: '15px' }}>🎮 Who We Are</h2>
              <p style={{ lineHeight: '1.6', color: '#ccc' }}>
                Kushwant Plays is a gaming content platform dedicated to providing safe, free access to PC and Android games. 
                We curate and share gaming content to help gamers discover new experiences without the hassle.
              </p>
            </section>

            <section>
              <h2 style={{ color: '#4CAF50', marginBottom: '15px' }}>🛡️ Safety & Trust</h2>
              <p style={{ lineHeight: '1.6', color: '#ccc' }}>
                • All game links are carefully reviewed before posting<br/>
                • We only provide external download links - no files hosted directly<br/>
                • Regular content updates and maintenance<br/>
                • Community-driven game requests and feedback
              </p>
            </section>

            <section>
              <h2 style={{ color: '#4CAF50', marginBottom: '15px' }}>📞 Contact Information</h2>
              <p style={{ lineHeight: '1.6', color: '#ccc', marginBottom: '20px' }}>
                Need help or have questions? Reach out to us through any of these channels:
              </p>
              <div style={{ display: 'grid', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '24px' }}>📧</span>
                  <div>
                    <strong>Email:</strong> prady346@gmail.com<br/>
                    <small style={{ color: '#999' }}>For business inquiries, game requests, or support</small>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '24px' }}>💬</span>
                  <div>
                    <strong>WhatsApp:</strong> <a href="https://wa.me/918639529977" target="_blank" rel="noopener noreferrer" style={{ color: '#ff4747' }}>Chat with us</a><br/>
                    <small style={{ color: '#999' }}>Quick support and instant replies</small>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '24px' }}>📱</span>
                  <div>
                    <strong>Instagram:</strong> <a href="https://www.instagram.com/kushwant_plays/" target="_blank" rel="noopener noreferrer" style={{ color: '#ff4747' }}>@kushwant_plays</a><br/>
                    <small style={{ color: '#999' }}>DM us for help, updates, and community</small>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '24px' }}>🎮</span>
                  <div>
                    <strong>Discord:</strong> <a href="https://discord.gg/Ezfk9D7Z2Q" target="_blank" rel="noopener noreferrer" style={{ color: '#ff4747' }}>Join our server</a><br/>
                    <small style={{ color: '#999' }}>Get help from community and moderators</small>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '24px' }}>🎥</span>
                  <div>
                    <strong>YouTube:</strong> <a href="https://www.youtube.com/@kushwantplays" target="_blank" rel="noopener noreferrer" style={{ color: '#ff4747' }}>@kushwantplays</a><br/>
                    <small style={{ color: '#999' }}>Gaming videos and tutorials</small>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 style={{ color: '#4CAF50', marginBottom: '15px' }}>⚖️ Disclaimer</h2>
              <p style={{ lineHeight: '1.6', color: '#999', fontSize: '14px' }}>
                Kushwant Plays only provides external game links and does not host any copyrighted files. 
                All games are linked from their original sources. We respect intellectual property rights 
                and will remove any content upon valid copyright claims.
              </p>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;