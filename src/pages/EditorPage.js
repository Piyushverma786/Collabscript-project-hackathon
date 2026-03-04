import React, { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { language, cmtheme } from '../../src/atoms';
import { useRecoilState } from 'recoil';
import ACTIONS from '../Actions';
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { makeSubmission } from './service';

const EditorPage = () => {
    const [showLoader, setShowLoader] = useState(false);
    const [lang, setLang] = useRecoilState(language);
    const [them, setThem] = useRecoilState(cmtheme);
    const [clients, setClients] = useState([]);
    const [input, setInput] = useState(''); // State for input
    const [output, setOutput] = useState(''); // State for output

    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();

    // Callback for running code
    const callback = ({ apiStatus, data, message }) => {
        if (apiStatus === 'loading') {
            setShowLoader(true);
        } else if (apiStatus === 'error') {
            setShowLoader(false);
            setOutput('Something went wrong');
        } else {
            setShowLoader(false);
            if (data.status.id === 3) {
                setOutput(atob(data.stdout)); // Display stdout
            } else {
                setOutput(atob(data.stderr)); // Display stderr
            }
        }
    };

    // Function to run code
    const runCode = useCallback(
        ({ code, lang }) => {
            makeSubmission({ code, language: lang, stdin: input, callback });
        },
        [input]
    );

    const onRunCode = () => {
        runCode({ code: codeRef.current, lang });
    };

    const downloadCode = () => {
        const blob = new Blob([codeRef.current || ''], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `code.${getFileExtension(lang)}`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const getFileExtension = (lang) => {
        switch (lang) {
            case 'python':
                return 'py';
            case 'javascript':
                return 'js';
            case 'cpp':
                return 'cpp';
            case 'java':
                return 'java';
            default:
                return 'txt';
        }
    };

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined the room.`);
                    console.log(`${username} joined`);
                }
                setClients(clients);
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    code: codeRef.current,
                    socketId,
                });
            });

            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast.success(`${username} left the room.`);
                setClients((prev) => {
                    return prev.filter((client) => client.socketId !== socketId);
                });
            });
        };

        init();
        return () => {
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
            socketRef.current.disconnect();
        };
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img className="logoImage" src="/finalLogo.png" alt="logo" />
                        <h3 className="logoText">Collab Code Sync</h3>
                    </div>
                    <h3 className="connected">Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client key={client.socketId} username={client.username} />
                        ))}
                    </div>
                </div>

                <label>
                    Select Language:
                    <select
                        value={lang}
                        onChange={(e) => {
                            setLang(e.target.value);
                            window.location.reload();
                        }}
                        className="seLang"
                    >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                    </select>
                </label>

                <label>
                    Select Theme:
                    <select
                        value={them}
                        onChange={(e) => {
                            setThem(e.target.value);
                            window.location.reload();
                        }}
                        className="seLang"
                    >
                        <option value="default">Default</option>
                        <option value="monokai">Monokai</option>
                        <option value="material">Material</option>
                        <option value="dracula">Dracula</option>
                        <option value="solarized">Solarized</option>
                    </select>
                </label>


<div className="oneline">
<button className="btn runBtn" onClick={onRunCode}>
    Run Code
                </button>
                <button className="btn downloadBtn" onClick={downloadCode}>
                    Download
                </button>

</div>
                
                <button className="btn copyBtn" onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>

            <div className="editorWrap">
                <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
            </div>

            <div className="coderunner">
                
                <div className="show-input">
                    <h4>Input</h4>
                    <textarea
                        className="input-box"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter input for the code..."
                    />
                    <h4>Output</h4>
                    <div className="output-box" style={{ whiteSpace: 'pre-wrap' }}>{output}</div>
                </div>
            </div>

            {showLoader && (
                <div className="fullpage-loader">
                    <div className="loader"></div>
                </div>
            )}
        </div>
    );
};

export default EditorPage;
