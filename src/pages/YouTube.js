import React, { useState, useEffect } from 'react';

const YouTube = () => {
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [activeTab, setActiveTab] = useState('videos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadYouTubeData();
  }, []);

  const loadYouTubeData = async () => {
    try {
      const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
      const CHANNEL_QUERY = 'kushwant20';
      
      // Find channel ID
      const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${CHANNEL_QUERY}&maxResults=1&key=${API_KEY}`);
      const searchData = await searchRes.json();
      
      if (!searchData.items?.length) throw new Error('Channel not found');
      
      const channelId = searchData.items[0].snippet.channelId;
      
      // Get channel details
      const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${channelId}&key=${API_KEY}`);
      const channelData = await channelRes.json();
      
      const uploadsPlaylist = channelData.items[0].contentDetails.relatedPlaylists.uploads;
      
      // Get videos
      const videosRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylist}&maxResults=50&key=${API_KEY}`);
      const videosData = await videosRes.json();
      
      // Get video details for duration
      const videoIds = videosData.items.map(item => item.snippet.resourceId.videoId).join(',');
      const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`);
      const detailsData = await detailsRes.json();
      
      // Separate videos and shorts
      const videosList = [];
      const shortsList = [];
      
      videosData.items.forEach((item, index) => {
        const details = detailsData.items[index];
        const duration = parseDuration(details?.contentDetails?.duration);
        
        const videoData = {
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
          publishedAt: item.snippet.publishedAt,
          duration: duration
        };
        
        if (duration < 60) {
          shortsList.push(videoData);
        } else {
          videosList.push(videoData);
        }
      });
      
      setVideos(videosList);
      setShorts(shortsList);
    } catch (error) {
      console.error('Error loading YouTube data:', error);
    }
    setLoading(false);
  };

  const parseDuration = (duration) => {
    if (!duration) return 0;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatDuration = (seconds) => {
    if (seconds >= 3600) {
      return new Date(seconds * 1000).toISOString().substr(11, 8);
    }
    return new Date(seconds * 1000).toISOString().substr(14, 5);
  };

  const openVideo = (videoId) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>
        Loading YouTube channel...
      </div>
    );
  }

  return (
    <div style={{ background: '#0f0f0f', color: '#fff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#ff4747', fontSize: '2.5rem' }}>Kushwant Plays Channel</h1>
          <p style={{ color: '#999' }}>@kushwant20</p>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', justifyContent: 'center' }}>
          <button
            onClick={() => setActiveTab('videos')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'videos' ? '#ff4747' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Videos ({videos.length})
          </button>
          <button
            onClick={() => setActiveTab('shorts')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'shorts' ? '#ff4747' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Shorts ({shorts.length})
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: activeTab === 'shorts' ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {(activeTab === 'videos' ? videos : shorts).map(video => (
            <div
              key={video.id}
              onClick={() => openVideo(video.id)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                ':hover': { transform: 'translateY(-5px)' }
              }}
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  style={{ width: '100%', height: activeTab === 'shorts' ? '200px' : '180px', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  background: 'rgba(0,0,0,0.8)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {formatDuration(video.duration)}
                </div>
              </div>
              <div style={{ padding: '15px' }}>
                <h3 style={{ fontSize: '14px', margin: '0 0 8px 0', lineHeight: '1.3' }}>{video.title}</h3>
                <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>
                  {new Date(video.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YouTube;