import json
from kafka import KafkaProducer
from kafka.errors import KafkaError
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import os

logger = logging.getLogger(__name__)

class OrderProducer:
    def __init__(self):
        self.producer = None
        self.bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
        self._initialize_producer()

    def _initialize_producer(self):
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                retries=5
            )
            logger.info("Kafka Producer initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Kafka Producer: {e}")
            self.producer = None

    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((KafkaError, Exception)),
        reraise=True
    )
    def send_order(self, order_data):
        if not self.producer:
            logger.info("Attempting to re-initialize producer...")
            self._initialize_producer()
            if not self.producer:
                raise Exception("Kafka Producer is not available")

        try:
            future = self.producer.send('order_created', order_data)
            # Block for result to ensure delivery
            record_metadata = future.get(timeout=10)
            logger.info(f"Sent order to Kafka: {order_data} | Partition: {record_metadata.partition} | Offset: {record_metadata.offset}")
            return True
        except Exception as e:
            logger.error(f"Failed to send order to Kafka: {e}")
            raise e

