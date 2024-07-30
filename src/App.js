import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home.js';
import EditorPage from './pages/EditorPage.js';
import axios from "axios";

import Register from './UserLogReg/register_page/register.jsx';
import UserRegister from './UserRegLog/register.jsx';
import UserLogin from './UserRegLog/login.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('isLoggedIn');
    return saved === 'true' || false;
  });

  useEffect(() => {
    // Check if user is authenticated on page load
    const accessToken = sessionStorage.getItem('accessToken');
    if (accessToken) {
      axios.post("http://localhost:5000/dashboard", null, {
        headers: {
          accessToken: accessToken,
        },
      })
      .then((response) => {
        if (response.data.error) {
          console.log(response.data.error);
        } else {
          setIsLoggedIn(true);
        }
      })
      .catch(error => {
        console.error("Error authenticating:", error);
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  return (
    <div className="App">
      <div>
        <Toaster position="top-right"
          toastOptions={{
            success: {
              iconTheme: {
                primary: '#4aed88',
              }
            }
          }}
        />
      </div>
      <Router>
        <Routes>
          <Route path="/" element={<UserLogin setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user" element={<UserRegister />} />
          {isLoggedIn ? (
            <Route path="/dashboard" element={<Home />} />
          ) : (
            <Route path="/dashboard" element={<Navigate to="/login" />} />
          )}
          <Route path="/editor/:roomId" element={<EditorPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
