from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base


class MarketStatus(str, enum.Enum):
    OPEN = "open"
    CLOSED = "closed"    
    RESOLVED = "resolved"  

class OutcomeType(str, enum.Enum):
    YES = "YES"
    NO = "NO"

class TransactionType(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    balance = Column(Integer, default=1000000)  
    created_at = Column(DateTime, default=datetime.utcnow)
    
    positions = relationship("Position", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")


class Market(Base):
    __tablename__ = "markets"
    
    id = Column(Integer, primary_key=True, index=True)
    college_name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(Enum(MarketStatus), default=MarketStatus.OPEN)
    
    yes_price = Column(Integer, nullable=False)
    no_price = Column(Integer, nullable=False)
    
    total_yes_shares = Column(Integer, default=0)
    total_no_shares = Column(Integer, default=0)
    
    resolved_outcome = Column(String, nullable=True)  
    resolution_date = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    positions = relationship("Position", back_populates="market", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="market", cascade="all, delete-orphan")


class Position(Base):
    __tablename__ = "positions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=False)
    outcome = Column(Enum(OutcomeType), nullable=False)
    
    shares = Column(Integer, default=0)  
    average_cost = Column(Integer, nullable=False)      
    
    
    user = relationship("User", back_populates="positions")
    market = relationship("Market", back_populates="positions")


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=False)
    
    transaction_type = Column(Enum(TransactionType), nullable=False)
    outcome = Column(Enum(OutcomeType), nullable=False)
    shares = Column(Integer, nullable=False)
    price_per_share = Column(Integer, nullable=False)  
    total_cost = Column(Integer, nullable=False)  

    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="transactions")
    market = relationship("Market", back_populates="transactions")