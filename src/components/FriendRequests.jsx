import { acceptFriendRequest, rejectFriendRequest } from "../services/friendService";

function FriendRequest ({ requests, removeRequest, user }) {
    const imageUrlAcc = "http://localhost:5000/uploads";

    const handleAccept = async (id) => {
      const res = await acceptFriendRequest(id);
      alert(res.message);
      removeRequest(id);
    }

    const handleReject = async (id) => {
      const res = await rejectFriendRequest(id);
      alert(res.message);
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
                    src={user.profile?.image ? `${imageUrlAcc}/${user.profile.image}` : "/default-avatar.png"}
                    className="request_image"
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