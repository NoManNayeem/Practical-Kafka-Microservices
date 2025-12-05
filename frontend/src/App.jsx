import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'
import {
  Package,
  Factory,
  Bell,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

function App() {
  const [item, setItem] = useState('')
  const [quantity, setQuantity] = useState('')
  const [orderId, setOrderId] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const [logs, setLogs] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const logsEndRef = useRef(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const createOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLogs([]); // Clear previous logs
    setActiveStep(1);
    addLog("Initiating order creation...");
    addLog(`Sending request to Order Service (POST /api/orders): Item=${item}, Qty=${quantity}`);

    try {
      // Assuming Order Service is at localhost:8000
      const response = await axios.post('http://localhost:8000/api/orders/', {
        item,
        quantity: parseInt(quantity)
      });
      setOrderId(response.data.id);
      setStatus(response.data.status);
      addLog(`Order Service: Order #${response.data.id} created successfully.`, 'success');
      addLog(`Order Service: Published 'order_created' event to Kafka.`, 'info');
      addLog("Waiting for Inventory Service to consume event...", 'pending');
      setActiveStep(2);
    } catch (error) {
      console.error("Error creating order:", error);
      addLog(`Error creating order: ${error.message}`, 'error');
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!orderId) return;
    addLog(`Polling Notification Service for status of Order #${orderId}...`);

    try {
      // Assuming Notification Service is at localhost:5001
      const response = await axios.get(`http://localhost:5001/status/${orderId}`);
      const newStatus = response.data.status;
      setStatus(newStatus);

      if (newStatus === 'VALIDATED' || newStatus === 'REJECTED') {
        if (activeStep < 3) {
          addLog(`Inventory Service: Processed 'order_created' event.`, 'success');
          addLog(`Inventory Service: Stock check result: ${newStatus}.`, newStatus === 'VALIDATED' ? 'success' : 'error');
          addLog(`Inventory Service: Published 'order_validated' event to Kafka.`, 'info');
          addLog(`Notification Service: Consumed 'order_validated' event.`, 'success');
          addLog(`Process Complete: Final Status is ${newStatus}.`, 'success');
          setActiveStep(3);
        }
      } else {
        addLog(`... Status is still ${newStatus}. Inventory Service might be busy.`, 'pending');
      }
    } catch (error) {
      console.error("Error checking status:", error);
      addLog(`Notification Service not ready or unreachable yet.`, 'warning');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-container">
          <ShoppingBag size={40} className="app-logo" />
        </div>
        <h1>Practical Kafka POC</h1>
        <p>Event-Driven Microservices Demo</p>
      </header>

      <div className="main-container">
        <div className="control-panel">
          <div className="card input-card">
            <h2><Package className="card-icon" /> Place Order</h2>
            <form onSubmit={createOrder}>
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="e.g., Apple"
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g., 10"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="action-btn">
                {loading ? <Loader2 className="spin" /> : 'Create Order'}
              </button>
            </form>
          </div>

          {orderId && (
            <div className="card status-card">
              <h2><Bell className="card-icon" /> Track Status</h2>
              <div className="status-display">
                <span className="status-label">Order ID:</span>
                <span className="status-value">#{orderId}</span>
              </div>
              <div className="status-display">
                <span className="status-label">Current Status:</span>
                <span className={`status-badge status-${status?.toLowerCase()}`}>
                  {status === 'VALIDATED' && <CheckCircle2 size={16} />}
                  {status === 'REJECTED' && <AlertCircle size={16} />}
                  {status === 'PENDING' && <Loader2 size={16} className="spin" />}
                  {status}
                </span>
              </div>
              <button onClick={checkStatus} className="refresh-btn">
                <RefreshCw size={18} /> Refresh Status
              </button>
            </div>
          )}
        </div>

        <div className="visualization-panel">
          <div className="card flow-card">
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

          <div className="card console-card">
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
        </div>
      </div>
    </div>
  );
}

export default App
