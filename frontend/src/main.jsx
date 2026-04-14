import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight:'100vh', display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          background:'#0a0f0d', color:'white', fontFamily:'sans-serif',
          padding:24, textAlign:'center', gap:16,
        }}>
          <div style={{ fontSize:48 }}>🅿</div>
          <h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>Something went wrong</h2>
          <p style={{ color:'#6b7280', fontSize:14, margin:0 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button onClick={() => window.location.href='/'} style={{
            marginTop:8, padding:'10px 24px', borderRadius:12,
            background:'#14b371', border:'none', color:'white',
            fontWeight:700, fontSize:14, cursor:'pointer',
          }}>Go Home</button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
