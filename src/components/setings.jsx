import "./setings.css";



function Setings ({ changeTheme }) {
    

    return (
        <>
        <div className="setnigs_div">
          <h1>Setings</h1>

          <div className="modts_div">
            <h2>Color Mods</h2>
             
             <button onClick={() => changeTheme("default")}>Default</button>
             <button onClick={() => changeTheme("green")}>Greeen</button>
             <button onClick={() => changeTheme("black")}>Black</button>
             <button onClick={() => changeTheme("pink")}>Pink</button>
             <button onClick={() => changeTheme("red")}>Red</button>
          </div>

           <p>
            Here you can change the colors of the application as you like. 
            Edit the application just the way you like it.
           </p>

        </div>
        </>
    )
}

export default Setings;