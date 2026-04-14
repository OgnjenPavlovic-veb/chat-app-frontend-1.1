import { useState, useEffect, useRef } from "react";
import { createGroup } from "../services/chatService.js";
import { Link } from "react-router-dom";


function GroupsPage () {
    const API = "http://localhost:5000/api";
    const [name, setName] = useState("");
    const [image, setImage] = useState(null);
    const [groups, setGroups] = useState([]);
    const [create, setCreate] = useState(false);
    const fileInputRef = useRef();
    
    const handleFileClick = () => {
         fileInputRef.current.click();
    }

    const handleFileChange = (e) => {
       if (e.target.files.length > 0) {
        setImage(e.target.files[0]);
       }
    }

    const handleCreate = async () => {
        if (!name) return alert("The group must have a name.");
       const res = await createGroup({ name, image });
       console.log(res);
       
       if (res._id) {
        alert("Group Created");
        loadGroups(); 
       } else {
        alert("Error creating group.");
       }

    }


   const loadGroups = async () => {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API}/chat`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            console.error("Failed to load chats");
            return;
        }

        const data = await res.json();
        const onlyGroups = data.filter(c => c.isGroup);

        setGroups(onlyGroups);
        }


         useEffect(() => {
          loadGroups();
         }, []);
   


    return (
        <>
        <div className="groups_div" onClick={() => setCreate(false)}>
          <b className="gropu_b_create"  
          onClick={(e) => {e.stopPropagation(); setCreate(!create)}}
          style={{ cursor: "pointer" }}
          >{create ? "Close Panel" : "Create Group"}</b>
          
        <div className={`create_group_container ${create ? "open" : ""}`} 
          onClick={(e) => e.stopPropagation()}>

           <div className="create_div">

            <label>Group Name
            <input 
            placeholder="Create Group"
            value={name}
            onChange={(e) => setName(e.target.value)}
            />
            </label>
           
            
           
           <div className="create_div2">
           <button onClick={handleFileClick}>Group Image</button>

            <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
            />

            <button onClick={handleCreate}>Create</button>
            </div>
            </div>
        </div>
     
    
    
        <div className="grups_list">
            <p className="gropus_p">Groups</p>
             {groups.map(group => (
                <Link key={group._id} to={`/chat/${group._id}`} className="group_link">
                <div className="group_item" >
                  
                    <img 
                    src={group.groupImage || "/default-avatar.png"}
                    alt="avatar"
                    className="group_avatar"
                    />

                    <p>{group.name}</p>
                 

                
                </div>
                </Link>
             ))}
        </div>
      

        </div>
        </>
    )
}

export default GroupsPage;