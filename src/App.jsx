import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom';
import { ExhibitsProvider } from './lib/ExhibitsContext';
import HomePage from './pages/HomePage';
import ArchivioPage from './pages/ArchivioPage';
import ExhibitPage from './pages/ExhibitPage';

// New pages start at the top; back/forward keeps the browser's restored scroll.
function ScrollToTop() {
  const { pathname } = useLocation();
  const type = useNavigationType();
  useEffect(() => {
    if (type === 'PUSH') window.scrollTo(0, 0);
  }, [pathname, type]);
  return null;
}

// Old /cerca?q= links now land on the calendar's search.
function SearchRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/mostre${search}`} replace />;
}

function App() {
  return (
    <ExhibitsProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mostre" element={<ArchivioPage />} />
        <Route path="/mostra/:id" element={<ExhibitPage />} />
        <Route path="/cerca" element={<SearchRedirect />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </ExhibitsProvider>
  );
}

export default App;
