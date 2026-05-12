import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import Landing from './components/Landing/Landing.jsx';
import Auth from './components/Auth/Auth.jsx';
import Home from './components/Home/Home.jsx';
import DailyPlan from './components/DailyPlan/DailyPlan.jsx';
import AIMealAdvisor from './components/AIMealAdvisor/AIMealAdvisor.jsx';
import WeeklyPlan from './components/WeeklyPlan/WeeklyPlan.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Auth />} />

              <Route path="/meals" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/daily-plan" element={<ProtectedRoute><DailyPlan /></ProtectedRoute>} />
              <Route path="/ai-advisor" element={<ProtectedRoute><AIMealAdvisor /></ProtectedRoute>} />
              <Route path="/weekly-plan" element={<ProtectedRoute><WeeklyPlan /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
