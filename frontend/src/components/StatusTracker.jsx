import React from 'react';
import { Bell, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import '../App.css';

const StatusTracker = ({ orderId, status, checkStatus }) => {
    if (!orderId) return null;

    return (
        <div className="card status-card glass-panel">
            <h2><Bell className="card-icon" /> Track Status</h2>
            <div className="status-display glass-input">
                <span className="status-label">Order ID:</span>
                <span className="status-value">#{orderId}</span>
            </div>
            <div className="status-display glass-input">
                <span className="status-label">Current Status:</span>
                <span className={`status-badge status-${status?.toLowerCase()}`}>
                    {status === 'VALIDATED' && <CheckCircle2 size={16} />}
                    {status === 'REJECTED' && <AlertCircle size={16} />}
                    {status === 'PENDING' && <Loader2 size={16} className="spin" />}
                    {status}
                </span>
            </div>
            <button onClick={checkStatus} className="refresh-btn glass-btn">
                <RefreshCw size={18} /> Refresh Status
            </button>
        </div>
    );
};

export default StatusTracker;
