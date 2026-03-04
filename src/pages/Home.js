import React, { useState } from 'react';
import {v4 as uuidV4} from 'uuid';
import toast from 'react-hot-toast';
import {useNavigate} from 'react-router-dom';

function Home() {

  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUserName] = useState('');

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success('Created a new room');
  }

  const joinRoom = () => {
    if(!roomId || !username) {
      toast.error('UserId & UserName is required');
      return;
    }
    
    //Redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      }
    })

  }

  const handleInputEnter = (e) => {
    if(e.code == 'Enter') {
      joinRoom();
    }
  }

  return (
    <div className="container">
      <div className="left">
        <div className="login-section">
          <header>
            <h2 className="animation a1">CollabScript</h2>
            <h5 className="animation a2">Paste invitation ROOM ID</h5>
          </header>
          <form>
            <input
              type="text"
              placeholder="ROOM ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyUp={handleInputEnter}
              className="input-field animation a3"
            />
            <input
              type="text"
              placeholder="USERNAME"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              onKeyUp={handleInputEnter}
              className="input-field animation a4"
            />
            <p className="animation a5"><a onClick={createNewRoom} href="#">Generate ROOM ID</a></p>
            <button className="animation a6" onClick={joinRoom}>Join Now</button>
          </form>
        </div>
      </div>
      <div className="right"></div>
    </div>

  )
}

export default Home