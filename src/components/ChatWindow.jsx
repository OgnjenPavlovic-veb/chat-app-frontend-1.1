import { useState, useEffect } from "react";
import { getMessages } from "../services/chatService";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { socket } from "../socket";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getFriends } from "../services/friendService";



function ChatWindow ({ user }) {
  const imageUrlAcc = "http://localhost:5000/uploads";
  const API = "http://localhost:5000/api";
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [warning, setWarning] = useState(false);
  const [friends, setFriends] = useState([]);
  const location = useLocation();
  const [chat, setChat] = useState(location.state?.chat || null);
  const [groupInfo, setGroupInfo] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
  const initChat = async () => {
    if (!chat && id) {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API}/chat/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        setChat(data);

      } catch (err) {
        console.error(err);
      }
    }
  };

  initChat();
}, [chat, id]);

  useEffect(() => {
    if (!chat?._id) return;

    socket.emit("join chat", chat._id);

    socket.emit("messages seen", {
      chatId: chat._id,
      userId: user._id
    });
  }, [chat]);

  useEffect(() => {
    if (!chat?._id) return;

    const loadMessage = async () => {
      const data = await getMessages(chat._id);
      console.log("MESSAGES:", data);
      setMessages(Array.isArray(data) ? data : []);
    };

    loadMessage();
  }, [chat]);

  useEffect(() => {
    socket.on("message received", (newMessage) => {
      setMessages(prev => [...prev, newMessage]);

      socket.emit("message received", {
        messageId: newMessage._id,
        userId: user._id
      });
    });

    return () => socket.off("message received");
  }, []);

  useEffect(() => {
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  useEffect(() => {
    socket.on("messages seen", ({ userId }) => {
      setMessages(prev =>
        prev.map(msg => ({
          ...msg,
          seenBy: [...(msg.seenBy || []), userId]
        }))
      );
    });

    return () => socket.off("messages seen");
  }, []);

  useEffect(() => {
    const el = document.querySelector(".message_div");
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const addUser = async (userId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/chat/group/add`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
         Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        chatId: chat._id,
        userId
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Add user error:", text);
      return;
    }

    const data = await res.json();

    setChat(data);
  }

  const removeUser = async (userId) => {
    const token = localStorage.getItem("token");

      const res = await fetch(`${API}/chat/group/remove`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          chatId: chat._id,
          userId
        })
      });

      let data;

      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        console.error("NOT JSON:", text);
      }

      if (res.ok) {
        setChat(data);
      } else {
        console.error(data);
        return;
      }
    
  }

  const handleLeave = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/chat/group/leave`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          chatId: chat._id
        })
      });

      if (res.ok) {
        socket.emit("leave chat", chat._id);
        navigate("/groups");
      } else {
        const errData = await res.json();
        console.log(errData.message || "Error leaving group.");
      }

    } catch (err) {
      console.error("Leave error", err);
    }
  }


  useEffect(() => {
    const loadFriends = async () => {
      const data = await getFriends();
      setFriends(Array.isArray(data) ? data : []);
    };

    loadFriends();
  }, []);

  
 useEffect(() => {
  const handler = (updatedChat) => {
    setChat(prev =>
      prev?._id === updatedChat._id ? updatedChat : prev
    );
  };

  socket.on("group updated", handler);

  return () => socket.off("group updated", handler);
}, []);

useEffect(() => {
  socket.on("removed from group", ({ chatId }) => {
    if (chatId === chat._id) {
      socket.emit("leave chat", chatId);
      alert("You were removed from the group");
      navigate("/groups");
    }
  });

  return () => socket.off("removed from group");
}, [chat]);


  if (!user) return <div>Loading user...</div>;
  if (!chat?._id) return <div>Loading chat...</div>;

  const isGroup = chat.isGroup;

  const friend = !isGroup && Array.isArray(chat?.users)
  ? chat.users.find(u => u._id !== user._id)
  : null;


