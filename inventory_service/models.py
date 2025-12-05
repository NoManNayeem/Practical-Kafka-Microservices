from sqlalchemy import Column, Integer, String
from database import Base

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    item = Column(String, unique=True, index=True)
    quantity = Column(Integer)
