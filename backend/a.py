from app.db.session import SessionLocal
from app.models.models import User

db = SessionLocal()
user = db.query(User).filter(User.email=="alex@demo.com").first()
print(user)