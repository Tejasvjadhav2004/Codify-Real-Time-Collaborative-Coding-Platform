import React, { useState, useEffect, useRef, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { EditorView } from "@codemirror/view";
import ACTIONS from "../Actions.js";
import { debounce } from "lodash";

const Editor = ({ socketRef, roomId }) => {
    const [code, setCode] = useState("// Write your code here\n");
    const editorRef = useRef(null);
    const codeRef = useRef(code); // To keep track of the current code without causing re-renders
    const remoteCodeChange = useRef(false); // Flag to prevent local changes triggering remote updates

    const handleCodeChange = useCallback(
        debounce((newCode) => {
            if (!remoteCodeChange.current) {
                socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                    roomId,
                    code: newCode,
                });
            }
        }, 300), // Adjust debounce delay as necessary
        []
    );

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code: newCode }) => {
                if (newCode !== null && newCode !== codeRef.current) {
                    remoteCodeChange.current = true; // Set flag to true to prevent triggering local update
                    setCode(newCode);
                    codeRef.current = newCode; // Update the ref to match the new code
                    remoteCodeChange.current = false; // Reset flag after updating state
                }
            });
        }
    }, [socketRef.current]);

    const logChangesExtension = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
            const newCode = update.state.doc.toString();
            codeRef.current = newCode;
            setCode(newCode); // Update the state
            handleCodeChange(newCode);
        }
    });

    return (
        <div>
            <div style={{ height: "500px" }}>
                <CodeMirror
                    value={code}
                    height="585px"
                    extensions={[javascript(), logChangesExtension]}
                    theme={dracula}
                    onUpdate={(viewUpdate) => {
                        if (editorRef.current === null) {
                            editorRef.current = { view: viewUpdate.view };
                        }
                    }}
                    options={{
                        lineNumbers: true,
                        tabSize: 2,
                    }}
                />
            </div>
        </div>
    );
};

export default Editor;








