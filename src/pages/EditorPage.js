import React, { useEffect, useRef, useState } from "react";
import Client from "../components/Client.js";
import Editor from "../components/Editor.js";
import initSocket from "../socket.js";
import ACTIONS from "../Actions.js";
import { useLocation, useNavigate, Navigate, useParams } from "react-router-dom";
import ChatInput from "../chat/chatInput.js";
import FileStru from "../files/filesStruct.jsx";
import toast from "react-hot-toast";
import Sidebar from "../sidebar/Sidebar.jsx";

const EditorPage = () => {
    const navigate = useNavigate();
    const socketRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const [clients, setClients] = useState([]);
    const [currentView, setCurrentView] = useState("clients"); // Default view is client list
    const [messageList, setMessageList] = useState([]); // Store chat messages
    const joinedRef = useRef(false); // Using ref to track join status

    useEffect(() => {
        const init = async () => {
            if (!joinedRef.current) {
                joinedRef.current = true; // Set as joined to prevent re-joining
                socketRef.current = await initSocket();

                socketRef.current.on('connect_error', (err) => handleErrors(err));
                socketRef.current.on('connect_failed', (err) => handleErrors(err));

                function handleErrors(e) {
                    console.log('socket error', e);
                    toast.error('Socket connection failed, try again later.');
                    navigate('/');
                }

                socketRef.current.emit(ACTIONS.JOIN, {
                    roomId,
                    username: location.state?.username,
                });

                // Listening for joined event
                socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined the room.`);
                    }
                    setClients(clients);
                });

                // Listening for disconnected event
                socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(client => client.socketId !== socketId);
                    });
                });

                // Listening for chat messages
                socketRef.current.on(ACTIONS.SEND_MESG, (data) => {
                    if (data) {
                        setMessageList((prevMessages) => [...prevMessages, data]);
                    }
                });
            }
        };

        init();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current.off(ACTIONS.JOINED);
                socketRef.current.off(ACTIONS.DISCONNECTED);
                socketRef.current.off(ACTIONS.SEND_MESG);
            }
        };
    }, [navigate, roomId, location.state?.username]);

    if (!location.state) {
        return <Navigate to="/" />;
    }

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success("Room ID copied to clipboard");
        } catch (err) {
            toast.error("Failed to copy Room ID");
        }
    };

    const leaveRoom = () => {
        navigate('/');
    };

    const handleSidebarButtonClick = (view) => {
        setCurrentView(view);
    };

    return (
        <div className="mainWrap">
            <Sidebar onButtonClick={handleSidebarButtonClick} />
            <div className="aside">
                <div className="asideInner">
                    {currentView === "chat" && (
                        <ChatInput
                            socketRef={socketRef}
                            roomId={roomId}
                            messageList={messageList}
                            setMessageList={setMessageList}
                        />
                    )}
                    {currentView === "clients" && (
                        <>
                            <h3>Connected</h3>
                            <div className="clientsList">
                                {clients.map((client) => (
                                    <Client
                                        key={client.socketId}
                                        username={client.username}
                                    />
                                ))}
                            </div>
                            <button className="btn copyBtn" onClick={copyRoomId}>
                                Copy ROOM ID
                            </button>
                            <button className="btn leaveBtn" onClick={leaveRoom}>
                                Leave
                            </button>
                        </>
                    )}
                    {currentView === "files" && <FileStru socketRef={socketRef} roomId={roomId} />}
                </div>

            </div>

            <div className="editorWrap">
                <Editor socketRef={socketRef} roomId={roomId} />
            </div>
        </div>
    );
};

export default EditorPage;
