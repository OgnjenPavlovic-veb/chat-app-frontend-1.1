import "./accaunt.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Accaunt ({ user, setUser }) {
    const API = "http://localhost:5000/api";
    const navigate = useNavigate();
    const [username, setUsername] = useState(user.username);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [image, setImage] = useState(null);
    const [openWindow, setOpenWindow] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        const res = await fetch(`${API}/accaunt/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                username,
                oldPassword,
                newPassword
            })
        });

        const data = await res.json();

        if (res.ok) {
            setUser(data);
            alert("Accaunt updated.");
        } else {
            alert(data.message);
        }
    }

    const handleImage = async () => {
        const token = localStorage.getItem("token");

        console.log("SELECTED IMAGE:", image);

        if (!image) {
            alert("No image selected");
            return;
        }
 

        const formData = new FormData();
        formData.append("image", image);

        const res = await fetch(`${API}/accaunt/profile-image`, {
            method: "PUT",
            headers: {
                Authorization: "Bearer " + token
            },
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            setUser(prev => ({
                ...prev, 
                profile: {
                    ...prev.profile,
                    image: data.image
                }
            }))
        }
    }

    const handleDelete = async () => {
       
        const token = localStorage.getItem("token");

        const res = await fetch(`${API}/accaunt/deleteAcc`, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();

        if (res.ok) {
            alert("Account deleted");

            localStorage.removeItem("token");
            setUser(null);

            navigate("/");
            window.location.reload();
        } else {
            alert(data.message);
        }
    }


    return (
        <>
        <div className="accaunt_div">
             
           <h1>Accaunt Setings</h1>
           <h2>{user.username}</h2>
         
         <form onSubmit={handleUpdate} className="acc_form">
        <div className="accaunt_from1">
         <div className="accaunt_image_div_setings">
            {user.profile?.image && (
            <img 
            src={`http://localhost:5000/uploads/${user.profile.image}`}
            alt="profile"
            />
            )}
         </div>

         <label htmlFor="fileInput">Change Image</label>
            <input 
            id="fileInput"
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            hidden
            />
        

         <button type="button" onClick={handleImage}>Upload Image</button>
         </div>

        <div className="accaunt_from2">

            <label>Change Username
                <input 
                type="text"
                placeholder="New Username"
                value={username}
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