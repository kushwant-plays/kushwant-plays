import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload() {
    window.location.reload();
  }

  handleGoHome() {
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          background: '#0a0a0a', 
          color: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>💥</div>
            <h1 style={{ color: '#ff4747', marginBottom: '20px' }}>Oops! Something went wrong</h1>
            <p style={{ color: '#999', marginBottom: '30px', lineHeight: '1.6' }}>
              The page encountered an error. Please try refreshing or go back to the home page.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                onClick={this.handleReload}
                style={{ 
                  background: '#ff4747', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '12px 24px', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🔄 Refresh Page
              </button>
              <button 
                onClick={this.handleGoHome}
                style={{ 
                  background: '#333', 
                  color: '#fff', 
                  border: '1px solid #555', 
                  padding: '12px 24px', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🏠 Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;