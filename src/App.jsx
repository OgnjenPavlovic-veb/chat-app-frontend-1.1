import { useState, useEffect } from 'react';
import Login from './components/login';
import FriendProfile from "./components/FriendProfile";
import './App.css';
import "./components/main.css";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { getFriendRequests } from './services/friendService';
import FriendRequest from './components/FriendRequests';
import FriendsList from "./components/FriendsList";
import ChatWindow from './components/ChatWindow';
import { socket } from './socket';
import Accaunt from './components/Accaunt';
import GroupsPage from './components/GroupsPage';
import HomePage from './components/HimePage';
import Setings from './components/setings';


function App() {
  const API = "http://localhost:5000/api";

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
 //  const [searchQuery, setSearchQuery] = useState("");
 //  const [searchResults, setSearchResults] = useState([]);
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
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          setAuthReady(true);
          return;
        }

        const data = await res.json();

        setUser(data);
        setIsLoggedIn(true);
        const userTheme = data.theme || "default";
        document.documentElement.setAttribute("data-theme", userTheme);
      } catch (err) {
        console.error(err);
        setIsLoggedIn(false);
      } finally {
        setAuthReady(true);
      }
    };

    checkUser();
  }, []);



  const handleLogOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsLoggedIn(false);

    setTheme("default");
    document.documentElement.setAttribute("data-theme", "default");
  }

  /*
  useEffect(() => {
  if (!user?._id) return;

  if (!socket.connected) {
    socket.connect();
  }

  socket.emit("setup", user._id);
}, [user])
*/


/*
  const handleSearch = async (value) => {
      setSearchQuery(value);

      if (value.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API}/users/search?query=${value}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        setSearchResults(data);

      } catch (err) {
        console.error(err);
      }
  }
*/


useEffect(() => {
    const handler = (users) => setOnlineUsers(users);

    socket.on("online users", handler);
    return () => socket.off("online users", handler);
  }, []);

  useEffect(() => {  // ovaj mora da ostane jer ako ga nema uvek pokazuje online user i ako user nije online
  if (user?._id) {
    socket.emit("setup", user._id)
  }
  return () => {
    socket.off("online users");
  };
}, [user?._id]);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await getFriendRequests();

        setRequests(data || []);

      } catch (err) {
        console.error(err);
      }
    }
    loadRequests();
  }, []);

  
/*
useEffect(() => {
  socket.on("online users", (users) => {
    setOnlineUsers(users)
  })
  return () => socket.off("online users");
}, []);
*/

/*
useEffect(() => {
  const handleOnlineUsers = (users) => {
    setOnlineUsers(users);
  };

  socket.on("online users", handleOnlineUsers);

  return () => {
    socket.off("online users", handleOnlineUsers);
  };
}, []);
*/


    const changeTheme = async (newTheme) => {
      
       setUser(prev => ({ ...prev, theme: newTheme }));
       setTheme(newTheme);

        document.documentElement.setAttribute("data-theme", newTheme);

        const token = localStorage.getItem("token");

         await fetch(`${API}/users/theme`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ theme: newTheme })
        });
    }


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
          setUser({ ...userData, theme: userTheme }); // Spajamo temu i usera u jedan state
          setIsLoggedIn(true);

          setTimeout(() => {
            navigate("/", { replace: true });
          }, 10);
        }}
        />
      )}

      {isLoggedIn && user && (
        <>
    
        <div className="authenticated-layout" key={user._id}>
        <nav>
          <button className='show' onClick={() => setIsOpen(!isOpen)}>Meni</button>
          <h1><a>JoJoWhats-app</a></h1>
          <button onClick={handleLogOut}>Sing out</button>
        </nav>
       
       {isOpen && ( <div className='overlay' onClick={() => setIsOpen(false)}></div>)}

        <aside className={isOpen ? "sidebar open" : "sidebar"}>
          <div className="slider_div">
              <p>{user?.username}</p>
           {/*   
              <input 
              type='text'
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              />
              <div className="search_result">
                {searchResults.map((u) => (
                  <div className="search_user" key={u._id}>
                    <p>{u.username}</p>
                    <Link to={`/profile/${u._id}`}>
                    <button className='search_btn'>Add Friend</button>
                    </Link>
                  </div>
                ))}
              </div>
        */}

            <div className="sider_btns_wrap">
           <Link to={"/"}>
             <button>Home</button>        
            </Link>
            <Link to={"/accaunt"}>
             <button>Accaunt</button>
            </Link>
            <Link to={"/friends"}>
            <button>Friends</button>
            </Link> 
            <Link to={"/groups"}>
            <button>Grups</button>
            </Link> 
            <Link to={"/requests"}>
             <button>Requests</button>
            </Link>    
            </div>

           <Link to={"/setings"}>
             <button>Setings</button>
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
           element={<FriendRequest requests={requests} removeRequest={removeRequest} user={user}/>}
           />
          
           <Route path="/chat/:id" element={<ChatWindow key={user?._id} user={user}/>}/>
           <Route path='/groups' element={<GroupsPage />}/>
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
