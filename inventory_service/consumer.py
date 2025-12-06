import json
import asyncio
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from database import SessionLocal
from models import Inventory
import logging

import os

logger = logging.getLogger(__name__)

async def consume_orders():
    # Remove value_deserializer from init to handle errors manually
    consumer = AIOKafkaConsumer(
        'order_created',
        bootstrap_servers=os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092'),
        group_id='inventory_group'
    )
    
    producer = AIOKafkaProducer(
        bootstrap_servers=os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092'),
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )

    try:
        await consumer.start()
        await producer.start()
        logger.info("Inventory Consumer started")
        
        async for msg in consumer:
            try:
                order_data = json.loads(msg.value.decode('utf-8'))
                logger.info(f"Received order: {order_data}")
                
                # Process order
                await process_order(order_data, producer)
            except json.JSONDecodeError:
                logger.error(f"Failed to decode message: {msg.value}")
            except Exception as e:
                logger.error(f"Error processing message: {e}")
            
    except Exception as e:
        logger.error(f"Critical Error in consumer: {e}")
    finally:
        await consumer.stop()
        await producer.stop()

async def process_order(order_data, producer):
    db = SessionLocal()
    try:
        item_name = order_data.get('item')
        quantity = order_data.get('quantity')
        order_id = order_data.get('id')
        
        if not item_name or not quantity or not order_id:
            logger.error(f"Invalid order data: {order_data}")
            return

        # Simple logic: check if item exists and has enough quantity
        # For demo, let's assume we have infinite stock if item starts with 'A'
        # or we can seed DB.
        # Let's just validate: if quantity > 0 -> VALIDATED, else REJECTED
        
        status = 'VALIDATED' if quantity > 0 else 'REJECTED'
        
        validation_event = {
            'order_id': order_id,
            'status': status
        }
        
        await producer.send_and_wait('order_validated', validation_event)
        logger.info(f"Sent validation event: {validation_event}")
        
    except Exception as e:
        logger.error(f"Error processing order logic: {e}")
    finally:
        db.close()
