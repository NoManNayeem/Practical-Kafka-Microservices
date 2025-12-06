import redis
import os
import logging

logger = logging.getLogger(__name__)

# Redis connection
try:
    redis_client = redis.Redis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        db=0,
        decode_responses=True
    )
    redis_client.ping()
    logger.info("Connected to Redis")
except Exception as e:
    logger.error(f"Failed to connect to Redis: {e}")
    redis_client = None

def update_status(order_id, status):
    if redis_client:
        try:
            redis_client.set(f"order:{order_id}", status)
        except Exception as e:
            logger.error(f"Error putting to Redis: {e}")
    else:
        logger.warning("Redis not available, cannot update status")

def get_status(order_id):
    if redis_client:
        try:
            status = redis_client.get(f"order:{order_id}")
            return status if status else 'UNKNOWN'
        except Exception as e:
            logger.error(f"Error getting from Redis: {e}")
            return 'ERROR'
    else:
        logger.warning("Redis not available")
        return 'SERVICE_UNAVAILABLE'
