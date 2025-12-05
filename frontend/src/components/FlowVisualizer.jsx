import React from 'react';
import { Package, Factory, Bell, ArrowRight } from 'lucide-react';
import '../App.css';

const FlowVisualizer = ({ activeStep }) => {
    return (
        <div className="card flow-card glass-panel">
            <h2>System Architecture Flow</h2>
            <div className="stepper">
                <div className={`step ${activeStep >= 1 ? 'active' : ''}`}>
                    <div className="step-icon-container">
                        <Package size={24} />
                    </div>
                    <div className="step-label">Order Service</div>
                    <div className="step-desc">Creates Order</div>
                </div>
                <div className={`connector ${activeStep >= 2 ? 'active' : ''}`}>
                    <ArrowRight size={20} />
                </div>
                <div className={`step ${activeStep >= 2 ? 'active' : ''}`}>
                    <div className="step-icon-container">
                        <Factory size={24} />
                    </div>
                    <div className="step-label">Inventory Service</div>
                    <div className="step-desc">Validates Stock</div>
                </div>
                <div className={`connector ${activeStep >= 3 ? 'active' : ''}`}>
                    <ArrowRight size={20} />
                </div>
                <div className={`step ${activeStep >= 3 ? 'active' : ''}`}>
                    <div className="step-icon-container">
                        <Bell size={24} />
                    </div>
                    <div className="step-label">Notification Service</div>
                    <div className="step-desc">Alerts User</div>
                </div>
            </div>
        </div>
    );
};

export default FlowVisualizer;
