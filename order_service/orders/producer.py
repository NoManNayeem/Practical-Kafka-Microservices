import json
from kafka import KafkaProducer
import logging

logger = logging.getLogger(__name__)

import os

class OrderProducer:
    def __init__(self):
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092'),
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )
        except Exception as e:
            logger.error(f"Failed to connect to Kafka: {e}")
            self.producer = None

    def send_order(self, order_data):
        if self.producer:
            try:
                self.producer.send('order_created', order_data)
                self.producer.flush()
                logger.info(f"Sent order to Kafka: {order_data}")
            except Exception as e:
                logger.error(f"Failed to send order to Kafka: {e}")
        else:
            logger.warning("Kafka producer is not initialized, skipping message send")
