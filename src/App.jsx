import { useState, useEffect } from 'react';
import Login from './components/login';
import FriendProfile from "./components/FriendProfile";
import { socket } from './socket.js';
import './App.css';
import "./components/main.css";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { getFriendRequests } from './services/friendService';
import FriendRequest from './components/FriendRequests';
import FriendsList from "./components/FriendsList";
import ChatWindow from './components/ChatWindow';
import Accaunt from './components/Accaunt';
import GroupsPage from './components/GroupsPage';
import HomePage from './components/HimePage';
import Setings from './components/setings';
import API from "./services/api.js";



function App() {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
 
  const [requests, setRequests] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [authReady, setAuthReady] = useState(false);
  const [theme, setTheme] = useState("default");
  const navigate = useNavigate();
  
    useEffect(() => {

    const checkUser = async () => {
      const token = localStorage.getItem("token");
        if (!token || token === "undefined") {
          setIsLoggedIn(false);
          setAuthReady(true);
          return;
        }

      try {
        const res = await API.get(`/auth/me`);
        const userData = res.data;

        setUser(userData);
        setIsLoggedIn(true);
        const userTheme = userData.theme || "default";
        document.documentElement.setAttribute("data-theme", userTheme);
       
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      } finally {
        setAuthReady(true);
      }
    };

    checkUser();
  }, []);


  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
    setIsLoggedIn(false);
    socket.disconnect();

    setTheme("default");
    document.documentElement.setAttribute("data-theme", "default");
  }

useEffect(() => {
  if (!user?._id) return;
   const setup = () => {
    socket.emit("setup", user._id);
  
  };

  if (!socket.connected) socket.connect();

 // socket.on("connect", setup);

  socket.on("connect", () => {
    console.log("SOCKET CONNECTED:", socket.id);
    socket.emit("setup", user._id);
  });

 
  socket.on("friend request:new", (data) => {
  console.log("Realtime request:", data);
  
  if (!data) return;
  
  setRequests(prev => {
    if (prev.find(r => r._id === data._id)) return prev;
    return [...prev, data];
  });
});

  return () => {
    socket.off("connect", setup);
    socket.off("friend request:new");
  };

}, [user?._id]);



useEffect(() => {
    const handler = (users) => setOnlineUsers(users);

    socket.on("online users", handler);
    return () => socket.off("online users", handler);
  }, []);


  useEffect(() => {
    if (isLoggedIn && user) {
      const loadRequests = async () => {
        try {
          const data = await getFriendRequests();
          setRequests(data || []);
        } catch (err) {
          console.error("Error loading requests:", err);
        }
      }
      loadRequests();
    }
  }, [isLoggedIn, user]);

    const changeTheme = async (newTheme) => {
      try {
       setUser(prev => ({ ...prev, theme: newTheme }));
       setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        
        await API.put(`/users/theme`, { theme: newTheme });
    } catch (err) {
      console.error("Error saving theme:", err);
    }   
   }
//---------------------------------

    const removeRequest = async (id) => {
    setRequests(prev => prev.filter(r => r._id !== id))
  }

  useEffect(() => {
  if (!user) return;

  const t = user.theme || "default";
  setTheme(t);
  document.documentElement.setAttribute("data-theme", t);
}, [user]);

   if (!authReady) return <p className='loading'>Loading...</p>;
  
  return (
    <>
    <div className="app_wrapper">
      {!isLoggedIn && (
        <Login 
        onLogin={(data) => {
          const userData = data.user; 
          const userTheme = data.theme || "default";
          console.log("Podaci sa logina:", userData, "Tema:", userTheme);
          document.documentElement.setAttribute("data-theme", userTheme); 
          setTheme(userTheme);
          setUser({ ...userData, theme: userTheme });
        //  socket.connect();
          setIsLoggedIn(true);

          setTimeout(() => {
            navigate("/", { replace: true });
          }, 10);
        }}
        />
      )}

      {isLoggedIn && user && (
        <>
    
        <div className="authenticated-layout">
        <nav>
          <button className='show' onClick={() => setIsOpen(!isOpen)}>Meni</button>
          <h1><a>FastChat</a></h1>
          <button onClick={handleLogOut}>Sing out</button>
        </nav>
       
       {isOpen && ( <div className='overlay' onClick={() => setIsOpen(false)}></div>)}

        <aside className={isOpen ? "sidebar open" : "sidebar"}>
          <div className="slider_div">
              <p>{user?.username}</p>
           
            <div className="sider_btns_wrap">
           <Link to={"/"}>
             <button onClick={() => setIsOpen(false)}>Home</button>        
            </Link>
            <Link to="/accaunt">
             <button onClick={() => setIsOpen(false)}>Accaunt</button>
            </Link>
            <Link to={"/friends"}>
            <button onClick={() => setIsOpen(false)}>Friends</button>
            </Link> 
            <Link to={"/groups"}>
            <button onClick={() => setIsOpen(false)}>Groups</button>
            </Link> 
            <Link to={"/requests"}>
             <button onClick={() => setIsOpen(false)}>Requests</button>
            </Link>    
            </div>

           <Link to={"/setings"}>
             <button onClick={() => setIsOpen(false)}>Settings</button>
            </Link>  
           
            
            </div>
        </aside>

        <main className='main'>
          <div className="main_div">
           <Routes key={user?._id || "guest"}>

            <Route path='/' element={<HomePage user={user}/>}/>

            <Route path='/friends' element={<FriendsList 
            onlineUsers={onlineUsers}
            />}
            />

          <Route path='/accaunt' element={<Accaunt user={user} setUser={setUser}/>}/>
          <Route path='/profile/:id' element={<FriendProfile/>}/>
          <Route path='/requests'
           element={<FriendRequest requests={requests} removeRequest={removeRequest}/>}
           />
          
           <Route path="/chat/:id" element={<ChatWindow key={user?._id} user={user}/>}/>
           <Route path='/groups' element={<GroupsPage user={user}/>} />
           <Route path='/setings' element={<Setings changeTheme={changeTheme}/>}/>
           
           </Routes>
          </div>
        </main>

        <footer className='footer'>

        
        </footer>
    
        </div>
        </>
      )}

    </div>

    </>
  )
}

export default App
