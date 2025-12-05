from flask import Flask, jsonify
from flask_cors import CORS
from consumer import NotificationConsumer
from store import get_status
import logging

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)

# Start consumer in background thread
consumer_thread = NotificationConsumer()
consumer_thread.start()

@app.route('/status/<int:order_id>', methods=['GET'])
def check_status(order_id):
    status = get_status(order_id)
    return jsonify({'order_id': order_id, 'status': status})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
