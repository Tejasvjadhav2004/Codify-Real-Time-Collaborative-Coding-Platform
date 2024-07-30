import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faFile, faUserGroup } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ onButtonClick }) => {
    return (
        <div className="sidebar">
            <button className="sidebar-btn" onClick={() => onButtonClick("files")}>
                <FontAwesomeIcon icon={faFile} size="1.8x" />
            </button>
            <button className="sidebar-btn" onClick={() => onButtonClick("chat")}>
                <FontAwesomeIcon icon={faMessage} size="1.8x" />
            </button>
            <button className="sidebar-btn" onClick={() => onButtonClick("clients")}>
                <FontAwesomeIcon icon={faUserGroup} size="1x" />
            </button>
        </div>
    );
};

export default Sidebar;
