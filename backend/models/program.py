from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from core.db import Base




class Program(Base):
    id = Column(Integer, primary_key=True)
    name = Column(String(length=64))
    department_id = Column(Integer, ForeignKey("department.id"))
    department = relationship("Department")
    __tablename__ = "program"