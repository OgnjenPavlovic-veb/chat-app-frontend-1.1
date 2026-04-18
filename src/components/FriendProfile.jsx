import { sendFriendRequest } from "../services/friendService.js";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api.js";

function FriendProfile () {
  const [profile, setProfile] = useState(null);
  const [sent, setSent] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await API.get(`/users/${id}`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        setProfile(null);
      }
    };

    if (id) loadUser();
  }, [id]);

  const handleAddFriend = async () => {
    if (sent) return;
    if (!profile?._id) return;
    try {
      const res = await sendFriendRequest(profile._id);
      if (res) {
        setSent(true);
        alert(res.message || "Request sent!");
      }
      
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error sending request");
    }
  };
  
  
  if (profile === null) return <p>User not found</p>;
  if (!profile) return <p>Loading...</p>;

    return (
        <>
        <div className="profile_view">
          <button className="profile_view_btn" onClick={() => navigate(-1)}>← Back</button>
      
          <div className="firend_request_cart">
          
             <img 
             src={profile?.profile?.image || "/default-avatar.png"}
             alt="avatar"
             onError={(e) => (e.target.src = "/default-avatar.png")}
             className="request_avatar"
             />

            <h2>{profile.username}</h2>
        
            <button onClick={handleAddFriend} disabled={sent}>{sent ? "Request Sent" : "Add Friend"}</button>
            </div>
          
        
        </div>
        
        </>
    );
}

export default FriendProfile;