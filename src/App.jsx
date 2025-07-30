// App.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Connect to your backend Socket.IO server
const socket = io("http://localhost:3001"); // 🔗 Match your server URL

function App() {
  const [room, setRoom] = useState('');
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState([]);

  // Join a room
  const joinRoom = () => {
    if (room !== '') {
      socket.emit('join_room', room);
      setJoinedRoom(true);
    }
  };

  // Send a message
  const sendMessage = () => {
    if (message !== '') {
      const messageData = {
        room,
        author: 'User', // You can make this dynamic
        message,
        time: new Date().toLocaleTimeString(),
      };
      socket.emit('send_message', messageData);
      setMessageList((list) => [...list, messageData]);
      setMessage('');
    }
  };

  // Receive messages from server
  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessageList((list) => [...list, data]);
    });

    // Cleanup on unmount
    return () => {
      socket.off('receive_message');
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {!joinedRoom ? (
        <div>
          <h2>Join a Room</h2>
          <input
            type="text"
            placeholder="Room ID..."
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
        </div>
      ) : (
        <div>
          <h2>Chat Room: {room}</h2>
          <div style={{ height: 300, overflowY: 'auto', border: '1px solid gray', padding: 10 }}>
            {messageList.map((msg, index) => (
              <div key={index}>
                <strong>{msg.author}</strong> [{msg.time}]: {msg.message}
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
