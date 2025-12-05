# Simple in-memory store for demo purposes
# In production, use Redis or Database

order_status_store = {}

def update_status(order_id, status):
    order_status_store[order_id] = status

def get_status(order_id):
    return order_status_store.get(order_id, 'UNKNOWN')
