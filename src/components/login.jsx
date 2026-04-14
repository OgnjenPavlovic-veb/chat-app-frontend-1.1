
import { useState, useEffect } from "react";
import "./login.css";


function Login ({ onLogin }) {
    const API = "http://localhost:5000/api";

    const [showRegister, setShoeRegister] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const [regUsername, setRegUsername] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regPasswordConfirm, setRegPasswordConfirm] = useState("");


    const handleRegister = async () => {
        
        if (!regUsername || !regEmail || !regPassword || !regPasswordConfirm) {
            return console.log("Sva polja su obavezna.");
        }

        if (regPassword !== regPasswordConfirm) {
           return console.log("Lozinke se ne poklapaju.");
        }
    
     try {

        const res = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: regUsername,
                email: regEmail,
                password: regPassword,
                passwordConfirm: regPasswordConfirm
            })
        });

         const data = await res.json();

        if (!res.ok) {
            console.log("Error u register logici", data);
            setError(data.message || "data error");
            return;
        }

        setRegUsername("");
        setRegEmail("");
        setRegPassword("");
        setRegPasswordConfirm("");
        setShoeRegister(false);
        console.log("register passed.");

     } catch (err) {
        console.error(err);
     }

    }
   
//--------------------------------------------------------------------------

const handleLogin = async () => {
    if (!emailOrUsername || !password) {
       return console.log("Sva polja su obavezna");
    }

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                emailOrUsername,
                password
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.log("Error u login logici.");
            setError(data.message || "error-login");
            return;
        }

        if (!data.token) {
        setError("Login failed - no token");
        return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);
        setEmailOrUsername("");
        setPassword("");
        setError("")
        setIsLoggedIn(true);


        if (onLogin) {
            onLogin(data);
        }

    } catch (err) {
        console.log(err);
        setError("Login failded.");
    }
}

//-------------------------------------------------------------

useEffect(() => {
    const checkUser = async () => {
        const token = localStorage.getItem("token");

        if (!token) return;

        try {
             const res = await fetch(`${API}/auth/me`, {
                headers: { Authorization: `Bearer ${token}`}
             });

             if (!res.ok) {
                localStorage.removeItem("token");
                return;
             }

             setIsLoggedIn(true);
             const data = await res.json();
             console.log("User", data);

        } catch (err) {
            console.error(err);
        }
    }
    checkUser();
}, []);

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
                            onClick={() => {setShoeRegister(true); setError("")}}
                            >Register</button>
                        </div>
                    </form>

            </div>)}

            {showRegister && (<div className="register_container">
  
                <button type="button" className="x_btn" onClick={() => {setShoeRegister(false); setError("")}}>X</button>
                <h1>Register</h1>
                {error && <p style={{ color: "reg", textAlign: "center"}}>{error}</p>}
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