import React, { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ACTIONS from '../Actions.js';
import "../App.css"

const ChatInput = ({ socketRef, roomId, messageList, setMessageList }) => {
    const location = useLocation();
    const inputRef = useRef(null);
    const [currentMessage, setCurrentMessage] = useState('');

    const handleSendMessage = (event) => {
        event.preventDefault();
        if (inputRef.current && currentMessage.trim() !== '') {
            const messageData = {
                roomId,
                username: location.state?.username,
                message: currentMessage,
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
            };
            socketRef.current.emit(ACTIONS.SEND_MESG, messageData);
            setMessageList((prevMessages) => [...prevMessages, messageData]);
            setCurrentMessage(''); // Clear input after sending
        }
    };

    return (
        <form
            onSubmit={handleSendMessage}
            className="flex justify-between rounded-md border border-primary"
        >
            <div className="chat-body " style={{ overflowY: "scroll", height: "390px" }}>
                {messageList.map((msg, index) => (
                    <div key={index} style={{ color: "white", padding: "5px" }} id={location.state?.username === msg.username ? "you" : "other"}>
                        <p>{`${msg.username}: ${msg.message}`}</p>
                        <small>{msg.time}</small>
                    </div>
                ))}
            </div>
            <div className="Comb">
                <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    className="w-full flex-grow rounded-md border-none bg-dark p-2 outline-none"
                    placeholder="Enter a message..."
                    ref={inputRef}
                />
                <button
                    className="flex items-center justify-center rounded-r-md bg-primary p-2 text-black"
                    type="submit"
                >
                    Send
                </button>
            </div>
        </form>
    );
};

export default ChatInput;
