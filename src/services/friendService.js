
const API = "http://localhost:5000/api";

export const sendFriendRequest = async (receiverId) => {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API}/friends/request`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ receiverId })
        });

        const data = await res.json();

        return data;

    } catch (err) {
        console.error(err);
    }
}

export const getFriendRequests = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined") return [];
    try {
        const res = await fetch(`${API}/friends/request`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return res.json();

    } catch (err) {
        console.error(err);
    }
}

export const acceptFriendRequest = async (requestId) => {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API}/friends/accept`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ requestId })
        });

      return res.json();

    } catch (err) {
        console.error(err);
    }
}

export const rejectFriendRequest = async (requestId) => {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API}/friends/reject`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ requestId })
        });

        return res.json();

    } catch (err) {
        console.error(err);
    }
}


export const getFriends = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/friends/list`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return res.json();
}
