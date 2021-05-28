from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, ARRAY
from sqlalchemy.orm import relationship

from core.db import Base
from .association_tables import user_class_session_association_table


class ClassSession(Base):
    id = Column(Integer, primary_key=True)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    is_active = Column(Boolean)
    instructor = relationship(
        "User", secondary=user_class_session_association_table, backref="class_session"
    )
    course_id = Column(Integer, ForeignKey("course.id", ondelete="cascade"))
    course = relationship("Course", backref="session")
    group_id = Column(Integer, ForeignKey("group.id", ondelete="cascade"))
    group = relationship("Group", backref="class_session", uselist=False)
    file = Column(
        ARRAY(String(100))
    )  # unique = True removed, because multiple class session can have file with same name
    description = Column(String)
    __tablename__ = "class_session"
