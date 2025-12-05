from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models import Inventory
from consumer import consume_orders
import asyncio
from contextlib import asynccontextmanager

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start consumer
    task = asyncio.create_task(consume_orders())
    yield
    # Stop consumer (if needed)

app = FastAPI(lifespan=lifespan)

@app.get("/inventory")
def read_inventory(db: Session = Depends(get_db)):
    return db.query(Inventory).all()