console.log(chat);
   return (
    <>
    <div className="chat_window_div">
     

        <div className="chat_baner">
          <div className="chat_baner_1">
         <button onClick={() => navigate(isGroup ? "/groups" : "/friends")}>← Back</button>
{/*
         <img 
         src={friend?.profile?.image ? `${imageUrlAcc}/${friend.profile.image}` : "/default-avatar.png"}
         alt="avatar"
         className="chat_avatar"
         />
*/}
         <img 
            src={
              isGroup
                ? chat.groupImage || "/default-avatar.png"
                : friend?.profile?.image
                  ? `${imageUrlAcc}/${friend.profile.image}`
                  : "/default-avatar.png"
            }
            className="chat_avatar"
          />
          

          <p>{isGroup ? chat.name : friend?.username}</p>
          </div>

          {isGroup && (
            <div className="isGroup">
            <button onClick={() => setShowAdd(true)}>+</button>

            <button className="chat_info_baner" onClick={() => setGroupInfo(true)}>⋮</button>
            </div>
          )}
     </div> 
    
     <div className="chat_content_div">

      {showAdd && (
        <div className="modal_overlay" onClick={() => setShowAdd(false)}>
          <div className="modal_content_list">
            <div className="add_baner">
            <h2>Add Frineds to Group.</h2>
            <button className="modal_close" onClick={() => setShowAdd(false)}>Close</button>
            </div>

            {friends.length === 0 && <p>No friends available.</p>}

          {friends.filter(f => !chat.users.some(u => u._id === f._id)).map(f => (
            <div key={f._id} className="friend_item">

              <img 
              src={f.profile?.image ? `${imageUrlAcc}/${f.profile.image}` : "/default-avatar.png"}
              alt="avatar"
              className="friend_avatar_small"
              />

              <span>{f.username}</span>
              
              <button onClick={() => addUser(f._id)}>Add</button>
              
            </div>
          ))}
          

          </div>
        </div>
      )}

      {groupInfo && (
        <div className="modal_overlay" onClick={() => setGroupInfo(false)}>
          <div className="group_info_div">
            <div className="group_info_leave">
            <p>Members: {chat.users.length}</p>
            {chat.users.length === 0 && <p>The group has no members yet.</p>}
            <button onClick={() => {setWarning(true); setGroupInfo(false)}}>Leave The Group</button>
            </div>

            {chat.users.map((member) => (
              <div key={member} className="friend_gropu_item">
                <div className="info_cart">
             <img 
              src={member.profile?.image ? `${imageUrlAcc}/${member.profile.image}` : "/default-avatar.png"}
              alt="avatar"
              className="friend_avatar_small"
              />

              <span>
                {member.username} {member._id === chat.admin?._id || member._id === chat.admin ? "(Admin)" : ""}
              </span>
              </div>
               {chat.admin?._id === user._id && (  
              <button onClick={() => removeUser(member._id)}>Remove</button>
               )}
              </div>
            ))}
          </div>
        </div>
      )}

      {warning && (
        <div className="modal_overlay">
              <div className="warning_window">
                <p>Are you sure you want to leave this group?</p>
                <div className="warning_window_btns">
                <button onClick={handleLeave}>Yes</button>
                <button onClick={() => {setWarning(false); setGroupInfo(true)}}>Chancel</button>
                </div>
              </div>
          </div>    
        )}

    <div className="message_div">
        {Array.isArray(messages) && messages.map(m => (
            <MessageBubble key={m._id} message={m} user={user}/>
        ))}
    </div>

    
     {isTyping && <p>{isGroup ? "Someone is typing..." : `${friend?.username} is typing...`}</p>}
     <MessageInput chatId={chat._id} addMessage={(newMsg) => setMessages(prev => [...prev, newMsg])}/>
     
     </div>
    </div>
    </>
   )
}

export default ChatWindow;