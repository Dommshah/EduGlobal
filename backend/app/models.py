"""SQLAlchemy ORM models for Eduglobal."""
from datetime import date, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    email = Column(String(320), unique=True, nullable=False, index=True)
    phone = Column(String(40))
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="student", index=True)  # student | employee | admin
    avatar_color = Column(String(20), default="#6366f1")
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("Application", back_populates="student", foreign_keys="Application.student_id")
    assigned_applications = relationship(
        "Application", back_populates="counselor", foreign_keys="Application.counselor_id"
    )
    enquiries = relationship("Enquiry", back_populates="owner", foreign_keys="Enquiry.owner_id")
    chat_messages = relationship("ChatMessage", back_populates="user")


class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(120), unique=True, nullable=False, index=True)
    flag = Column(String(16), default="🌍")
    tagline = Column(String(255))
    description = Column(Text)
    universities_count = Column(Integer, default=0)
    students_count = Column(Integer, default=0)
    visa_success_rate = Column(Float, default=90.0)
    min_tuition = Column(Integer, default=5000)
    avg_living_cost = Column(Integer, default=800)
    intakes = Column(String(200), default="Sep, Jan")
    highlights = Column(JSON, default=list)
    hero_gradient = Column(String(120), default="from-indigo-600 via-blue-600 to-cyan-500")
    order_index = Column(Integer, default=0)


class University(Base):
    __tablename__ = "universities"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(280), unique=True, nullable=False, index=True)
    country_id = Column(Integer, ForeignKey("countries.id"))
    city = Column(String(120))
    world_rank = Column(Integer)
    founded = Column(Integer)
    type = Column(String(60), default="Public")
    description = Column(Text)
    tuition_min = Column(Integer)
    tuition_max = Column(Integer)
    acceptance_rate = Column(Float)
    programs_count = Column(Integer, default=0)
    image_gradient = Column(String(120), default="from-blue-700 to-indigo-900")
    featured = Column(Boolean, default=False)

    country = relationship("Country", backref="universities")
    courses = relationship("Course", back_populates="university", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="university")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True)
    university_id = Column(Integer, ForeignKey("universities.id"))
    name = Column(String(255), nullable=False)
    level = Column(String(60), default="Masters")  # Bachelors | Masters | PhD | Diploma
    duration = Column(String(60), default="2 Years")
    tuition = Column(Integer)
    currency = Column(String(8), default="USD")
    intake = Column(String(120), default="Sep 2027")
    ielts = Column(String(20), default="6.5")
    description = Column(Text)

    university = relationship("University", back_populates="courses")
    applications = relationship("Application", back_populates="course")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"), index=True)
    university_id = Column(Integer, ForeignKey("universities.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    counselor_id = Column(Integer, ForeignKey("users.id"), index=True)
    status = Column(String(40), default="draft", index=True)
    # draft | submitted | documents | reviewing | offer | visa | enrolled | rejected
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("User", back_populates="applications", foreign_keys=[student_id])
    counselor = relationship("User", back_populates="assigned_applications", foreign_keys=[counselor_id])
    university = relationship("University", back_populates="applications")
    course = relationship("Course", back_populates="applications")
    documents = relationship("Document", back_populates="application", cascade="all, delete-orphan")
    timeline = relationship("ApplicationEvent", back_populates="application", cascade="all, delete-orphan")


class ApplicationEvent(Base):
    __tablename__ = "application_events"

    id = Column(Integer, primary_key=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    label = Column(String(200), nullable=False)
    detail = Column(String(400))
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="timeline")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    application_id = Column(Integer, ForeignKey("applications.id"), index=True)
    kind = Column(String(80), nullable=False)
    status = Column(String(30), default="pending")  # pending | received | verified
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="documents")


class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    email = Column(String(320), nullable=False)
    phone = Column(String(40))
    country_interest = Column(String(120))
    level = Column(String(60))
    intake = Column(String(60))
    message = Column(Text)
    source = Column(String(60), default="website")
    status = Column(String(40), default="new", index=True)  # new | contacted | qualified | converted | closed
    owner_id = Column(Integer, ForeignKey("users.id"), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="enquiries", foreign_keys=[owner_id])


class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    program = Column(String(255))
    university = Column(String(255))
    country = Column(String(100))
    content = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    avatar_gradient = Column(String(120), default="from-indigo-500 to-purple-600")
    avatar_image = Column(String(255))
    featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True)
    title = Column(String(300), nullable=False)
    slug = Column(String(320), unique=True, nullable=False, index=True)
    excerpt = Column(Text)
    content = Column(Text)
    category = Column(String(80), default="Guides")
    author = Column(String(200), default="Eduglobal Team")
    read_minutes = Column(Integer, default=5)
    gradient = Column(String(120), default="from-blue-600 to-indigo-700")
    published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    session_id = Column(String(80), index=True)
    role = Column(String(20), nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    email = Column(String(320), nullable=False)
    subject = Column(String(300))
    message = Column(Text, nullable=False)
    handled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    subject = Column(String(300), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(30), default="open", index=True)  # open | pending | resolved
    priority = Column(String(20), default="normal")
    response = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class Stat(Base):
    __tablename__ = "stats"

    id = Column(Integer, primary_key=True)
    label = Column(String(120), nullable=False)
    value = Column(String(40), nullable=False)
    suffix = Column(String(20))
    order_index = Column(Integer, default=0)


class Quote(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True)
    text = Column(Text, nullable=False)
    author = Column(String(120), nullable=False)
    order_index = Column(Integer, default=0)
