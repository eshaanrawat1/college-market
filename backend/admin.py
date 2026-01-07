import sys
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Market, User, Position, Transaction, MarketStatus, MarketCategory
from datetime import datetime


def get_db():
    """Get database session"""
    return SessionLocal()


def list_markets(db: Session):
    """List all markets"""
    markets = db.query(Market).all()
    
    if not markets:
        print("\n📭 No markets found.\n")
        return
    
    print("\n" + "="*80)
    print("📊 MARKETS")
    print("="*80)
    
    for market in markets:
        status_emoji = {"open": "🟢", "closed": "🔴", "resolved": "✅"}.get(market.status.value, "⚪")
        print(f"\n{status_emoji} ID: {market.id}")
        print(f"   College: {market.college_name}")
        print(f"   Description: {market.description or 'N/A'}")
        print(f"   Status: {market.status.value.upper()}")
        print(f"   Prices: YES {market.yes_price}¢ / NO {market.no_price}¢")
        print(f"   Volume: {market.total_yes_shares + market.total_no_shares} shares")
        if market.resolved_outcome:
            print(f"   Outcome: {market.resolved_outcome}")
    
    print("\n" + "="*80 + "\n")


def create_market(db: Session):
    """Create a new market"""
    print("\n📝 CREATE NEW MARKET")
    print("-" * 40)
    
    college_name = input("College name: ").strip()
    if not college_name:
        print("❌ College name is required!")
        return
    
    description = input("Description (optional): ").strip()
    
    category_input = input("Category (uc/ivy/csu/international/other) [other]: ").strip().lower() or "other"
    if category_input not in [c.value for c in MarketCategory]:
        print("❌ Invalid category, using 'other'")
        category_input = "other"
    category = MarketCategory(category_input)
    
    while True:
        try:
            yes_price = int(input("YES price (1-99): "))
            if not 1 <= yes_price <= 99:
                print("❌ Price must be between 1 and 99")
                continue
            break
        except ValueError:
            print("❌ Please enter a valid number")
    
    no_price = 100 - yes_price
    
    # Create market
    market = Market(
        college_name=college_name,
        description=description if description else None,
        yes_price=yes_price,
        no_price=no_price,
        status=MarketStatus.OPEN,
        category=category,
    )
    
    db.add(market)
    db.commit()
    db.refresh(market)
    
    print(f"\n✅ Market created successfully!")
    print(f"   ID: {market.id}")
    print(f"   {college_name}")
    print(f"   Category: {category.value.upper()}")
    print(f"   YES: {yes_price}¢ / NO: {no_price}¢\n")


def delete_market(db: Session):
    """Delete a market"""
    print("\n🗑️  DELETE MARKET")
    print("-" * 40)
    
    list_markets(db)
    
    try:
        market_id = int(input("Enter market ID to delete (0 to cancel): "))
        if market_id == 0:
            print("❌ Cancelled")
            return
    except ValueError:
        print("❌ Invalid ID")
        return
    
    market = db.query(Market).filter(Market.id == market_id).first()
    
    if not market:
        print(f"❌ Market with ID {market_id} not found!")
        return
    
    # Check if market has positions
    positions_count = db.query(Position).filter(Position.market_id == market_id).count()
    transactions_count = db.query(Transaction).filter(Transaction.market_id == market_id).count()
    
    print(f"\n⚠️  WARNING: This will delete:")
    print(f"   Market: {market.college_name}")
    print(f"   {positions_count} position(s)")
    print(f"   {transactions_count} transaction(s)")
    
    confirm = input("\nType 'DELETE' to confirm: ").strip()
    
    if confirm != "DELETE":
        print("❌ Deletion cancelled")
        return
    
    # Delete related records
    db.query(Position).filter(Position.market_id == market_id).delete()
    db.query(Transaction).filter(Transaction.market_id == market_id).delete()
    db.query(Market).filter(Market.id == market_id).delete()
    
    db.commit()
    
    print(f"✅ Market '{market.college_name}' deleted successfully!\n")


def resolve_market(db: Session):
    """Resolve a market"""
    print("\n⚖️  RESOLVE MARKET")
    print("-" * 40)
    
    # Show only open markets
    markets = db.query(Market).filter(Market.status == MarketStatus.OPEN).all()
    
    if not markets:
        print("\n📭 No open markets to resolve.\n")
        return
    
    print("\nOpen markets:")
    for market in markets:
        print(f"   {market.id}: {market.college_name}")
    
    try:
        market_id = int(input("\nEnter market ID to resolve (0 to cancel): "))
        if market_id == 0:
            print("❌ Cancelled")
            return
    except ValueError:
        print("❌ Invalid ID")
        return
    
    market = db.query(Market).filter(Market.id == market_id).first()
    
    if not market:
        print(f"❌ Market with ID {market_id} not found!")
        return
    
    if market.status != MarketStatus.OPEN:
        print(f"❌ Market is already {market.status.value}!")
        return
    
    print(f"\n📊 Resolving: {market.college_name}")
    print(f"   Current prices: YES {market.yes_price}¢ / NO {market.no_price}¢")
    
    outcome = input("\nOutcome (YES/NO): ").strip().upper()
    
    if outcome not in ["YES", "NO"]:
        print("❌ Invalid outcome. Must be YES or NO")
        return
    
    # Resolve market
    market.status = MarketStatus.RESOLVED
    market.resolved_outcome = outcome
    market.resolution_date = datetime.utcnow()
    
    # Pay out winners
    positions = db.query(Position).filter(Position.market_id == market_id).all()
    
    winners_count = 0
    total_payout = 0
    
    for position in positions:
        if position.shares > 0 and position.outcome.value == outcome:
            # Winner! Each share pays 100 cents
            payout = position.shares * 100
            position.user.balance += payout
            winners_count += 1
            total_payout += payout
    
    db.commit()
    
    print(f"\n✅ Market resolved successfully!")
    print(f"   Outcome: {outcome}")
    print(f"   Winners: {winners_count}")
    print(f"   Total payout: ${total_payout / 100:.2f}\n")


def list_users(db: Session):
    """List all users"""
    users = db.query(User).all()
    
    if not users:
        print("\n📭 No users found.\n")
        return
    
    print("\n" + "="*80)
    print("👥 USERS")
    print("="*80)
    
    for user in users:
        positions_count = db.query(Position).filter(Position.user_id == user.id).count()
        print(f"\n🧑 ID: {user.id}")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Balance: ${user.balance / 100:.2f}")
        print(f"   Positions: {positions_count}")
        print(f"   Created: {user.created_at.strftime('%Y-%m-%d %H:%M')}")
    
    print("\n" + "="*80 + "\n")


def main_menu():
    """Display main menu"""
    print("\n" + "="*80)
    print("🎓 COLLEGE MARKET ADMIN")
    print("="*80)
    print("\n1. List all markets")
    print("2. Create new market")
    print("3. Delete market")
    print("4. Resolve market")
    print("5. List all users")
    print("0. Exit")
    print("\n" + "-"*80)


def main():
    """Main function"""
    db = get_db()
    
    try:
        while True:
            main_menu()
            choice = input("\nChoose an option: ").strip()
            
            if choice == "1":
                list_markets(db)
            elif choice == "2":
                create_market(db)
            elif choice == "3":
                delete_market(db)
            elif choice == "4":
                resolve_market(db)
            elif choice == "5":
                list_users(db)
            elif choice == "0":
                print("\n👋 Goodbye!\n")
                break
            else:
                print("\n❌ Invalid option. Please try again.\n")
    
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!\n")
    finally:
        db.close()


if __name__ == "__main__":
    main()