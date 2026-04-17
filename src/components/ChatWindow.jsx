import { useState, useEffect, useRef } from "react";
import { getMessages } from "../services/chatService";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { socket } from "../socket";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getFriends } from "../services/friendService";
import API from "../services/api.js";


function ChatWindow ({ user }) {
  const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL;
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
  const messageEndRef = useRef(null);

  useEffect(() => {
  const initChat = async () => {
    if (!chat && id) {
      try {
        const res = await API.get(`/chat/${id}`);
        setChat(res.data);
      } catch (err) {
        console.error("Chat init error:", err);
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

    return () => {
      socket.emit("leave chat", chat._id);
    };
  }, [chat?._id, user._id]);

  useEffect(() => {
    if (!chat?._id) return;

    const loadMessage = async () => {
      const data = await getMessages(chat._id);
      console.log("MESSAGES:", data);
      setMessages(Array.isArray(data) ? data : []);
    };

    loadMessage();

    const handleNewMessage = (newMessage) => {
      if (newMessage.chat._id === chat._id || newMessage.chat === chat._id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    }

    socket.on("message received", handleNewMessage);
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    socket.on("messages seen", ({ userId }) => {
      setMessages(prev => prev.map(msg => ({
        ...msg,
        seenBy: [...new Set([...(msg.seenBy || []), userId])]
      })));
    });

    return () => {
      socket.off("message received", handleNewMessage);
      socket.off("typing");
      socket.off("stop typing");
      socket.off("messages seen");
    };

  }, [chat?._id]);


  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
 

  const addUser = async (userId) => {
    try {
    const res = await API.put(`/chat/group/add`, 
      { chatId: chat._id, userId });
       setChat(res.data);
    } catch (err) {
      console.error("Add user error", err)
    }   
  }

  const removeUser = async (userId) => {
    try {
      const res = await API.put(`/chat/group/remove`, 
        { chatId: chat._id, userId });
        setChat(res.data);
    } catch (err) {
      console.error("Remove user error", err);
    }    
 }

  const handleLeave = async () => {
    try {
        await API.put(`/chat/group/leave`, { chatId: chat._id });
        socket.emit("leave chat", chat._id);
        navigate("/groups");
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

useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, isTyping]);


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

         <img 
            src={
              isGroup
                ? (chat.groupImage ? `${UPLOAD_URL}/${chat.groupImage}` : "/default-avatar.png")
                : (friend?.profile?.image ? `${UPLOAD_URL}/${friend.profile.image}` : "/default-avatar.png")
            }
            className="chat_avatar"
            onError={(e) => (e.target.src = "/default-avatar.png")}
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
              src={f.profile?.image ? `${UPLOAD_URL}/${f.profile.image}` : "/default-avatar.png"}
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
              src={member.profile?.image ? `${UPLOAD_URL}/${member.profile.image}` : "/default-avatar.png"}
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
        <div ref={messageEndRef} />
    </div>

    
     {isTyping && <p>{isGroup ? "Someone is typing..." : `${friend?.username} is typing...`}</p>}
     <MessageInput chatId={chat._id} addMessage={(newMsg) => setMessages(prev => [...prev, newMsg])}/>
     
     </div>
    </div>
    </>
   )
}

export default ChatWindow;