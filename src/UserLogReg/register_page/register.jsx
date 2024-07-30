import React,{useState} from "react";
import "./register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username:"",
        email:"",
        password:"",
        reEnterPassword:""
    })
    const handelChange = (event)=>{
        const {name,value} = event.target;
        setUser({
            ...user,
            [name] : value
        })
    }
    const register = ()=>{
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
    }
    return (
        <div className="RegisterPage">
            <h1>Register Page</h1>
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" value={user.username} onChange={handelChange}  required />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={user.email} onChange={handelChange}  required />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" value={user.password}  onChange={handelChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="repassword">Re-enter Password</label>
                <input type="password" id="repassword" name="reEnterPassword" value={user.reEnterPassword} onChange={handelChange}  required />
            </div>
            <div className="form-group">
                <button onClick={register}>Register</button>
            </div>
            <h3>OR</h3>
            <button onClick={()=>navigate('/login')}>Login</button>
        </div>
    )
}

export default Register;