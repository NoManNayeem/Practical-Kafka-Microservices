import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import '../App.css';

const SystemLogs = ({ logs }) => {
    const logsEndRef = useRef(null);

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    return (
        <div className="card console-card glass-panel">
            <h2><Terminal className="card-icon" /> System Logs</h2>
            <div className="console-window">
                {logs.length === 0 ? (
                    <div className="console-placeholder">
                        <Terminal size={40} />
                        <span>Waiting for system activity...</span>
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className={`console-line type-${log.type}`}>
                            <span className="timestamp">[{log.timestamp}]</span>
                            <span className="message">{log.message}</span>
                        </div>
                    ))
                )}
                <div ref={logsEndRef} />
            </div>
        </div>
    );
};

export default SystemLogs;
