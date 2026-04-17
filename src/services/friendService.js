
import API from "./api.js";

export const sendFriendRequest = async (receiverId) => {
    

    try {
        const res = await API.post(`/friends/request`, { receiverId });
        return res.data;

    } catch (err) {
        console.error("Error sending friend request:", err);
        throw err;
    }
}

export const getFriendRequests = async () => {
    
    try {
        const res = await API.get(`/friends/request`);
        return res.data;

    } catch (err) {
        console.error("Error fetching friend requests:", err);
        return [];
    }
}

export const acceptFriendRequest = async (requestId) => {
    try {
        const res = await API.post(`/friends/accept`,{ requestId });
        return res.data;

    } catch (err) {
        console.error("Error accepting friend request:", err);
        throw err;
    }
}

export const rejectFriendRequest = async (requestId) => {
    try {
        const res = await API.post(`/friends/reject`, { requestId });
        return res.data;

    } catch (err) {
        console.error("Error rejecting friend request:", err);
        throw err;
    }
}


export const getFriends = async () => {
   try {
    const res = await API.get(`/friends/list`);
    return res.data;
   } catch (err) {
    console.error("Error fetching friends list:", err);
    return [];
   } 
}
