import { sendFriendRequest } from "../services/friendService.js";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function FriendProfile () {
  const imageUrlAcc = "http://localhost:5000/uploads";
  const [profile, setProfile] = useState(null);
  const [sent, setSent] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/users/${id}`, {
          headers: {
              Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) {
        console.error("User not found");
        setProfile(null);
        return;
        }
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadUser();
  }, [id]);

  const handleAddFriend = async () => {
    if (sent) return;
    if (!profile?._id) return;
    try {
      const res = await sendFriendRequest(profile._id);
      if (res) {
        setSent(true);
      }
      alert(res.message);

    } catch (err) {
      console.error(err);
    }
  };
  
  
  if (profile === null) return <p>User not found</p>;
  if (!profile) return <p>Loading...</p>;

    return (
        <>
        <div className="profile_view">
          <button className="profile_view_btn" onClick={() => navigate('/')}>← Back</button>
      
          <div className="firend_request_cart">
          
             <img 
             src={profile?.profile?.image ? `${imageUrlAcc}/${profile.profile.image}` : "/default-avatar.png"}
             alt="avatar"
             className="request_avatar"
             />

            <h2>{profile.username}</h2>
        
            <button onClick={handleAddFriend}>Add Friend</button>
            </div>
          
        
        </div>
        
        </>
    );
}

export default FriendProfile;