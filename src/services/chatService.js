
import API from "./api.js";


export const accessChat = async (userId) => {
    
    const res = await API.post(`/chat`, { userId })
 
    return res.data;
}
//-----------------------------------------------------
export const getMessages = async (chatId, before = null, limit = 20) => {
    let url = `/message/${chatId}?limit=${limit}`;

    if (before) {
        url += `&before=${before}`;
    }

    const res = await API.get(url);
    return res.data;

}
//-----------------------------------------------------
export const sendMessage = async ({ chatId, text, images }) => {
    
    const formData = new FormData();

       formData.append("chatId", chatId);
       formData.append("text", text);

       if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
            formData.append("images", images[i]);
        }
    }

    const res = await API.post(`/message`, formData);

    return res.data;
}

//------------------------------------------------------


export const createGroup = async ({ name, image }) => {
    
    const formData = new FormData();

    formData.append("name", name);
    formData.append("image", image);

    const res = await API.post(`/chat/group`, formData);

    return res.data;
}