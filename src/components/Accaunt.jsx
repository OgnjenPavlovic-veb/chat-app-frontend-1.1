import "./accaunt.css";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api.js";


function Accaunt ({ user, setUser }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState(user.username);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [image, setImage] = useState(null);
    const [openWindow, setOpenWindow] = useState(false);
    const ImagesChange = useRef(null);


    const handleUpdate = async (e) => {
        e.preventDefault();
       try {  
        const res = await API.put(`/accaunt/update`, {
                username,
                oldPassword,
                newPassword
        });

        let updatedUser = res.data;

        if (image) {
            const formData = new FormData();
            formData.append("image", image);
            
            const resImage = await API.put(`/accaunt/profile-image`, formData);
            
           
            updatedUser = {
                ...updatedUser,
                profile: { ...updatedUser.profile, image: resImage.data.image }
            };
        }

       
        setUser(updatedUser);
        alert("Account and profile image updated successfully!");

        setOldPassword("");
        setNewPassword("");
        setImage(null)
        
      } catch (err) {
        alert(err.response?.data?.message || "Error updating account");
      }
    }

    const handleDelete = async () => {
       try {
            await API.delete(`/accaunt/deleteAcc`);
            alert("Account deleted");

            localStorage.removeItem("token");
            setUser(null);

            navigate("/");
            window.location.reload();

      } catch (err) {
        alert(err.response?.data?.message || "Error deleting account");
      }
    }

    const handleImageChange = () => {
        ImagesChange.current.click();
    }


    return (
        <>
        <div className="accaunt_div">
             
           <h1>Accaunt Settings</h1>
           <h2>{user.username}</h2>
         
         <form onSubmit={handleUpdate} className="acc_form">
        <div className="accaunt_from1">
         <div className="accaunt_image_div_setings">
            {user.profile?.image && (
            <img 
            src={image ? URL.createObjectURL(image) : user.profile?.image}
            alt="profile"
            />
            )}
         </div>
         
         
         <label>Change Image</label>
            <input
            ref={ImagesChange} 
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            hidden
            />
        
         <button type="button" onClick={handleImageChange}>Upload Image</button>
         </div>

        <div className="accaunt_from2">

            <label>Change Username ({username.length}/25)
                <input 
                type="text"
                placeholder="New Username"
                value={username}
                maxLength={25}
                onChange={(e) => setUsername(e.target.value)}
                />
            </label>

            <label>Old Password
                <input 
                type="password"
                placeholder="**********"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                />
            </label>

            <label>New Password
                <input 
                type="password"
                placeholder="**********"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                />
            </label>

            <div className="accaunt_btns">
                <button type="submit">Update Accaunt</button>
                <button type="button" onClick={() => navigate("/")}>Chancel</button>
            </div>

        </div>
              <button className="window_delete" type="button" onClick={() => setOpenWindow(true)}>Delete Accaunt</button>
           </form>
           

           {openWindow && (
            <div className="overlay2" onClick={() => setOpenWindow(false)}>
           <div className="window_delete_div" onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to delete your account?</p>
            <div className="delete_btns_div">
            <button type="button" onClick={handleDelete} className="delete_btn">Delete Accaunt</button>
            <button type="button" onClick={() => setOpenWindow(false)}>Chancel</button>
            </div>
           </div>
           </div>
           )}
        </div>
        
        </>
    )
}

export default Accaunt;