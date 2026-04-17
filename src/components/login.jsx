
import { useState } from "react";
import "./login.css";
import API from "../services/api.js";


function Login ({ onLogin }) {
   
    const [showRegister, setShowRegister] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const [regUsername, setRegUsername] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regPasswordConfirm, setRegPasswordConfirm] = useState("");


    const handleRegister = async (e) => {
        if (e) e.preventDefault();
        
        if (!regUsername || !regEmail || !regPassword || !regPasswordConfirm) {
            return console.log("All fields are required..");
        }

        if (regPassword !== regPasswordConfirm) {
           return console.log("Passwords do not match.");
        }
    
     try {

         await API.post(`/auth/register`, {
            username: regUsername,
            email: regEmail,
            password: regPassword,
            passwordConfirm: regPasswordConfirm
        });

        setRegUsername("");
        setRegEmail("");
        setRegPassword("");
        setRegPasswordConfirm("");
        setShowRegister(false);
        setError("");
        alert("Registration successful! You can now log in.");

     } catch (err) {
        setError(err.response?.data?.message || "Registration error.");
     }

    }
   
//--------------------------------------------------------------------------

const handleLogin = async () => {
    if (!emailOrUsername || !password) {
        setError("All fields are required.");
        return;
    }

    try {
        const res = await API.post(`/auth/login`, {
            emailOrUsername,
            password
        });
        const data = res.data;

        if (!data.token) {
         setError("Login failed - no token");
         return;
       }

        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id || data.user.id);
        setEmailOrUsername("");
        setPassword("");
        setError("")
        setIsLoggedIn(true);


        if (onLogin) {
            onLogin(res.data);
        }

    } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || "Incorrect email or password..");
    }
}

//-------------------------------------------------------------

    return (
        <>
         {!isLoggedIn && <div className="wrapper">
            
            {!showRegister && (<div className="login_container">
                    <h1>Login</h1>
                    {error && <p style={{ color: 'red', textAlign: "center"}}>{error}</p>}
                    <form className="Login_from" onSubmit={(e) => {e.preventDefault(); handleLogin();}}>

                        <label>Email Or Username
                            <input 
                            type="text" placeholder="Email Or Username"
                            maxLength={20} value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)}
                            />
                        </label>

                        <label>Password
                            <input 
                            type="password" placeholder="**********"
                            maxLength={20} value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </label>

                        <div className="login_btns_div">
                            <button type="submit">Login</button>
                            <button 
                            type="button"
                            onClick={() => {setShowRegister(true); setError("")}}
                            >Register</button>
                        </div>
                    </form>

            </div>)}

            {showRegister && (<div className="register_container">
  
                <button type="button" className="x_btn" onClick={() => {setShowRegister(false); setError("")}}>X</button>
                <h1>Register</h1>
                {error && <p style={{ color: "red", textAlign: "center"}}>{error}</p>}
                <form className="register_from" onSubmit={(e) => {e.preventDefault(); handleRegister();}}>

                  <label>Username
                    <input 
                    type="text" placeholder="Username" maxLength={20}
                    value={regUsername} onChange={(e) => setRegUsername(e.target.value)}
                    />
                    </label>

                   <label>Email
                    <input 
                    type="email" placeholder="userEmail@gmail.com"
                    value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                    />
                    </label>

                  <label>Password
                    <input 
                    type="password" placeholder="**********" maxLength={20}
                    value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    />
                    </label>

                   <label>PasswordConfirm
                    <input 
                    type="password" placeholder="**********" maxLength={20}
                    value={regPasswordConfirm} onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    />
                    </label>

                    <button type="submit" className="register_btn">Register</button>        
                 </form>    

            </div>)}
            
            </div>}
        </>
    )
}

export default Login;