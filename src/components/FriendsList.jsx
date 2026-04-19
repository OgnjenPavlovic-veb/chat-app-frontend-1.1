import { useState, useEffect } from "react";
import { getFriends } from "../services/friendService";
import { accessChat } from "../services/chatService";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import API from "../services/api.js";

function FriendsList ({ onlineUsers }) {
    
    const [friends, setFriends] = useState([]);
    const navigate = useNavigate();
    const [selectedFriend, setSelectedFriend] = useState(null);

    useEffect(() => {
       const loadFriends = async () => {
        const data = await getFriends();
        setFriends(data);
       }
       loadFriends();    
    }, []);

const openChat = async (friend) => {
    try {
        const chat = await accessChat(friend._id);

        console.log("CHAT:", chat);

        navigate(`/chat/${chat._id}`, { state: { chat } });

    } catch (err) {
        console.error("Open chat error:", err);
    }
}

const removeFriend = async (friendId) => {
   try {
    const res = await API.put(`/friends/remove-friend`, { friendId });

    if (res.status === 200) {
        setFriends(prev => prev.filter(f => f._id !== friendId ));
    } 
   } catch (err) {
     console.error("Remove friend error:", err);
     alert(err.response?.data?.message || "Error removing friend")
 }
}

useEffect(() => {
    socket.on("friend removed", ({ friendId }) => {
        setFriends(prev => prev.filter(f => f._id !== friendId));
    });

    return () => socket.off("friend removed");
}, []);

    return (
        <>
        <div className="friends_list">
            <h2>Friends...</h2>

            {friends.length === 0 && <p className="p_frineds">No Friends yet.</p>}
           <div className="friend_content">
            {friends.map(friend => (
                <div className="friend_cart" key={friend._id} onClick={() => openChat(friend)}>
                    <div className="firend_cart_2">
                    <img 
                    src={friend.profile?.image || "/default-avatar.png"}
                    alt="avatar"
                    className="friend_avatar"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                    />
                   
                    {onlineUsers.includes(friend._id) && (
                        <span className="online_dot">🟢</span>
                    )}

                     <span>{friend.username}</span>
                     </div>

                     <button className="friends_cart_info_btn" onClick={(e) => {e.stopPropagation(); setSelectedFriend(friend)}}>⋮</button>
                  
                </div>
            ))}

            {selectedFriend && (
                    <div className="overlay2" onClick={() => setSelectedFriend(null)}>
                    <div className="window_delete_div" onClick={(e) => e.stopPropagation()}>

                    <p>Are you sure you want to remove a friend from your friends list?
                     When you do this,
                     all messages will be permanently deleted!</p>

                     <button 
                     onClick={(e) => {e.stopPropagation(); removeFriend(selectedFriend._id); setSelectedFriend(null)}}
                     >Remove Friend</button>
                     </div>
                     </div>
                )}

            </div>
        </div>
        </>
    )
}

export default FriendsList;