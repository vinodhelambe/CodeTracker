import React from 'react';
import { Routes, Route, Navigate,useLocation } from 'react-router-dom';
import useStickyState from './hooks/useStickyState';
import Dashboard from './components/Dashboard';
import Resources from './components/Resources';
import Routine from './components/Routine';
import Problems from './components/problems';
import Viewpage from './components/Viewpage';
import './calendar.css';
import axios from 'axios';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import ForgetPassword from './pages/ForgetPassword';
import VerifyEmail from './pages/VerifyEmail';
import { ToastContainer, toast } from 'react-toastify';
import { AppContext  } from './context/AppContext';

function App() {
    const [resources, setResources] = useStickyState([], 'resources');
    const location = useLocation();
    const { isLoggedIn } = React.useContext(AppContext); // <-- FIXED

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <ToastContainer/>
            
            {location.pathname !== '/login' && location.pathname !== '/' && location.pathname !== "/reset-password" && location.pathname !== '/verify-Email' && <Navbar />}
            <main >
            <Routes>
                <Route path="/login" element={isLoggedIn ? <Navigate to="/Dashboard" replace /> : <LoginPage/>} />
                <Route path="/verify-Email" element={<VerifyEmail/>} />
                <Route path="/reset-password" element={<ForgetPassword/>} />
                <Route path="/" element={<Home/>} />
                <Route path="/Dashboard" element={<Dashboard resources={resources} />} />
                <Route path="/resources" element={<Resources resources={resources} setResources={setResources} />} />
                <Route path="/routine" element={<Routine />} />
                <Route path="/problems" element={<Problems />} />
                <Route path="/view/problem/:id" element={<Viewpage />} />
                <Route path="/view/resource/:id" element={<Viewpage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </main>
            
        </div>
        );
}

export default App;
