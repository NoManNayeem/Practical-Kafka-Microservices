import React from 'react';
import { Package, Loader2 } from 'lucide-react';
import '../App.css';

const OrderForm = ({ item, setItem, quantity, setQuantity, createOrder, loading }) => {
    return (
        <div className="card input-card glass-panel">
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
                        className="glass-input"
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
                        className="glass-input"
                    />
                </div>
                <button type="submit" disabled={loading} className="action-btn glow-btn">
                    {loading ? <Loader2 className="spin" /> : 'Create Order'}
                </button>
            </form>
        </div>
    );
};

export default OrderForm;
