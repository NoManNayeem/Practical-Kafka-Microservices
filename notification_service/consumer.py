import json
import threading
from kafka import KafkaConsumer
import logging
import os
import time
from store import update_status

logger = logging.getLogger(__name__)

class NotificationConsumer(threading.Thread):
    def __init__(self):
        super().__init__()
        self.daemon = True
        self.stop_event = threading.Event()
        self.bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')

    def run(self):
        consumer = None
        # Retry connection loop
        while not self.stop_event.is_set():
            try:
                consumer = KafkaConsumer(
                    'order_validated',
                    bootstrap_servers=self.bootstrap_servers,
                    group_id='notification_group',
                    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                    reconnect_backoff_ms=1000,
                    reconnect_backoff_max_ms=5000
                )
                logger.info("Notification Consumer connected to Kafka")
                break
            except Exception as e:
                logger.error(f"Failed to connect to Kafka, retrying in 5s: {e}")
                time.sleep(5)
        
        if not consumer:
            return

        try:
            while not self.stop_event.is_set():
                try:
                    # Poll for messages
                    msg_pack = consumer.poll(timeout_ms=1000)
                    for tp, messages in msg_pack.items():
                        for msg in messages:
                            try:
                                data = msg.value
                                logger.info(f"Received validation event: {data}")
                                
                                order_id = data.get('order_id')
                                status = data.get('status')
                                
                                if order_id and status:
                                    update_status(order_id, status)
                                    self.send_notification(order_id, status)
                            except Exception as e:
                                logger.error(f"Error processing message {msg.offset}: {e}")
                except Exception as e:
                    logger.error(f"Error in consumer poll loop: {e}")
                    time.sleep(1) # Prevent busy loop on repeated error
                            
        except Exception as e:
            logger.error(f"Critical Error in notification consumer: {e}")
        finally:
            if consumer:
                consumer.close()

    def send_notification(self, order_id, status):
        # Simulate sending email/webhook
        logger.info(f"SENDING NOTIFICATION: Order {order_id} is {status}")

    def stop(self):
        self.stop_event.set()
