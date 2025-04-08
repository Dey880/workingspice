import './App.css';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';

export default function App() {
  return  (
    <div className='wrapper'>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  );
};