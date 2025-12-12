
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './components/Login';
import { Upload } from './components/Upload';
import { Gallery } from './components/Gallery';
import { Display } from './components/Display';
import { Settings } from './components/Settings';
import { AdminLayout } from './components/AdminLayout';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route - Slideshow */}
          <Route path="/" element={<Display />} />

          {/* Public Route - Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/upload" element={<Upload />} />
            <Route path="/admin/gallery" element={<Gallery />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
export default App;
