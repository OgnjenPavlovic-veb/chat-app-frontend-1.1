import { useState, useEffect } from "react";
import { sendMessage } from "../services/chatService";
import { socket } from "../socket";
import { useRef } from "react";
import API from '../services/api';

function MessageInput ({ chatId, addMessage, editingMessage, cancelEdit, updateMessageLocal }) {
    const [text, setText] = useState("");
    const [typing, setTyping] = useState(false);
    const [images, setImages] = useState([]);
    const fileInputRef = useRef();

    useEffect(() => {
        if (editingMessage) {
            setText(editingMessage.text);
        } else {
            setText("");
        }
    }, [editingMessage]);


    const handleSend = async () => {

       if(!text.trim() && images.length === 0) return;
      try {
       if (editingMessage) {
           const res = await API.put(`/message/editMessage/${editingMessage._id}`, { text });
           socket.emit("message updated", res.data);
           if (updateMessageLocal) {
             updateMessageLocal(res.data);
            }
           cancelEdit(); 
       } else {

        const message = await sendMessage({
            chatId,
            text,
            images
        });

        if (!message) {
            console.error("The server returned an empty response!");
            return;
        }
    
        addMessage(message);
        socket.emit("new message", {
            ...message,
            chat: typeof message.chat === 'object' ? message.chat._id : message.chat
        });

        setText("");
        setImages([])
        if (fileInputRef.current) fileInputRef.current.value = "";

        } 
      } catch (err) {
        console.error("Failed to send/edit message:", err);
      }
    }

    const handleTyping = async (e) => {
        setText(e.target.value);

        if (!typing) {
            setTyping(true);
            socket.emit("typing", chatId);
        }

        let lastTypingTime = new Date().getTime();

        setTimeout(() => {
            const now = new Date().getTime();
            const diff = now - lastTypingTime;

            if (diff >= 3000 && typing) {
                socket.emit("stop typing", chatId)
                setTyping(false)
            }
        }, 3000);
    }

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        setImages(prev => [...prev, ...files]);
    }

    const handleDragOver = (e) => {
        e.preventDefault();
    }

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    }

    return (
        <>
        <div className="message_input_container">
        
          {editingMessage && (
            <div className="editing_bar">
                <span>Editing message...</span>
                <button className="cancel_edit_btn" onClick={cancelEdit}>✖</button>
            </div>
          )}

        <div className="message_input"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        >

            <input 
            value={text}
            onChange={handleTyping}
            placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />

            {images.length > 0 && (
                <div className="preview_container">
                    {images.map((img, i) => (
                        <div key={i} className="preview_item">
                            <img src={URL.createObjectURL(img)}/>
                            <button onClick={() => removeImage(i)}>✖</button>
                        </div>
                    ))}
                </div>
            )}


            <button onClick={() => fileInputRef.current.click()}>📎</button>

            <input 
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: "none"}}
            onChange={(e) => {
                const files = Array.from(e.target.files);

                const imageFiles = files.filter(file =>
                    file.type.startsWith("image/")
                );

                setImages(prev => [...prev, ...imageFiles]);

                e.target.value = null;
                }}
            />

            <button onClick={handleSend}>{editingMessage ? "Save" : "Send"}</button>
        </div>
         </div>
        </>
    )
}

export default MessageInput;