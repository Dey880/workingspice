import './App.css';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import TicketDetail from './pages/TicketDetail';
import CreateTicket from './pages/CreateTicket';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import AdminPortal from './pages/AdminPortal';
import HelpGuide from './pages/HelpGuide';
import { useSettings } from './contexts/SettingsContext';
import { useEffect } from 'react';

export default function App() {
  const { settings } = useSettings();
  
  useEffect(() => {
    if (settings.siteName) {
      document.title = settings.siteName;
    }
  }, [settings.siteName]);
  
  return  (
    <div className='wrapper'>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/tickets/:id' element={<TicketDetail />} />
        <Route path='/create-ticket' element={<CreateTicket />} />
        <Route path='/admin' element={<AdminPortal />} />
        <Route path='/help' element={<HelpGuide />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  );
};