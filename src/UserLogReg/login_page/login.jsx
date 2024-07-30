import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: "",
        password: ""
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setUser({
            ...user,
            [name]: value
        });
    };

    const login = () => {
        const { username, password } = user;
        if (username && password) {
            axios.post("http://localhost:5000/login", {
                username,
                password
            },{
                headers: {
                    accessToken: sessionStorage.getItem('accessToken'),
                },
            })
            .then((response) => {
                if (response.data.error) {
                    alert(response.data.error);
                } else {
                    sessionStorage.setItem('accessToken', response.data.accessToken);
                    localStorage.setItem('isLoggedIn', 'true'); // Persist login state
                    setIsLoggedIn(true); // Update isLoggedIn state
                    navigate('/dashboard');
                }
            })
            .catch(error => {
                console.error("Error logging in:", error);
                if (error.response && error.response.data) {
                    alert(error.response.data.message); // Display specific error message from server
                } else {
                    alert("An error occurred. Please try again."); // Default error message
                }
            });
        } else {
            alert("Invalid Input");
        }
    };

    return (
        <div className="LoginPage">
            <h1>Login Page</h1>
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" value={user.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" value={user.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <button onClick={login}>Login</button>
            </div>
            <h3>OR</h3>
            <button onClick={() => navigate('/register')}>Register</button>
        </div>
    );
}

export default Login;
