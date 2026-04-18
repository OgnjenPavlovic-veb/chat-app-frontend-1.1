import { acceptFriendRequest, rejectFriendRequest } from "../services/friendService";

function FriendRequest ({ requests, removeRequest }) {
   
    const handleAccept = async (id) => {
      const res = await acceptFriendRequest(id);
      console.log(res.message);
      removeRequest(id);
    }

    const handleReject = async (id) => {
      const res = await rejectFriendRequest(id);
      console.log(res.message);
      removeRequest(id);
    }

    return (
        <>
        <div className="request_div">
            <h2>Friend Request</h2>

            {requests.length === 0 && <p>No requests.</p>}
            
            <div className="request_list">
            {requests.map((req) => (
                <div key={req._id} className="request_cart">
                    <div className="request_cart_image_username">   
                   <img 
                    src={req.sender?.profile?.image || "/default-avatar.png"}
                    className="request_image"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                    />   
                
                    <p>{req.sender.username}</p>
                    </div>

                    <div className="request_cart_btns">
                    <button onClick={() => handleAccept(req._id)}>Accept</button>
                    <button onClick={() => handleReject(req._id)}>Reject</button>
                    </div>
                </div>
            ))}
            </div>

        
        </div>
        </>
    )
}

export default FriendRequest;