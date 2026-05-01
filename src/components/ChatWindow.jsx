import { useState, useEffect, useRef } from "react";
import { getMessages } from "../services/chatService";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { socket } from "../socket.js";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getFriends } from "../services/friendService";
import API from "../services/api.js";
import { Virtuoso } from "react-virtuoso";


function ChatWindow ({ user }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [warning, setWarning] = useState(false);
  const [friends, setFriends] = useState([]);
  const location = useLocation();
  const [chat, setChat] = useState(location.state?.chat || null);
  const [groupInfo, setGroupInfo] = useState(false);
  const [firstItemIndex, setFirstItemIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editGroupWindow, setEditGroupWindow] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const cancelEdit = () => setEditingMessage(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const lastLoadTime = useRef(0);
  const virtuosoRef = useRef(null);
  const loadingRef = useRef(false);
  const initialScrollDone = useRef(false);
  const fileInputRef = useRef(null)

  const chatRef = useRef(chat);

  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  const uniqueMessages = (msgs) => {
  const map = new Map();
  msgs.forEach(m => map.set(m._id, m));
  return Array.from(map.values());
  };

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

        const join = () => {
        socket.emit("join chat", chat._id);

        socket.emit("messages seen", {
          chatId: chat._id,
          userId: user._id,
        });
      };

      if (socket.connected) {
        join();
      } else {
        socket.on("connect", join);
      }

      return () => {
        socket.emit("leave chat", chat._id);
        socket.off("connect", join);
      };
  }, [chat?._id, user?._id]);

  useEffect(() => {
    if (!chat?._id) return;

    const loadMessage = async () => {
      setLoading(true);
      const data = await getMessages(chat._id, null, 20);
      setMessages(Array.isArray(data) ? data : []);
      setFirstItemIndex(10000 - data.length);
      setLoading(false);
    };

    loadMessage();


    const handleNewMessage = (newMessage) => {
     
      const incomingChatId = typeof newMessage.chat === 'object' 
          ? newMessage.chat._id 
          : newMessage.chat;
      
    
       if (incomingChatId === chatRef.current?._id) {
          setMessages((prev) => {
            const exists = prev.some(m => m._id === newMessage._id);
            if (exists) return prev;  
            return [...prev, newMessage];
          });
        

        socket.emit("messages seen", {
          chatId: incomingChatId,
          userId: user._id,
        });
       }
    };

    const handleUpdateMessage = (updatedMessage) => {
        const incomingChatId = typeof updatedMessage.chat === 'object' 
            ? updatedMessage.chat._id 
            : updatedMessage.chat;

        if (incomingChatId === chatRef.current?._id) {
            setMessages((prev) => 
                prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m))
            );
        }
    };

    const handleGroupDeleted = ({ chatId }) => {
        if (chatId === chat?._id) {
            alert("This group has been deleted by an administrator.");
            navigate("/groups");
        }
    };

    const handleUpdateSocket = (updatedChat) => {
        setChat(prev => 
          prev?._id === updatedChat._id ? updatedChat : prev
        );
    };
    
    socket.on("message received", handleNewMessage);
    socket.on("typing", () => {
      setIsTyping(true)});
    socket.on("stop typing", () => setIsTyping(false));

    socket.on("messages seen", ({ chatId, userId }) => {
      if (chatId === chatRef.current?._id) {
         setMessages(prev => {
          if (!prev || !Array.isArray(prev)) return [];

          return  prev.map(msg => {
          if (!msg || !msg._id) return msg;
          const alreadySeen = msg.seenBy?.includes(userId);
          if (!alreadySeen) {
            return {
                ...msg,
                seenBy: [...new Set([...(msg.seenBy || []), userId])]
            }
          }
          return msg;
         })
        
        });
      }
    });

    socket.on("message deleted", (deletedId) => {
        const idToRemove = typeof deletedId === 'object' ? deletedId.messageId : deletedId;
        setMessages((prev) => prev.filter(m => m._id !== idToRemove));
    });
    socket.on("message update received", handleUpdateMessage);
    socket.on("group deleted", handleGroupDeleted);
    socket.on("group updated", handleUpdateSocket);

    return () => {
      socket.off("message received", handleNewMessage);
      socket.off("message update received", handleUpdateMessage);
      socket.off("group deleted", handleGroupDeleted);
      socket.off("group updated", handleUpdateSocket);
      socket.off("typing");
      socket.off("stop typing");
      socket.off("messages seen");
      socket.off("message deleted");
    };

  }, [chat?._id, navigate]);


  useEffect(() => {
     if (editGroupWindow && chat) {
      setNewGroupName(chat.name);
     }
  }, [editGroupWindow, chat]);

  const handleUpdateGroup = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("chatId", chat._id);
    if (newGroupName) formData.append("name", newGroupName);
    if (selectedFile) formData.append("image", selectedFile);

    try {
      const res = await API.put("/chat/group/update", formData);

      setChat(res.data);
      setEditGroupWindow(false);
      setGroupInfo(true);

    } catch (err) {
      console.error("Update Group error", err);
      alert("Failed to update group.");
    }

  }


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
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown_container")) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
  if (!groupInfo) {
    setMenuOpen(false);
  }
}, [groupInfo]);

  
 useEffect(() => {
  const handler = (updatedChat) => {
    setChat(prev =>
      prev?._id === updatedChat._id ? updatedChat : prev
    );
  };

  socket.on("group updated", handler);

  return () => socket.off("group updated", handler);
}, [chat?._id]);

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
  if (messages.length > 0 && !initialScrollDone.current) {
    setTimeout(() => {
    virtuosoRef.current.scrollToIndex({
      index: messages.length - 1,
      align: 'end',
      behavior: 'auto'
    });
    initialScrollDone.current = true;
   }, 100);
  }
}, [messages.length]);

