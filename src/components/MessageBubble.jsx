import React, { useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import API from '../services/api';
import { socket } from '../socket';

function MessageBubble ({ message, user, onDeleteLocal, setEditingMessage }) {
    const [showMenu, setShowMenu] = useState(false)
    
    const senderId = typeof message.sender === "object"
            ? message.sender._id
            : message.sender;

    const isMine = user?._id?.toString() === senderId?.toString();

    const isSeen = message.seenBy?.some(id => id.toString() !== senderId?.toString());
    const isDelivered = message.deliveredTo?.length > 1;

    const cleanText = useMemo(() => {
        return DOMPurify.sanitize(message.text || "")
    }, [message.text]);

    const handleDelete = async () => {
        if (!message?._id) {
        console.error("Greška: message._id nedostaje!");
        return;
    }

        try {
            console.log(API.defaults.baseURL)
            console.log("Pokušavam brisanje poruke sa ID:", message._id);
            await API.delete(`/message/deleteMessage/${message._id}`);
            const chatId = message.chat._id || message.chat;
            socket.emit("delete message", {
                 messageId: message._id,
                 chatId: chatId
            });
           if (onDeleteLocal) {
                onDeleteLocal(message._id); 
            }
        } catch (err) {
            console.log("handleDelete error. Delete failed.", err);
        }
    }

    return (
        <>
        
        <div className={`message_bubble ${isMine ? "mine" : "theirs"}`} 
             onContextMenu={(e) => {
                if (isMine) {
                    e.preventDefault();
                    setShowMenu(true);
                }
             }}
        >
            {showMenu && (
                <div className="message_menu" onMouseLeave={() => setShowMenu(false)}>

                     <button onClick={() => {
                            setEditingMessage(message);
                            setShowMenu(false);
                        }}>Edit</button>

                      <button onClick={handleDelete} style={{color: 'red'}}>Delete</button>
                      <button onClick={() => setShowMenu(false)}>Cancel</button>
                </div>
            )}
             
             <div className={`chat_user_info ${isMine ? "mine" : "theirs"}`}>
            {!isMine && (
                <img 
                src={message.sender?.profile?.image || "/default-avatar.png"}
                alt="avatar"
                onError={(e) => (e.target.src = "/default-avatar.png")}
                className="message_avatar"
                />
            )}

            <b className="chat_username_sender">{message.sender?.username}</b>
            </div>

        {/*    {message.text && <p>{message.text}</p>}  */}

             {message.text && (
                <p 
                    dangerouslySetInnerHTML={{ __html: cleanText }} 
                    className="message_text" 
                />
            )}

            {message.images?.map((img, i) => (
                <img key={i} src={img} alt="chat-img" className="chat_image"/>
            ))}

            {isMine && 
            <span>{isSeen ? "👁 Seen" : isDelivered ? "✔✔ Delivered" : "✔ Sent"}</span>
            }

        </div>
        </>
    )
}

export default React.memo(MessageBubble);