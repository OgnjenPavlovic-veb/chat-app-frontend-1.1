
import "./home.css";
import { useState, useEffect } from "react";
import { sendFriendRequest } from "../services/friendService.js"
import { Link } from "react-router-dom";
import API from "../services/api.js";


function HomePage () {
    const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL;
    const [users, setUsers] = useState([])
    const [sentRequests, setSentRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const loadRecommended = async () => {
          try {
            const resRecommended = await API.get(`/users/recommended`)

            setUsers(Array.isArray(resRecommended.data) ? resRecommended.data : []);

     //------------------------------------------------------------

        const resSent = await API.get(`/users/friends/sent`);

        setSentRequests(Array.isArray(resSent.data) ? resSent.data : []);

        } catch (err) {
          console.error("Error loading home data:", err);
        }
      }
        loadRecommended();
    }, []);

   const handleAddFriend = async (id) => {
    try {
      const res = await sendFriendRequest(id);
      if (res) {
        setSentRequests(prev => [...prev, id]);
      }
    } catch (err) {
      console.error("Add friend error:", err);
    } 
   }

   const handleSearch = async (value) => {
      setSearchQuery(value);

      if (value.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const res = await API.get(`/users/search?query=${value}`);
        setSearchResults(res.data);

      } catch (err) {
        console.error("Add friend error:", err);
      }
  }


  const uniqueUsers = Array.from(
  new Map(users.map(u => [u._id, u])).values()
  );
   

    return (
        <>
          <div className="home_div">
            <h1>Recommended Friends</h1>
           
           <div className="search">
            
            <div className="input_div">
             <input 
             className="search_input"
              type='text'
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              />
              </div>
         
           {searchResults.length > 0 && (
              <div className="search_result">
                <div className="back_result">
                
                {searchResults.map((u) => (
                  <div className="search_user" key={u._id}>

                    <img 
                    src={u.profile?.image ? `${UPLOAD_URL}/${u.profile.image}` : "/default-avatar.png"}
                    alt={u.username}
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                    />

                    <p>{u.username}</p>

                    <Link to={`/profile/${u._id}`}>
                    <button className='search_btn'>View</button>
                    </Link>
                  </div>             
                ))}
             
               </div>

              </div>
              )}
             

           </div>
           
          {(searchResults.length === 0 || searchQuery.length) < 2 && (
            <div className="recommended_div">
              {uniqueUsers.map(u => (
                <div key={u._id} className="recommended_card">

                    <img 
                    src={u.profile?.image ? `${UPLOAD_URL}/${u.profile.image}` : "/default-avatar.png"}
                    alt={u.username}
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                    />

                    <p>{u.username}</p>

                    <button onClick={() => handleAddFriend(u._id)}
                            disabled={sentRequests.includes(u._id)} 
                        >{sentRequests.includes(u._id) ? "Sent" : "Add Friend"}</button>

                </div>
              ))}

            </div>
            )}
            
          </div>
        </>
    )
}

export default HomePage;