useEffect(() => {
  setHasMore(true);
  initialScrollDone.current = false;
}, [chat?._id]);

const handleDeleteGroup = async () => {
  try {
    await API.delete("/chat/deleteGroup", { 
      data: { chatId: chat._id } 
    });
    navigate("/groups");
  } catch (err) {
    console.error("Error deleting group:", err);
    alert("Delete failed.");
  }
}


const loadMoreMessages = async () => {
  if (loadingRef.current || !hasMore || messages.length === 0) return;

  loadingRef.current = true;
  setLoading(true);

  try {
    const oldestMessage = messages[0];

    const olderMessages = await getMessages(
      chat._id,
      oldestMessage.createdAt,
      20
    );

    if (olderMessages.length === 0) {
      setHasMore(false);
    } else {
      setMessages(prev => {
        const merged = [...olderMessages, ...prev];
        return uniqueMessages(merged);
      });
      setFirstItemIndex(prev => Math.max(0, prev - olderMessages.length));
    }

  } catch (err) {
    console.error(err);
  } finally {
    loadingRef.current = false;
    setLoading(false);
  }
}

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };



  if (!user) return <div>Loading user...</div>;
  if (!chat?._id) return <div>Loading chat...</div>;

  const isGroup = chat.isGroup;

  const friend = !isGroup && Array.isArray(chat?.users)
  ? chat.users.find(u => u._id !== user._id)
  : null;


   return (
    <>
    <div className="chat_window_div">
     

        <div className="chat_baner">
          <div className="chat_baner_1">
         <button onClick={() => navigate(isGroup ? "/groups" : "/friends")}>← Back</button>

         <img 
            src={isGroup ? (chat.groupImage || "/default-avatar.png") : (friend?.profile?.image || "/default-avatar.png")}
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
          <div className="modal_content_list" onClick={(e) => e.stopPropagation()}>
            <div className="add_baner">
            <h2>Add Frineds to Group.</h2>
            <button className="modal_close" onClick={() => setShowAdd(false)}>Close</button>
            </div>

            {friends.length === 0 && <p>No friends available.</p>}

          {friends.filter(f => !chat.users.some(u => u._id === f._id)).map(f => (
            <div key={f._id} className="friend_item">

              <img 
              src={f.profile?.image || "/default-avatar.png"}
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
          <div className="group_info_div" onClick={(e) => e.stopPropagation()}>
            <div className="group_info_leave">
            <p>Members: {chat.users.length}</p>
            {chat.users.length === 0 && <p>The group has no members yet.</p>}
            <div className="dropdown_container" onClick={(e) => e.stopPropagation()}>
              <button className="dropdown_trigger" onClick={() => setMenuOpen(prev => !prev)}>⋮</button>

              {menuOpen && (
                <div className="dropdown_menu">
                  {chat.admin?._id === user._id && 
                  <button className="dropdown_item" 
                  onClick={() => {setDeleteWarning(true); setMenuOpen(false);}}>
                    Delete Gropu
                  </button>}
                  <button className="dropdown_item"
                  onClick={() => {setEditGroupWindow(true); setGroupInfo(false); setMenuOpen(false);}}>
                    Edit
                    </button>
                  <button className="dropdown_item"
                  onClick={() => {setWarning(true); setGroupInfo(false); setMenuOpen(false);}}>
                    Leave The Group
                    </button>
                </div>
              )}
            </div>
            
            </div>

            {chat.users.map((member) => (
              <div key={member._id} className="friend_gropu_item">
                <div className="info_cart">
             <img 
              src={member.profile?.image || "/default-avatar.png"}
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



      {deleteWarning && (
        <div className="modal_overlay">
            <div className="warning_window">
              <p>Are you sure you want to delete the group?</p>
              <div className="warning_window_btns">
                <button onClick={handleDeleteGroup}>Yes</button>
                <button onClick={() => {setDeleteWarning(false); setGroupInfo(true)}}>Chancel</button>
                </div>
            </div>
        </div>
      )}

      {editGroupWindow && (
        <div className="modal_overlay">
           <div className="warning_window">
            <div className="edit_group_header">
              <h3>Edit Group</h3>
              </div>

              <form className="edit_group_form" onSubmit={handleUpdateGroup}>

                <div className="input_gropu">
                  <label>Group Name 
                    <input 
                     placeholder="Enter new group name"
                     type="text"
                     maxLength={25}
                     value={newGroupName}
                     onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </label>
                </div>

                <div className="input_gropu2">
                  <div className="input_div_1EditGropu">
                  <label>Group Image </label>
                    <input
                    hidden
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])} 
                    />
                 
                  <button 
                  type="button" 
                  onClick={handleButtonClick} 
                  className="editGropu_btn_images">
                    Upload New Photo
                  </button>
                  </div>

                  <img 
                      src={isGroup ? (chat.groupImage || "/default-avatar.png") : (friend?.profile?.image || "/default-avatar.png")}
                      className="chat_avatar_edit"
                      onError={(e) => (e.target.src = "/default-avatar.png")}
                    />
                </div>



               <div className="warning_window_btns">
                <button type="submit">Save</button>
                <button type="button" onClick={() => {setEditGroupWindow(false); setGroupInfo(true)}}>Cancel</button>
               </div>

              </form>
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
   
  {/*
    <div className="message_div">
        {Array.isArray(messages) && messages.map(m => (
            <MessageBubble key={m._id} message={m} user={user}/>
        ))}
        <div ref={messageEndRef} />
    </div>
    */}

    
  <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }} className="message_div">
   
       {loading && <div className="loading-spinner">Loading old messages...</div>}
      <Virtuoso
          ref={virtuosoRef}
          data={messages}
          initialTopMostItemIndex={messages.length > 0 ? messages.length - 1 : 0}
          firstItemIndex={firstItemIndex}
          computeItemKey={(index, message) => message._id || index}
          increaseViewportBy={{ top: 800, bottom: 400 }}
          overscan={300}
          followOutput={(isAtBottom) => (isAtBottom ? "smooth" : false)}
          atTopStateChange={(atTop) => {
            const now = Date.now();

            if (
              atTop &&
              !loadingRef.current &&
              hasMore &&
              now - lastLoadTime.current > 500
            ) {
              lastLoadTime.current = now;
              loadMoreMessages();
            }
          }}
          itemContent={(index, message) => (
            <div style={{ padding: '5px 0', display: 'flex', justifyContent: 'center' }}>
              <MessageBubble message={message} user={user} setEditingMessage={setEditingMessage}
                onDeleteLocal={(deletedId) => {
                setMessages((prev) => prev.filter(m => m._id !== deletedId));
              }}
              />
            </div>
          )}
        />
  </div>

    

    
     {isTyping && <p>{isGroup ? "Someone is typing..." : `${friend?.username} is typing...`}</p>}
     <MessageInput chatId={chat._id} editingMessage={editingMessage}
       cancelEdit={cancelEdit} 
       updateMessageLocal={(updatedMsg) => {
        setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
        }}
       addMessage={(newMsg) => setMessages(prev => [...prev, newMsg])}
       />
     
     </div>
    </div>
    </>
   )
}

export default ChatWindow;