from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional, Literal

AllowedCategory = Literal["uc", "ivy", "csu", "international", "other"]

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=8)
    
    @field_validator('username')
    def username_alphanumeric(cls, v):
        if not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        return v.lower() 


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    balance: int 
    created_at: datetime
    
    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MarketBase(BaseModel):
    college_name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class MarketCreate(MarketBase):
    yes_price: int = Field(..., ge=1, le=99) 
    no_price: int = Field(..., ge=1, le=99)
    category: AllowedCategory = "other"

    @field_validator('no_price')
    def prices_sum_to_100(cls, v, info):
        yes_price = info.data.get('yes_price')
        if yes_price and yes_price + v != 100:
            raise ValueError('yes_price and no_price must sum to 100')
        return v


class MarketResponse(MarketBase):
    id: int
    yes_price: int
    no_price: int
    status: str
    total_yes_shares: int
    total_no_shares: int
    resolved_outcome: Optional[str] = None
    resolution_date: Optional[datetime] = None
    category: str
    created_at: datetime
    
    model_config = {"from_attributes": True}


class PositionResponse(BaseModel):
    id: int
    market_id: int
    outcome: str  
    shares: int
    average_cost: int  
    
    current_value: int  
    cost_basis: int  
    unrealized_pnl: int  
    unrealized_pnl_percent: float  
    
    market_college_name: str
    market_yes_price: int
    market_no_price: int
    market_status: str
    
    model_config = {"from_attributes": True}


class TransactionResponse(BaseModel):
    id: int
    market_id: int
    transaction_type: str  
    outcome: str  
    shares: int
    price_per_share: int
    total_cost: int
    timestamp: datetime
    
    market_college_name: str
    
    model_config = {"from_attributes": True}



class TradeRequest(BaseModel):
    market_id: int
    outcome: str  
    shares: int = Field(..., gt=0, le=10000)  
    
    @field_validator('outcome')
    def outcome_must_be_valid(cls, v):
        if v not in ['YES', 'NO']:
            raise ValueError('Outcome must be YES or NO')
        return v

class TradeResponse(BaseModel):
    success: bool
    message: str
    transaction_id: int
    
    shares: int
    price_per_share: int
    total_cost: int
    
    new_balance: int
    position: PositionResponse



class PortfolioSummary(BaseModel):
    balance: int
    total_invested: int  
    total_current_value: int  
    total_unrealized_pnl: int
    total_unrealized_pnl_percent: float
    positions: list[PositionResponse]



class MarketResolve(BaseModel):
    outcome: str  
    
    @field_validator('outcome')
    def outcome_must_be_valid(cls, v):
        if v not in ['YES', 'NO']:
            raise ValueError('Outcome must be YES or NO')
        return v