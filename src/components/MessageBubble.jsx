

function MessageBubble ({ message, user }) {
    const imageUrlAcc = "http://localhost:5000/uploads";

    const senderId = typeof message.sender === "object"
            ? message.sender._id
            : message.sender;

    const isMine = user?._id?.toString() === senderId?.toString();

    const isSeen = message.seenBy?.length > 1;
    const isDelivered = message.deliveredTo?.length > 1;

    return (
        <>
        
        <div className={`message_bubble ${isMine ? "mine" : "theirs"}`}>
             
             <div className={`chat_user_info ${isMine ? "mine" : "theirs"}`}>
            {!isMine && (
                <img 
                src={message.sender?.profile?.image ?`${imageUrlAcc}/${message.sender.profile.image}` : "/default-avatar.png"}
                alt="avatar"
                onError={(e) => (e.target.src = "/default-avatar.png")}
                className="message_avatar"
                />
            )}

            <b className="chat_username_sender">{message.sender?.username}</b>
            </div>

            {message.text && <p>{message.text}</p>}

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

export default MessageBubble;