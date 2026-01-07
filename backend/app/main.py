from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime

from .database import engine, get_db, Base
from .models import User, Market, Position, Transaction, MarketStatus, OutcomeType, TransactionType, MarketCategory
from .schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    MarketCreate, MarketResponse, MarketResolve,
    TradeRequest, TradeResponse,
    PositionResponse, TransactionResponse, PortfolioSummary
)
from .auth import (
    hash_password, authenticate_user, create_access_token, get_current_user
)


app = FastAPI(title="College Market API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    print("Database tables created!")



@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    
    # Check if username exists
    if db.query(User).filter(User.username == user_data.username.lower()).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check if email exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    new_user = User(
        username=user_data.username.lower(),
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        balance=1000000  
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@app.post("/auth/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login and receive JWT token."""
    
    user = authenticate_user(db, credentials.username, credentials.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token({"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@app.get("/auth/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    """Get current user info."""
    return user



@app.get("/markets", response_model=list[MarketResponse])
def get_markets(
    category: MarketCategory | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Market)
    if category:
        query = query.filter(Market.category == category)
    markets = query.all()
    return markets


@app.get("/markets/{market_id}", response_model=MarketResponse)
def get_market(market_id: int, db: Session = Depends(get_db)):
    """Get a specific market."""
    market = db.query(Market).filter(Market.id == market_id).first()
    
    if not market:
        raise HTTPException(status_code=404, detail="Market not found")
    
    return market


@app.post("/markets", response_model=MarketResponse, status_code=status.HTTP_201_CREATED)
def create_market(
    market_data: MarketCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    new_market = Market(
        college_name=market_data.college_name,
        description=market_data.description,
        yes_price=market_data.yes_price,
        no_price=market_data.no_price,
        status=MarketStatus.OPEN,
        category=MarketCategory(market_data.category),
    )
    db.add(new_market)
    db.commit()
    db.refresh(new_market)
    return new_market


@app.post("/markets/{market_id}/resolve", response_model=MarketResponse)
def resolve_market(
    market_id: int,
    resolution: MarketResolve,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Resolve a market and pay out winners."""
    
    market = db.query(Market).filter(Market.id == market_id).first()
    if not market:
        raise HTTPException(status_code=404, detail="Market not found")
    
    if market.status == MarketStatus.RESOLVED:
        raise HTTPException(status_code=400, detail="Market already resolved")
    
    # Resolve market
    market.status = MarketStatus.RESOLVED
    market.resolved_outcome = resolution.outcome
    market.resolution_date = datetime.utcnow()
    
    # Pay out winners
    positions = db.query(Position).filter(Position.market_id == market_id).all()
    
    for position in positions:
        if position.shares > 0 and position.outcome.value == resolution.outcome:
            # Winner! Each share pays 100 cents
            payout = position.shares * 100
            position.user.balance += payout
    
    db.commit()
    db.refresh(market)
    
    return market



@app.post("/trade", response_model=TradeResponse)
def execute_trade(
    trade: TradeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Execute a trade (buy shares at current market price)."""
    
    # Get market
    market = db.query(Market).filter(Market.id == trade.market_id).first()
    if not market:
        raise HTTPException(status_code=404, detail="Market not found")
    
    if market.status != MarketStatus.OPEN:
        raise HTTPException(status_code=400, detail="Market is not open for trading")
    
    # Get current price for the outcome
    current_price = market.yes_price if trade.outcome == "YES" else market.no_price
    
    # Calculate cost
    total_cost = trade.shares * current_price
    
    # Check user has enough balance
    if user.balance < total_cost:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. Need {total_cost} cents, have {user.balance} cents"
        )
    
    # Deduct from user balance
    user.balance -= total_cost
    
    # Find or create position
    position = db.query(Position).filter(
        and_(
            Position.user_id == user.id,
            Position.market_id == market.id,
            Position.outcome == OutcomeType(trade.outcome)
        )
    ).first()
    
    if position:
        # Update existing position (calculate new average cost)
        total_shares = position.shares + trade.shares
        total_cost_basis = (position.shares * position.average_cost) + (trade.shares * current_price)
        new_average_cost = total_cost_basis // total_shares  # Integer division
        
        position.shares = total_shares
        position.average_cost = new_average_cost
    else:
        # Create new position
        position = Position(
            user_id=user.id,
            market_id=market.id,
            outcome=OutcomeType(trade.outcome),
            shares=trade.shares,
            average_cost=current_price
        )
        db.add(position)
    
    # Create transaction record
    transaction = Transaction(
        user_id=user.id,
        market_id=market.id,
        transaction_type=TransactionType.BUY,
        outcome=OutcomeType(trade.outcome),
        shares=trade.shares,
        price_per_share=current_price,
        total_cost=total_cost
    )
    db.add(transaction)
    
    # Update market volume
    if trade.outcome == "YES":
        market.total_yes_shares += trade.shares
    else:
        market.total_no_shares += trade.shares
    
    # Simple price adjustment (can be refined later)
    # For every 100 shares bought, increase price by 1 cent (max 99)
    price_change = max(1, trade.shares // 100)
    
    if trade.outcome == "YES":
        market.yes_price = min(99, market.yes_price + price_change)
        market.no_price = 100 - market.yes_price
    else:
        market.no_price = min(99, market.no_price + price_change)
        market.yes_price = 100 - market.no_price
    
    db.commit()
    db.refresh(position)
    db.refresh(transaction)
    db.refresh(market)
    
    # Build position response with calculated fields
    position_response = build_position_response(position, market)
    
    return TradeResponse(
        success=True,
        message=f"Successfully bought {trade.shares} {trade.outcome} shares",
        transaction_id=transaction.id,
        shares=trade.shares,
        price_per_share=current_price,
        total_cost=total_cost,
        new_balance=user.balance,
        position=position_response
    )



@app.get("/portfolio", response_model=PortfolioSummary)
def get_portfolio(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's complete portfolio with P&L calculations."""
    
    positions = db.query(Position).filter(
        and_(Position.user_id == user.id, Position.shares > 0)
    ).all()
    
    position_responses = []
    total_invested = 0
    total_current_value = 0
    
    for position in positions:
        market = db.query(Market).filter(Market.id == position.market_id).first()
        position_response = build_position_response(position, market)
        position_responses.append(position_response)
        
        total_invested += position_response.cost_basis
        total_current_value += position_response.current_value
    
    total_pnl = total_current_value - total_invested
    total_pnl_percent = (total_pnl / total_invested * 100) if total_invested > 0 else 0
    
    return PortfolioSummary(
        balance=user.balance,
        total_invested=total_invested,
        total_current_value=total_current_value,
        total_unrealized_pnl=total_pnl,
        total_unrealized_pnl_percent=total_pnl_percent,
        positions=position_responses
    )


@app.get("/transactions", response_model=list[TransactionResponse])
def get_transactions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's transaction history."""
    
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user.id
    ).order_by(Transaction.timestamp.desc()).all()
    
    transaction_responses = []
    for transaction in transactions:
        market = db.query(Market).filter(Market.id == transaction.market_id).first()
        
        transaction_responses.append(TransactionResponse(
            id=transaction.id,
            market_id=transaction.market_id,
            transaction_type=transaction.transaction_type.value,
            outcome=transaction.outcome.value,
            shares=transaction.shares,
            price_per_share=transaction.price_per_share,
            total_cost=transaction.total_cost,
            timestamp=transaction.timestamp,
            market_college_name=market.college_name
        ))
    
    return transaction_responses



def build_position_response(position: Position, market: Market) -> PositionResponse:
    """Build a PositionResponse with calculated P&L fields."""
    
    # Get current market price for this outcome
    current_price = market.yes_price if position.outcome == OutcomeType.YES else market.no_price
    
    # Calculate values
    cost_basis = position.shares * position.average_cost
    current_value = position.shares * current_price
    unrealized_pnl = current_value - cost_basis
    unrealized_pnl_percent = (unrealized_pnl / cost_basis * 100) if cost_basis > 0 else 0
    
    return PositionResponse(
        id=position.id,
        market_id=position.market_id,
        outcome=position.outcome.value,
        shares=position.shares,
        average_cost=position.average_cost,
        current_value=current_value,
        cost_basis=cost_basis,
        unrealized_pnl=unrealized_pnl,
        unrealized_pnl_percent=unrealized_pnl_percent,
        market_college_name=market.college_name,
        market_yes_price=market.yes_price,
        market_no_price=market.no_price,
        market_status=market.status.value
    )