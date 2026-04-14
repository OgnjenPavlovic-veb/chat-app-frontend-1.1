
import "./home.css";
import { useState, useEffect } from "react";
import { sendFriendRequest } from "../services/friendService.js"
import { Link } from "react-router-dom";


function HomePage () {
    const API = "http://localhost:5000/api";
    const imageUrlAcc = "http://localhost:5000/uploads";
    const [users, setUsers] = useState([])
    const [sentRequests, setSentRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const loadRecommended = async () => {
            const token = localStorage.getItem("token");

            const res = await fetch(`${API}/users/recommended`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);

     //------------------------------------------------------------

        const resSent = await fetch(`${API}/users/friends/sent`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const dataSent = await resSent.json();
        setSentRequests(dataSent) ;

        }

        loadRecommended();
    }, []);

   const handleAddFriend = async (id) => {
      const res = await sendFriendRequest(id);

      if (res) {
        setSentRequests(prev => [...prev, id]);
      }
   }

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
                    src={u.profile?.image ? `${imageUrlAcc}/${u.profile.image}` : "/default-avatar.png"}
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
           
          {searchResults.length === 0 && (
            <div className="recommended_div">
              {uniqueUsers.map(u => (
                <div key={u._id} className="recommended_card">

                    <img 
                    src={u.profile?.image ? `${imageUrlAcc}/${u.profile.image}` : "/default-avatar.png"}
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