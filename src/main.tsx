import { Component, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App';

class RootErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0B0B0A',
            color: '#EAE4D8',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div style={{ color: '#B79B68', letterSpacing: '0.2em', marginBottom: '14px' }}>
            ИММАНУИЛ КАНТ
          </div>
          <p style={{ maxWidth: '520px', lineHeight: 1.6, marginBottom: '20px' }}>
            Не удалось запустить графический режим в этом браузере.
          </p>
          <pre
            style={{
              maxWidth: '640px',
              fontSize: '12px',
              color: '#9a948a',
              whiteSpace: 'pre-wrap',
            }}
          >
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>
);
