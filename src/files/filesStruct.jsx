import React, { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import toast from "react-hot-toast";

const MessageEvent = {
    FILE_CREATED: "fileCreated",
    FILE_UPDATED: "fileUpdated",
    FILE_DELETED: "fileDeleted",
    FILE_RENAMED: "fileRenamed",
    FILES_LOADED: "filesLoaded",
};

const FileStru = ({ socketRef, roomId }) => {
    const fileInputRef = useRef();
    const [currentFile, setCurrentFile] = useState(null);
    const [files, setFiles] = useState([]);
    const [fileInputName, setFileInputName] = useState("");
    const [editingFileId, setEditingFileId] = useState(null);

    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on(MessageEvent.FILE_CREATED, ({ file }) => {
            setFiles((prevFiles) => [...prevFiles, file]);
            toast.success(`File created: ${file.name}`);
        });

        socketRef.current.on(MessageEvent.FILES_LOADED, (loadedFiles) => {
            setFiles(loadedFiles);
        });

        socketRef.current.on(MessageEvent.FILE_UPDATED, (updatedFile) => {
            setFiles((prev) =>
                prev.map((file) =>
                    file.id === updatedFile.id ? updatedFile : file
                )
            );
        });

        socketRef.current.on(MessageEvent.FILE_RENAMED, (renamedFile) => {
            setFiles((prev) =>
                prev.map((file) =>
                    file.id === renamedFile.id ? renamedFile : file
                )
            );
        });

        socketRef.current.on(MessageEvent.FILE_DELETED, (deletedFileId) => {
            setFiles((prev) => prev.filter((file) => file.id !== deletedFileId));
            if (currentFile && currentFile.id === deletedFileId) {
                setCurrentFile(null);
            }
        });

        return () => {
            socketRef.current.off(MessageEvent.FILES_LOADED);
            socketRef.current.off(MessageEvent.FILE_UPDATED);
            socketRef.current.off(MessageEvent.FILE_RENAMED);
            socketRef.current.off(MessageEvent.FILE_DELETED);
        };
    }, [socketRef, currentFile]);

    const onFileChange = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const selectedFile = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            const file = {
                id: uuidv4(),
                name: selectedFile.name,
                content: text,
            };

            setFiles((prev) => [...prev, file]);
            setCurrentFile(file);
            if (socketRef.current) {
                socketRef.current.emit(MessageEvent.FILE_CREATED, { file });
            }
        };
        reader.readAsText(selectedFile);
    };

    const createFile = (name) => {
        let num = 1;
        let fileExists = files.some((file) => file.name === name);

        while (fileExists) {
            name = `${name} (${num++})`;
            fileExists = files.some((file) => file.name === name);
        }

        const id = uuidv4();
        const file = {
            id,
            name,
            content: "",
        };
        setFiles((prev) => [...prev, file]);
        if (socketRef.current) {
            socketRef.current.emit(MessageEvent.FILE_CREATED, { file });
        }
        return id;
    };

    const updateFile = (id, content) => {
        setFiles((prev) =>
            prev.map((file) => {
                if (file.id === id) {
                    file.content = content;
                }
                return file;
            })
        );
        const file = { id, content };
        if (socketRef.current) {
            socketRef.current.emit(MessageEvent.FILE_UPDATED, { file });
        }
    };

    const deleteFile = (id) => {
        setFiles((prev) => prev.filter((file) => file.id !== id));
        if (socketRef.current) {
            socketRef.current.emit(MessageEvent.FILE_DELETED, { id });
        }
    };

    const downloadCurrentFile = () => {
        if (!currentFile) return toast.error("Open a file to download");

        const blob = new Blob([currentFile.content], {
            type: "text/plain;charset=utf-8",
        });
        saveAs(blob, currentFile.name);
    };

    const downloadAllFiles = () => {
        const zip = new JSZip();
        files.forEach((file) => {
            const blobFile = new Blob([file.content], {
                type: "text/plain;charset=utf-8",
            });
            zip.file(file.name, blobFile);
        });
        zip.generateAsync({ type: "blob" }).then(function (content) {
            saveAs(content, "Code-Sync-Files.zip");
        });
    };

    const handleOpenFile = () => {
        fileInputRef.current?.click();
    };

    const handleOnChange = (e) => {
        setFileInputName(e.target.value);
    };

    const handleConfirm = (e) => {
        e.preventDefault();

        if (fileInputName === "") {
            toast.error("File name cannot be empty");
        } else if (fileInputName.length > 25) {
            toast.error("File name cannot be longer than 25 characters");
        } else if (fileInputName === currentFile?.name) {
            toast.error("File name cannot be the same as before");
        } else {
            const isRenamed = renameFile(editingFileId, fileInputName);
            openFile(editingFileId);
            if (!isRenamed) {
                toast.error("File with same name already exists");
            } else {
                setEditingFileId(null);
            }
        }
    };

    const openFile = (id) => {
        if (currentFile) {
            updateFile(currentFile.id, currentFile.content);
        }
        const file = files.find((file) => file.id === id);
        if (!file) return toast.error("File cannot be opened");
        setCurrentFile(file);
    };

    const renameFile = (id, newName) => {
        const fileExists = files.some((file) => file.name === newName);

        if (fileExists) {
            return false;
        }

        setFiles((prev) =>
            prev.map((file) => {
                if (file.id === id) {
                    file.name = newName;
                }
                return file;
            })
        );

        const file = { id, name: newName };
        if (socketRef.current) {
            socketRef.current.emit(MessageEvent.FILE_RENAMED, { file });
        }

        return true;
    };

    const handleCancel = (e) => {
        e.preventDefault();
        setEditingFileId(null);
    };

    const handleRenameFile = (e, id) => {
        e.stopPropagation();
        setEditingFileId(id);
        const file = files.find((file) => file.id === id);
        setFileInputName(file.name);
    };

    const handleDeleteFile = (e, id, fileName) => {
        e.stopPropagation();
        deleteFile(id);
        toast.success(`Deleted file ${fileName}`);
    };

    const handleCreateNewFile = () => {
        createFile("Untitled");
    };

    return (
        <div className="flex w-full flex-col">
            <div className="mb-2 flex w-full flex-col gap-2 overflow-auto">
                <div className="flex flex-col">
                    {files.map((file) => {
                        return editingFileId !== file.id ? (
                            <div
                                key={file.id}
                                onClick={() => openFile(file.id)}
                                className="mb-2 flex w-full cursor-pointer justify-between rounded-md bg-darkHover p-2 hover:bg-hoverColor"
                            >
                                <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {file.name}
                                </p>
                                <span className="flex gap-4">
                                    <button
                                        onClick={(e) =>
                                            handleRenameFile(e, file.id)
                                        }
                                    >
                                        Rename
                                    </button>
                                    <button
                                        onClick={(e) =>
                                            handleDeleteFile(e, file.id, file.name)
                                        }
                                        className="text-danger"
                                    >
                                        Delete
                                    </button>
                                </span>
                            </div>
                        ) : (
                            <div className="rounded-md" key={file.id}>
                                <form
                                    onSubmit={handleConfirm}
                                    className="mb-2 flex w-full gap-4 rounded-md bg-darkHover p-2"
                                >
                                    <input
                                        type="text"
                                        className="w-[80%] flex-grow rounded-sm bg-white px-2 text-base text-black outline-none"
                                        autoFocus
                                        value={fileInputName}
                                        onChange={handleOnChange}
                                    />
                                    <span className="flex gap-4">
                                        <button type="submit">Confirm</button>
                                        <button onClick={handleCancel} type="reset">
                                            Cancel
                                        </button>
                                    </span>
                                </form>
                            </div>
                        );
                    })}
                </div>
                <button
                    className="my-2 flex w-full justify-center rounded-md bg-primary p-2 font-bold text-black transition-all"
                    onClick={handleCreateNewFile}
                >
                    New File
                </button>
            </div>

            <button
                className="flex w-full justify-start rounded-md p-2 transition-all hover:bg-darkHover"
                onClick={handleOpenFile}
            >
                Open File
            </button>
            <button
                className="flex w-full justify-start rounded-md p-2 transition-all hover:bg-darkHover"
                onClick={downloadCurrentFile}
            >
                Download File
            </button>
            <button
                className="flex w-full justify-start rounded-md p-2 transition-all hover:bg-darkHover"
                onClick={downloadAllFiles}
            >
                Download All Files
            </button>
            <input
                type="file"
                hidden
                onChange={onFileChange}
                ref={fileInputRef}
            />
        </div>
    );
};

export default FileStru;

