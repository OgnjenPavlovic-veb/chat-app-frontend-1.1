
const API = "http://localhost:5000/api";


export const accessChat = async (userId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
    });

    return res.json();
}

export const getMessages = async (chatId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/message/${chatId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return res.json();
}

export const sendMessage = async ({ chatId, text, images }) => {
    const token = localStorage.getItem("token");

    const formData = new FormData();

       formData.append("chatId", chatId);
       formData.append("text", text);

       for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
       }

    const res = await fetch(`${API}/message`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    return res.json();
}

//------------------------------------------------------


export const createGroup = async ({ name, image }) => {
    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append("name", name);
    formData.append("image", image);

    const res = await fetch(`${API}/chat/group`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    return res.json()
}