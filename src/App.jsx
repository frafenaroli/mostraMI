import { Routes, Route, useLocation } from 'react-router-dom';
import { ExhibitsProvider } from './lib/ExhibitsContext';
import HomePage from './pages/HomePage';
import ArchivioPage from './pages/ArchivioPage';
import SearchPage from './pages/SearchPage';
import ExhibitModal from './pages/ExhibitModal';

function App() {
  const location = useLocation();
  // Popup deep-links (/mostra/:id) render on top of the page they were opened
  // from. A direct visit (no backgroundLocation in history state) falls back
  // to showing the home page underneath.
  const backgroundLocation =
    location.state?.backgroundLocation ??
    (location.pathname.startsWith('/mostra/') ? { ...location, pathname: '/', search: '', state: null } : null);

  return (
    <ExhibitsProvider>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/mostre" element={<ArchivioPage />} />
        <Route path="/cerca" element={<SearchPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Routes>
        <Route path="/mostra/:id" element={<ExhibitModal />} />
      </Routes>
    </ExhibitsProvider>
  );
}

export default App;
