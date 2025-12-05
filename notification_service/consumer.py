import json
import threading
from kafka import KafkaConsumer
import logging
import os
from store import update_status

logger = logging.getLogger(__name__)

class NotificationConsumer(threading.Thread):
    def __init__(self):
        super().__init__()
        self.daemon = True
        self.stop_event = threading.Event()

    def run(self):
        try:
            consumer = KafkaConsumer(
                'order_validated',
                bootstrap_servers=os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092'),
                group_id='notification_group',
                value_deserializer=lambda m: json.loads(m.decode('utf-8'))
            )
            logger.info("Notification Consumer started")
            
            while not self.stop_event.is_set():
                # Poll for messages
                msg_pack = consumer.poll(timeout_ms=1000)
                for tp, messages in msg_pack.items():
                    for msg in messages:
                        data = msg.value
                        logger.info(f"Received validation event: {data}")
                        
                        order_id = data.get('order_id')
                        status = data.get('status')
                        
                        if order_id and status:
                            update_status(order_id, status)
                            self.send_notification(order_id, status)
                            
        except Exception as e:
            logger.error(f"Error in notification consumer: {e}")

    def send_notification(self, order_id, status):
        # Simulate sending email/webhook
        logger.info(f"SENDING NOTIFICATION: Order {order_id} is {status}")

    def stop(self):
        self.stop_event.set()
