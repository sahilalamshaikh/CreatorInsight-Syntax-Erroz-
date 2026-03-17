"""
CreatorInsight — demo seed script
Run: python scripts/seed.py

Creates a fully loaded demo account:
  Email:    alex@demo.com
  Password: demo1234

Loads:
  - 1 demo user (Alex Kim, lifestyle niche)
  - 5 connected social accounts (seeded, no real OAuth)
  - 30 days of analytics per platform
  - 12 realistic posts with metrics
  - 8 alerts (spikes, drops, milestones)
  - 3 active goals / milestones
  - 7 brand deals across pipeline stages
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.core.config import settings
from app.db.session import Base
from app.models.models import (
    User, SocialAccount, Post, PostMetric,
    Analytics, Alert, Milestone, BrandDeal
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
engine = create_engine(settings.DATABASE_URL_SYNC, connect_args={"check_same_thread": False})

# ── Helpers ───────────────────────────────────────────────────────────────

def uid():
    return str(uuid.uuid4())

def days_ago(n, hour=12, minute=0):
    return datetime.now(timezone.utc) - timedelta(days=n, hours=random.randint(0, 6))

def rand(lo, hi):
    return round(random.uniform(lo, hi), 2)

# ── Platform configs ──────────────────────────────────────────────────────

PLATFORMS = {
    "instagram": {"followers": 31400, "growth": 1.8,  "eng": 6.8, "username": "alexkim.creates"},
    "youtube":   {"followers": 22100, "growth": 1.4,  "eng": 5.9, "username": "AlexKimCreates"},
    "tiktok":    {"followers": 18700, "growth": 2.2,  "eng": 5.4, "username": "@alexkim"},
    "twitter":   {"followers": 8300,  "growth": 0.9,  "eng": 2.1, "username": "@alexkimcreates"},
    "linkedin":  {"followers": 3700,  "growth": 0.6,  "eng": 3.1, "username": "alex-kim-creator"},
}

# ── Sample posts ──────────────────────────────────────────────────────────

POSTS = [
    {
        "caption": "Morning routine that changed my life 🌅 Starting the day with intention, movement, and calm. What's your non-negotiable morning habit? Drop it below!",
        "hashtags": ["#MorningRoutine", "#DailyHabits", "#Wellness", "#Mindfulness"],
        "platforms": ["instagram", "tiktok"],
        "status": "published",
        "ai_score": 78.0,
        "days_ago": 3,
        "metrics": {"likes": 2840, "comments": 312, "shares": 187, "saves": 634, "views": 41200, "reach": 38400, "impressions": 52100, "engagement_rate": 6.8},
    },
    {
        "caption": "5 productivity habits under 60 seconds each — which one are you adding to your week? Subscribe for weekly growth tips every Tuesday!",
        "hashtags": ["#Productivity", "#HabitStack", "#CreatorLife", "#ContentCreator2025"],
        "platforms": ["youtube", "instagram"],
        "status": "published",
        "ai_score": 85.0,
        "days_ago": 5,
        "metrics": {"likes": 1920, "comments": 241, "shares": 94, "saves": 420, "views": 32500, "reach": 29800, "impressions": 41200, "engagement_rate": 5.9},
    },
    {
        "caption": "POV: You finally fixed your sleep schedule and everything changed 🌙 Sleep is the original biohack. What's your bedtime ritual?",
        "hashtags": ["#SleepTok", "#WellnessTok", "#MindfulLiving", "#HealthyHabits"],
        "platforms": ["tiktok", "instagram"],
        "status": "published",
        "ai_score": 91.0,
        "days_ago": 6,
        "metrics": {"likes": 5410, "comments": 628, "shares": 893, "saves": 1240, "views": 102000, "reach": 94200, "impressions": 118000, "engagement_rate": 7.4},
    },
    {
        "caption": "10 lessons from my first year as a full-time creator. Lesson 1: consistency beats virality every single time. Save this for when you feel like giving up.",
        "hashtags": ["#CreatorEconomy", "#ContentStrategy", "#GrowthMindset", "#SmallCreator"],
        "platforms": ["linkedin", "instagram"],
        "status": "published",
        "ai_score": 62.0,
        "days_ago": 7,
        "metrics": {"likes": 892, "comments": 143, "shares": 67, "saves": 312, "views": 14200, "reach": 12800, "impressions": 18400, "engagement_rate": 4.2},
    },
    {
        "caption": "Why I quit my 9-5 — the honest truth nobody tells you. This is not a highlight reel. Drop your biggest fear about making the leap 👇",
        "hashtags": ["#CreatorLife", "#QuitYourJob", "#Entrepreneurship", "#HonestCreator"],
        "platforms": ["instagram", "youtube", "tiktok"],
        "status": "published",
        "ai_score": 88.0,
        "days_ago": 10,
        "metrics": {"likes": 4120, "comments": 891, "shares": 634, "saves": 1820, "views": 78400, "reach": 71200, "impressions": 94800, "engagement_rate": 7.2},
    },
    {
        "caption": "The habit that doubled my energy in 7 days (no, it's not coffee) ☀️ Tag someone who needs to hear this!",
        "hashtags": ["#EnergyHacks", "#MorningRoutine", "#WellnessTips", "#Biohacking"],
        "platforms": ["instagram", "tiktok"],
        "status": "published",
        "ai_score": 82.0,
        "days_ago": 12,
        "metrics": {"likes": 3280, "comments": 412, "shares": 298, "saves": 847, "views": 61800, "reach": 54200, "impressions": 72400, "engagement_rate": 6.4},
    },
    {
        "caption": "Day in my life as a full-time creator working from Bali 🌴 Honest look at what remote creative work actually looks like (spoiler: it's not all sunsets)",
        "hashtags": ["#CreatorLife", "#WorkFromAnywhere", "#DigitalNomad", "#ContentCreator"],
        "platforms": ["youtube", "instagram"],
        "status": "published",
        "ai_score": 74.0,
        "days_ago": 14,
        "metrics": {"likes": 2140, "comments": 328, "shares": 142, "saves": 512, "views": 38700, "reach": 34100, "impressions": 48200, "engagement_rate": 5.6},
    },
    {
        "caption": "This ONE change to my morning routine added 2 productive hours to my day. Would you try it? Let me know in the comments 👇",
        "hashtags": ["#ProductivityTips", "#MorningPerson", "#DeepWork", "#TimeManagement"],
        "platforms": ["instagram", "linkedin"],
        "status": "published",
        "ai_score": 79.0,
        "days_ago": 17,
        "metrics": {"likes": 1840, "comments": 267, "shares": 89, "saves": 421, "views": 28400, "reach": 26200, "impressions": 34800, "engagement_rate": 5.2},
    },
    {
        "caption": "Batch cooking for the week in 90 minutes 🥗 Healthy eating on a busy schedule is possible — here's my exact system",
        "hashtags": ["#MealPrep", "#HealthyLiving", "#WholeFoods", "#NutritionTips"],
        "platforms": ["instagram", "tiktok", "youtube"],
        "status": "published",
        "ai_score": 71.0,
        "days_ago": 20,
        "metrics": {"likes": 1620, "comments": 198, "shares": 134, "saves": 892, "views": 31200, "reach": 27400, "impressions": 38100, "engagement_rate": 5.0},
    },
    {
        "caption": "GRWM while I talk about the biggest mistakes I made growing to 80K followers — so you don't have to make them 💭",
        "hashtags": ["#GRWM", "#CreatorAdvice", "#GrowthHacks", "#SocialMediaTips"],
        "platforms": ["tiktok", "instagram"],
        "status": "published",
        "ai_score": 86.0,
        "days_ago": 22,
        "metrics": {"likes": 3740, "comments": 521, "shares": 412, "saves": 1120, "views": 68900, "reach": 62400, "impressions": 81200, "engagement_rate": 6.9},
    },
    {
        "caption": "Testing 5 AI tools for content creators so you don't have to 🤖 Rating each one honestly after 2 weeks of use",
        "hashtags": ["#AITools", "#ContentCreation", "#CreatorTech", "#ProductivityApps"],
        "platforms": ["youtube", "instagram", "linkedin"],
        "status": "draft",
        "ai_score": 80.0,
        "days_ago": 1,
        "metrics": None,
    },
    {
        "caption": "Your morning routine is the foundation of your entire day. Here's the exact 5-step sequence I've used for 2 years ⏰",
        "hashtags": ["#MorningRoutine", "#DailyRitual", "#MindfulMorning", "#WakeUpEarly"],
        "platforms": ["instagram", "tiktok"],
        "status": "draft",
        "ai_score": None,
        "days_ago": 0,
        "metrics": None,
    },
]

# ── Alerts ────────────────────────────────────────────────────────────────

ALERT_DATA = [
    {
        "type": "viral_post",
        "severity": "success",
        "platform": "tiktok",
        "title": "Post going viral on TikTok",
        "body": "Your 'POV: You fixed your sleep schedule' video hit 102K views in 24 hours — 4× your average. It's trending in #WellnessTok. Post a follow-up while momentum is high.",
        "days_ago": 6,
        "is_read": False,
    },
    {
        "type": "milestone_hit",
        "severity": "success",
        "platform": None,
        "title": "Milestone unlocked — Rising Star!",
        "body": "You've crossed 80K total followers across all platforms. Badge earned: Rising Star. You're 84% of the way to 100K — at your current growth rate you'll hit it in ~3 weeks.",
        "days_ago": 2,
        "is_read": False,
    },
    {
        "type": "engagement_spike",
        "severity": "success",
        "platform": "instagram",
        "title": "Engagement spike on Instagram",
        "body": "'Morning routine' Reel hit 6.8% engagement — 45% above your 7-day average. Best performing post this week. Consider boosting it or creating a series.",
        "days_ago": 3,
        "is_read": False,
    },
    {
        "type": "trending_topic",
        "severity": "info",
        "platform": None,
        "title": "Trending topic in your niche",
        "body": "'#MorningRitual' is rising fast — 186K posts and growing 34% this week. Only 12% of your competitors have posted about it. High opportunity window in the next 48 hours.",
        "days_ago": 1,
        "is_read": False,
    },
    {
        "type": "trending_topic",
        "severity": "info",
        "platform": None,
        "title": "New niche hashtag opportunity",
        "body": "'#HabitStack' has under 100K posts but 22% week-on-week growth. Low competition, high relevance to your lifestyle content. Great time to establish authority.",
        "days_ago": 1,
        "is_read": False,
    },
    {
        "type": "engagement_drop",
        "severity": "warning",
        "platform": "linkedin",
        "title": "Engagement dropped on LinkedIn",
        "body": "Your last 3 LinkedIn posts averaged 1.8% engagement — down 42% from your 3.1% baseline. Try native documents or polls — LinkedIn algorithm heavily favours them.",
        "days_ago": 4,
        "is_read": True,
    },
    {
        "type": "milestone_hit",
        "severity": "success",
        "platform": "youtube",
        "title": "YouTube subscriber milestone — 22K!",
        "body": "You crossed 22,000 YouTube subscribers. Badge: Community Builder unlocked. Your channel grew 1.4% this week — faster than 78% of channels in your niche.",
        "days_ago": 8,
        "is_read": True,
    },
    {
        "type": "engagement_spike",
        "severity": "success",
        "platform": "youtube",
        "title": "YouTube Shorts performing well",
        "body": "'5 productivity habits' Short reached 8.1K views with 38% average view duration — above the 30% platform average. Strong signal to create a series.",
        "days_ago": 10,
        "is_read": True,
    },
]

# ── Brand deals ───────────────────────────────────────────────────────────

BRAND_DEALS = [
    {"brand_name": "Calm",           "deal_type": "Sponsored Reel",     "platform": "instagram", "stage": "prospect",       "value": 700.0,  "ai_fit_score": 92.0},
    {"brand_name": "Ritual",         "deal_type": "IG + TikTok Bundle", "platform": "instagram", "stage": "prospect",       "value": 1200.0, "ai_fit_score": 87.0},
    {"brand_name": "Notion",         "deal_type": "YouTube Integration","platform": "youtube",   "stage": "prospect",       "value": 900.0,  "ai_fit_score": 74.0},
    {"brand_name": "Headspace",      "deal_type": "Brand Ambassador",   "platform": None,        "stage": "in_talks",       "value": 2500.0, "ai_fit_score": 95.0},
    {"brand_name": "Lululemon",      "deal_type": "Instagram Reel",     "platform": "instagram", "stage": "in_talks",       "value": 700.0,  "ai_fit_score": 81.0},
    {"brand_name": "Athletic Greens","deal_type": "TikTok + IG Bundle", "platform": "tiktok",   "stage": "contract_sent",  "value": 1400.0, "ai_fit_score": 89.0},
    {"brand_name": "Whoop",          "deal_type": "YouTube Review",     "platform": "youtube",   "stage": "live",           "value": 850.0,  "ai_fit_score": 90.0},
    {"brand_name": "Oura Ring",      "deal_type": "Instagram Reel",     "platform": "instagram", "stage": "completed",      "value": 600.0,  "ai_fit_score": 88.0},
    {"brand_name": "Momentous",      "deal_type": "TikTok Video",       "platform": "tiktok",   "stage": "completed",      "value": 450.0,  "ai_fit_score": 82.0},
]

# ── Milestones ────────────────────────────────────────────────────────────

MILESTONE_DATA = [
    {"platform": None,        "goal_type": "followers",   "target_value": 100000, "current_value": 84200, "badge_name": "Six-Figure Creator", "is_achieved": False},
    {"platform": "instagram", "goal_type": "engagement",  "target_value": 7,      "current_value": 6,     "badge_name": "Engagement Pro",     "is_achieved": False},
    {"platform": None,        "goal_type": "impressions", "target_value": 500000, "current_value": 312000,"badge_name": "Reach Master",       "is_achieved": False},
    {"platform": "instagram", "goal_type": "followers",   "target_value": 30000,  "current_value": 31400, "badge_name": "Instagram 30K",     "is_achieved": True},
    {"platform": None,        "goal_type": "followers",   "target_value": 50000,  "current_value": 84200, "badge_name": "Community Builder", "is_achieved": True},
]


# ── Main seeder ───────────────────────────────────────────────────────────

def seed():
    with Session(engine) as db:

        # Clean existing demo user
        existing = db.query(User).filter(User.email == "alex@demo.com").first()
        if existing:
            db.delete(existing)
            db.commit()
            print("Removed existing demo user")

        print("Creating demo user: alex@demo.com / demo1234")
        user = User(
            id=uid(),
            email="alex@demo.com",
            username="alexkimcreates",
            full_name="Alex Kim",
            hashed_password=pwd_context.hash("demo1234"),
            niche="lifestyle",
            bio="Lifestyle & wellness creator. Morning routines, mindful habits, honest creator advice.",
            is_active=True,
            is_verified=True,
            onboarded=True,
        )
        db.add(user)
        db.flush()

        # ── Social accounts ──────────────────────────────────────────────
        print("Adding social accounts...")
        for platform, cfg in PLATFORMS.items():
            acct = SocialAccount(
                id=uid(),
                user_id=user.id,
                platform=platform,
                platform_user_id=f"{platform}_{user.id[:8]}",
                platform_username=cfg["username"],
                access_token="seeded_demo_token",
                follower_count=cfg["followers"],
                is_active=True,
            )
            db.add(acct)

        # ── 30-day analytics ─────────────────────────────────────────────
        print("Generating 30 days of analytics...")
        for platform, cfg in PLATFORMS.items():
            base_followers = cfg["followers"]
            base_eng       = cfg["eng"]
            for day in range(30, 0, -1):
                growth_factor = 1 - (day * cfg["growth"] / 100 / 30)
                followers     = int(base_followers * growth_factor)
                delta         = int(base_followers * cfg["growth"] / 100 / 30)
                eng           = round(base_eng + random.uniform(-0.8, 0.8), 2)
                reach         = int(followers * random.uniform(0.4, 0.7))
                impressions   = int(reach * random.uniform(1.2, 1.8))

                row = Analytics(
                    id=uid(),
                    user_id=user.id,
                    platform=platform,
                    date=days_ago(day, hour=0),
                    follower_count=followers,
                    follower_delta=delta,
                    total_reach=reach,
                    total_impressions=impressions,
                    avg_engagement_rate=max(0.5, eng),
                    posts_count=random.randint(0, 2),
                    audience_data={
                        "age_groups": {"18-24": 28, "25-34": 42, "35-44": 18, "45+": 12},
                        "top_locations": ["United States", "United Kingdom", "Canada", "Australia"],
                        "gender": {"female": 62, "male": 34, "other": 4},
                    },
                    best_post_time={
                        "monday": {"18": 4.2, "19": 5.1, "20": 4.8},
                        "tuesday": {"18": 5.4, "19": 6.8, "20": 6.2},
                        "wednesday": {"12": 4.1, "18": 4.9, "19": 5.3},
                        "thursday": {"18": 5.8, "19": 7.1, "20": 6.4},
                        "friday": {"17": 4.3, "18": 5.2, "19": 4.8},
                        "saturday": {"10": 3.9, "11": 4.2, "12": 3.8},
                        "sunday": {"11": 3.7, "12": 4.0, "19": 4.4},
                    },
                )
                db.add(row)

        # ── Posts ────────────────────────────────────────────────────────
        print("Creating posts...")
        for pd in POSTS:
            post_id = uid()
            published_at = days_ago(pd["days_ago"]) if pd["status"] == "published" else None
            post = Post(
                id=post_id,
                user_id=user.id,
                caption=pd["caption"],
                hashtags=pd["hashtags"],
                platforms=pd["platforms"],
                status=pd["status"],
                published_at=published_at,
                scheduled_at=None,
                ai_score=pd.get("ai_score"),
                ai_feedback={"grade": "Good", "suggestions": []} if pd.get("ai_score") else None,
                platform_post_ids={p: f"{p}_post_{post_id[:8]}" for p in pd["platforms"]} if pd["status"] == "published" else {},
            )
            db.add(post)
            db.flush()

            # Add metrics for published posts
            if pd["status"] == "published" and pd.get("metrics"):
                m = pd["metrics"]
                for plat in pd["platforms"]:
                    metric = PostMetric(
                        id=uid(),
                        post_id=post_id,
                        platform=plat,
                        likes=int(m["likes"] * random.uniform(0.7, 1.3)),
                        comments=int(m["comments"] * random.uniform(0.7, 1.3)),
                        shares=int(m["shares"] * random.uniform(0.7, 1.3)),
                        saves=int(m["saves"] * random.uniform(0.7, 1.3)),
                        views=int(m["views"] * random.uniform(0.8, 1.2)),
                        reach=int(m["reach"] * random.uniform(0.8, 1.2)),
                        impressions=int(m["impressions"] * random.uniform(0.8, 1.2)),
                        engagement_rate=round(m["engagement_rate"] + random.uniform(-0.5, 0.5), 2),
                    )
                    db.add(metric)

        # ── Alerts ───────────────────────────────────────────────────────
        print("Adding alerts...")
        for ad in ALERT_DATA:
            alert = Alert(
                id=uid(),
                user_id=user.id,
                type=ad["type"],
                severity=ad["severity"],
                platform=ad["platform"],
                title=ad["title"],
                body=ad["body"],
                alert_metadata={},
                is_read=ad["is_read"],
                read_at=days_ago(ad["days_ago"] - 1) if ad["is_read"] else None,
            )
            db.add(alert)

        # ── Milestones ───────────────────────────────────────────────────
        print("Adding milestones...")
        for md in MILESTONE_DATA:
            m = Milestone(
                id=uid(),
                user_id=user.id,
                platform=md["platform"],
                goal_type=md["goal_type"],
                target_value=md["target_value"],
                current_value=md["current_value"],
                is_achieved=md["is_achieved"],
                achieved_at=days_ago(14) if md["is_achieved"] else None,
                badge_name=md["badge_name"],
            )
            db.add(m)

        # ── Brand deals ──────────────────────────────────────────────────
        print("Adding brand deals...")
        for bd in BRAND_DEALS:
            deal = BrandDeal(
                id=uid(),
                user_id=user.id,
                brand_name=bd["brand_name"],
                deal_type=bd["deal_type"],
                platform=bd["platform"],
                stage=bd["stage"],
                value=bd["value"],
                ai_fit_score=bd["ai_fit_score"],
            )
            db.add(deal)

        db.commit()

    print("")
    print("Seed complete!")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  Demo account:")
    print("  Email:    alex@demo.com")
    print("  Password: demo1234")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  Loaded:")
    print(f"  • {len(PLATFORMS)} social accounts")
    print(f"  • {len(PLATFORMS) * 30} analytics rows (30 days × 5 platforms)")
    print(f"  • {len(POSTS)} posts")
    print(f"  • {len(ALERT_DATA)} alerts")
    print(f"  • {len(MILESTONE_DATA)} milestones")
    print(f"  • {len(BRAND_DEALS)} brand deals")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")


if __name__ == "__main__":
    seed()
