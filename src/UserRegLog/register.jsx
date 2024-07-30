import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import './register.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css'; // For FontAwesome icons

const UserRegister = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: "",
        email: "",
        password: "",
        reEnterPassword: ""
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setUser({
            ...user,
            [name]: value
        });
    };

    const register = (event) => {
        event.preventDefault();
        const { username, email, password, reEnterPassword } = user;
        if (username && email && password && (password === reEnterPassword)) {
            axios.post("http://localhost:5000/register", {
                username,
                email,
                password
            })
                .then(res => {
                    console.log(res.data);
                    alert(res.data.message); // Display success message
                    navigate('/'); // Navigate to login page
                })
                .catch(error => {
                    console.error("Error registering:", error);
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
        <div className="mainContainer">
            <div className="container">
                <div className="logiform-container py-4">
                    <div className="flex-container d-flex flex-wrap justify-content-center bg-light p-0">
                        <div className="column d-block p-3 p-md-4 p-lg-5 getstarted-col">
                            <div className="d-flex gap-4 content p-3 px-md-4 py-md-5 px-lg-5 child-w-100 flex-wrap position-relative h-100 align-items-center">

                                <div className="text-content position-relative">
                                    <span className="text-secondary2">Hi Welcome!</span>
                                    <h1 className="text-white">Codify- Let's Code Together</h1>
                                    <p className="text-secondary2 mt-4">
                                        Join our community and be a part of Excellent Workspace where you find Dynamic Code editor with Exceptional functionalites...
                                    </p>
                                </div>
                                <div className="content-icon position-relative">
                                    <img
                                        src="https://cdn.pixabay.com/photo/2016/06/15/16/16/man-1459246_1280.png"
                                        alt=""
                                        className="w-100"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="column d-block p-3 d-flex align-items-center justify-content-center h-100">
                            <div className="content">
                                <div className="form-wrapper py-4">
                                    <h2 className="mb-4">Sign Up</h2>
                                    <form onSubmit={register}>
                                        <div className="form-input mb-3 p-0">
                                            <label htmlFor="yourName" className="text-secondary">
                                                Your Username
                                            </label>
                                            <div className="input-relative position-relative mt-1 mt-lg-2">
                                                <input
                                                    type="text"
                                                    className="default-input rounded-pill py-1 ps-3 py-lg-2 input-required"
                                                    name="username"
                                                    id="yourName"
                                                    value={user.username}
                                                    onChange={handleChange}
                                                    maxLength="20"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-input mb-3 p-0">
                                            <label htmlFor="yourEmail" className="text-secondary">
                                                Your Email
                                            </label>
                                            <div className="input-relative position-relative mt-1 mt-lg-2">
                                                <input
                                                    type="email"
                                                    className="default-input rounded-pill py-1 ps-3 py-lg-2 input-required"
                                                    name="email"
                                                    id="yourEmail"
                                                    value={user.email}
                                                    onChange={handleChange}
                                                    maxLength="40"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-input mb-3 p-0">
                                            <label htmlFor="yourPassword" className="text-secondary">
                                                Your Password
                                            </label>
                                            <div className="input-relative position-relative mt-1 mt-lg-2">
                                                <input
                                                    type="password"
                                                    className="default-input rounded-pill py-1 ps-3 py-lg-2 input-required"
                                                    name="password"
                                                    id="yourPassword"
                                                    value={user.password}
                                                    onChange={handleChange}
                                                    required
                                                    maxLength="40"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-input mb-3 p-0">
                                            <label htmlFor="reEnterPassword" className="text-secondary">
                                                Re-Enter Password
                                            </label>
                                            <div className="input-relative position-relative mt-1 mt-lg-2">
                                                <input
                                                    type="password"
                                                    className="default-input rounded-pill py-1 ps-3 py-lg-2 input-required"
                                                    name="reEnterPassword"
                                                    id="reEnterPassword"
                                                    value={user.reEnterPassword}
                                                    onChange={handleChange}
                                                    required
                                                    maxLength="40"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-submit">
                                            <button
                                                id="btnCreateAccount"
                                                type="submit"
                                                className="btn btn-success w-100 rounded-pill py-lg-2 mt-1 mt-lg-2"
                                            >
                                                Create Account
                                            </button>
                                        </div>
                                    </form>
                                    <div className="other-options-signup text-center py-3">
                                        <span className="text-dark">Or</span>
                                        <div className="signup-options-list d-flex flex-wrap gap-2 mt-2">
                                            <button className="btn border rounded-pill py-lg-2">
                                                <i className="fa-brands fa-facebook me-1 icon-fb"></i>
                                                Signup with Facebook
                                            </button>
                                            <button className="btn border rounded-pill py-lg-2">
                                                <i className="fa-brands fa-google-plus me-1 icon-google"></i>
                                                Signup with Google
                                            </button>
                                        </div>
                                    </div>
                                    <div className="have-account-option text-center mt-2">
                                        <p>
                                            Already have an account? <Link to="/">login here</Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserRegister;
