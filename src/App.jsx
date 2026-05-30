import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import useAppStore from './store/useAppStore'
import Header from './components/Header'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'

const Home = lazy(() => import('./pages/Home'))
const MergePDF = lazy(() => import('./pages/MergePDF'))
const SplitPDF = lazy(() => import('./pages/SplitPDF'))
const CompressPDF = lazy(() => import('./pages/CompressPDF'))
const PDFToImage = lazy(() => import('./pages/PDFToImage'))
const ImageToPDF = lazy(() => import('./pages/ImageToPDF'))
const RotatePDF = lazy(() => import('./pages/RotatePDF'))
const Watermark = lazy(() => import('./pages/Watermark'))
const ProtectPDF = lazy(() => import('./pages/ProtectPDF'))

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid rgba(102,126,234,0.2)',
        borderTopColor: '#667eea',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</span>
    </div>
  )
}

export default function App() {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/merge" element={<MergePDF />} />
              <Route path="/split" element={<SplitPDF />} />
              <Route path="/compress" element={<CompressPDF />} />
              <Route path="/pdf-to-image" element={<PDFToImage />} />
              <Route path="/image-to-pdf" element={<ImageToPDF />} />
              <Route path="/rotate" element={<RotatePDF />} />
              <Route path="/watermark" element={<Watermark />} />
              <Route path="/protect" element={<ProtectPDF />} />
              <Route path="*" element={
                <div style={{ padding: '80px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>🐝</div>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Page not found</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>The page you're looking for doesn't exist.</p>
                  <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 28px', borderRadius: '12px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', fontWeight: 600 }}>
                    Back to Home
                  </Link>
                </div>
              } />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
