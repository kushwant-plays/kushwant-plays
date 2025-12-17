import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Stats = () => {
  const [games, setGames] = useState([]);
  const [sortKey, setSortKey] = useState('views');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');

  useEffect(() => {
    loadGames();
    
    const subscription = supabase
      .channel('games')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, () => {
        loadGames();
      })
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, []);
  
  const loadGames = async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*');
    
    if (error) {
      console.error('Error loading games:', error);
      return;
    }
    
    setGames(data || []);
  };

  const stats = {
    total: games.length,
    pc: games.filter(g => g.type === 'pc').length,
    android: games.filter(g => g.type === 'android').length,
    totalViews: games.reduce((sum, g) => sum + (g.views || 0), 0),
    totalDownloads: games.reduce((sum, g) => sum + (g.downloads || 0), 0),
    avgPriority: games.length ? (games.reduce((sum, g) => sum + (g.priority || 0), 0) / games.length).toFixed(1) : 0
  };

  const platformData = {
    labels: ['PC', 'Android'],
    datasets: [{
      data: [stats.pc, stats.android],
      backgroundColor: ['#ff4747', '#333'],
      borderWidth: 0
    }]
  };

  const filteredGames = games
    .filter(g => g.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(g => platformFilter === 'all' || g.type === platformFilter)
    .sort((a, b) => {
      if (sortKey === 'title') {
        return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      }
      const valA = a[sortKey] || 0;
      const valB = b[sortKey] || 0;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  return (
    <div style={{ padding: '40px 70px', background: '#0d0d0d', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ color: '#ff4747', textAlign: 'center', fontSize: '2.8rem', marginBottom: '60px' }}>
        🎮 Kushwant Plays — Analytics Dashboard
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '35px', marginBottom: '70px' }}>
        {[
          { title: 'Total Games', value: stats.total },
          { title: 'PC Games', value: stats.pc },
          { title: 'Android Games', value: stats.android },
          { title: 'Avg Priority', value: stats.avgPriority },
          { title: 'Total Views', value: stats.totalViews },
          { title: 'Total Downloads', value: stats.totalDownloads }
        ].map((stat, i) => (
          <div key={i} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '35px 25px', textAlign: 'center' }}>
            <h2 style={{ color: '#ff4747', fontSize: '1.2rem', marginBottom: '10px' }}>{stat.title}</h2>
            <p style={{ fontSize: '2.4rem', fontWeight: '700', margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '50px', marginBottom: '60px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '18px', padding: '40px 30px' }}>
          <h3 style={{ textAlign: 'center', color: '#ff4747', marginBottom: '25px' }}>📊 Platform Distribution</h3>
          <Doughnut data={platformData} options={{ plugins: { legend: { labels: { color: '#fff' } } } }} />
        </div>
      </div>

      <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '18px', padding: '40px', maxWidth: '1000px', margin: '60px auto' }}>
        <h2 style={{ color: '#ff4747', textAlign: 'center', marginBottom: '25px' }}>🏆 All Games Performance</h2>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search game title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px 15px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', flex: 1, minWidth: '150px' }}
          />
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            style={{ padding: '10px 15px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', minWidth: '150px' }}
          >
            <option value="all">All Platforms</option>
            <option value="pc">PC</option>
            <option value="android">Android</option>
          </select>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ddd' }}>
          <thead>
            <tr>
              <th style={{ padding: '14px 12px', color: '#ff4747', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>#</th>
              <th style={{ padding: '14px 12px', color: '#ff4747', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer' }} onClick={() => handleSort('title')}>Game</th>
              <th style={{ padding: '14px 12px', color: '#ff4747', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer' }} onClick={() => handleSort('views')}>Views 👁️</th>
              <th style={{ padding: '14px 12px', color: '#ff4747', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer' }} onClick={() => handleSort('downloads')}>Downloads ⬇️</th>
              <th style={{ padding: '14px 12px', color: '#ff4747', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredGames.map((game, i) => (
              <tr key={game.id} style={{ ':hover': { background: 'rgba(255, 255, 255, 0.05)' } }}>
                <td style={{ padding: '14px 12px' }}>{i + 1}</td>
                <td style={{ padding: '14px 12px' }}>
                  <img src={game.img} alt="" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px', marginRight: '10px', verticalAlign: 'middle' }} />
                  {game.title}
                </td>
                <td style={{ padding: '14px 12px' }}>{game.views || 0}</td>
                <td style={{ padding: '14px 12px' }}>{game.downloads || 0}</td>
                <td style={{ padding: '14px 12px' }}>{game.type?.toUpperCase() || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stats;