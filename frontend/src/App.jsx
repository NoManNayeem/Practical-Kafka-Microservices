import { useState } from 'react'
import axios from 'axios'
import './App.css'
import { ShoppingBag } from 'lucide-react';
import OrderForm from './components/OrderForm';
import StatusTracker from './components/StatusTracker';
import FlowVisualizer from './components/FlowVisualizer';
import SystemLogs from './components/SystemLogs';

function App() {
  const [item, setItem] = useState('')
  const [quantity, setQuantity] = useState('')
  const [orderId, setOrderId] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

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
      <div className="background-animation"></div>
      <header className="App-header glass-panel">
        <div className="logo-container">
          <ShoppingBag size={40} className="app-logo" />
        </div>
        <div>
          <h1>Practical Kafka POC</h1>
          <p>Event-Driven Microservices Demo</p>
        </div>
      </header>

      <div className="main-container">
        <div className="control-panel">
          <OrderForm
            item={item}
            setItem={setItem}
            quantity={quantity}
            setQuantity={setQuantity}
            createOrder={createOrder}
            loading={loading}
          />

          <StatusTracker
            orderId={orderId}
            status={status}
            checkStatus={checkStatus}
          />
        </div>

        <div className="visualization-panel">
          <FlowVisualizer activeStep={activeStep} />
          <SystemLogs logs={logs} />
        </div>
      </div>
    </div>
  );
}

export default App

