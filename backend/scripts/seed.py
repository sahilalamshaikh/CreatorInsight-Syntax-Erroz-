"""
SUPER REALISTIC CreatorInsight Seeder

Creates large realistic demo dataset.

Run:
python scripts/seed_super_realistic.py
"""

import sys
import os
import uuid
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from passlib.context import CryptContext

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.db.session import Base
from app.models.models import (
    User,
    SocialAccount,
    Post,
    PostMetric,
    Analytics,
    Alert,
    Milestone,
    BrandDeal,
)

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

engine = create_engine(settings.DATABASE_URL_SYNC)

# ----------------------------------------------------------
# CONFIG
# ----------------------------------------------------------

PLATFORMS = {
    "instagram": {"followers": 34000, "eng": 6.8},
    "youtube": {"followers": 21000, "eng": 5.4},
    "tiktok": {"followers": 29000, "eng": 7.2},
    "twitter": {"followers": 9800, "eng": 2.4},
    "linkedin": {"followers": 6200, "eng": 3.0},
}

POST_CAPTIONS = [
    "Morning routine that changed my life 🌅",
    "5 productivity habits under 60 seconds",
    "Why I quit my 9-5 job",
    "Creator life behind the scenes",
    "Top AI tools creators should try",
    "How I plan my content calendar",
    "What nobody tells you about being a creator",
    "The habit that doubled my productivity",
    "Testing viral TikTok strategies",
    "My weekly reset routine",
]

HASHTAGS = [
    "#CreatorLife",
    "#ContentStrategy",
    "#GrowthHacks",
    "#MorningRoutine",
    "#ProductivityTips",
    "#CreatorEconomy",
    "#AItools",
    "#DigitalCreator",
    "#ContentMarketing",
]

BRANDS = [
    "Notion",
    "Calm",
    "Headspace",
    "Skillshare",
    "Lululemon",
    "Whoop",
    "Oura Ring",
    "Momentous",
    "Athletic Greens",
    "Squarespace",
]

DEAL_STAGES = [
    "prospect",
    "in_talks",
    "contract_sent",
    "live",
    "completed",
]

# ----------------------------------------------------------
# HELPERS
# ----------------------------------------------------------

def uid():
    return str(uuid.uuid4())


def now():
    return datetime.now(timezone.utc)


def random_time(days):
    return now() - timedelta(days=days, hours=random.randint(0, 23))


def rand(a, b):
    return random.uniform(a, b)


# ----------------------------------------------------------
# USER
# ----------------------------------------------------------

def create_user(db):

    user = db.query(User).filter(User.email == "demo@creatorinsight.app").first()

    if user:
        db.delete(user)
        db.commit()

    user = User(
        id=uid(),
        email="demo@creatorinsight.app",
        username="creator_demo",
        full_name="CreatorInsight Demo",
        hashed_password=pwd.hash("Demo1234!"),
        niche="creator economy",
        bio="Demo account for CreatorInsight platform.",
        is_active=True,
        onboarded=True,
        is_verified=True,
    )

    db.add(user)
    db.flush()

    return user


# ----------------------------------------------------------
# SOCIAL ACCOUNTS
# ----------------------------------------------------------

def create_social_accounts(db, user):

    for platform, cfg in PLATFORMS.items():

        db.add(
            SocialAccount(
                id=uid(),
                user_id=user.id,
                platform=platform,
                platform_user_id=f"{platform}_{random.randint(10000,99999)}",
                platform_username=f"demo_{platform}",
                access_token="seed_token",
                follower_count=cfg["followers"],
                is_active=True,
            )
        )


# ----------------------------------------------------------
# ANALYTICS (90 DAYS)
# ----------------------------------------------------------

def create_analytics(db, user):

    for platform, cfg in PLATFORMS.items():

        followers = cfg["followers"]

        for day in range(90, 0, -1):

            growth = random.randint(-25, 80)
            followers += growth

            engagement = cfg["eng"] + rand(-1.8, 2.4)

            reach = int(followers * rand(0.25, 0.9))
            impressions = int(reach * rand(1.1, 2.3))

            if random.random() < 0.05:
                reach *= random.randint(2, 5)
                impressions *= random.randint(2, 6)

            db.add(
                Analytics(
                    id=uid(),
                    user_id=user.id,
                    platform=platform,
                    date=random_time(day),
                    follower_count=followers,
                    follower_delta=growth,
                    total_reach=reach,
                    total_impressions=impressions,
                    avg_engagement_rate=round(max(0.5, engagement), 2),
                    posts_count=random.randint(0, 3),
                    audience_data={
                        "age_groups": {
                            "18-24": random.randint(20, 34),
                            "25-34": random.randint(34, 48),
                            "35-44": random.randint(10, 20),
                            "45+": random.randint(6, 14),
                        },
                        "gender": {
                            "female": random.randint(55, 70),
                            "male": random.randint(25, 40),
                            "other": random.randint(1, 5),
                        },
                    },
                )
            )


# ----------------------------------------------------------
# POSTS
# ----------------------------------------------------------

def create_posts(db, user):

    posts = []

    for _ in range(100):

        caption = random.choice(POST_CAPTIONS)

        post = Post(
            id=uid(),
            user_id=user.id,
            caption=caption,
            hashtags=random.sample(HASHTAGS, 4),
            platforms=random.sample(list(PLATFORMS.keys()), random.randint(1, 3)),
            status="published",
            published_at=random_time(random.randint(1, 60)),
            ai_score=random.randint(60, 95),
        )

        db.add(post)
        db.flush()

        posts.append(post)

    return posts


# ----------------------------------------------------------
# POST METRICS
# ----------------------------------------------------------

def create_post_metrics(db, posts):

    for post in posts:

        for platform in post.platforms:

            base_views = random.randint(2000, 80000)
            multiplier = rand(0.6, 1.6)

            if random.random() < 0.1:
                multiplier *= random.randint(2, 5)

            views = int(base_views * multiplier)

            likes = int(views * rand(0.04, 0.12))
            comments = int(likes * rand(0.02, 0.08))
            shares = int(likes * rand(0.03, 0.1))
            saves = int(likes * rand(0.05, 0.2))

            reach = int(views * rand(0.7, 0.95))
            impressions = int(reach * rand(1.1, 2.0))

            engagement_rate = round(
                (likes + comments + shares + saves) / max(reach, 1) * 100,
                2,
            )

            db.add(
                PostMetric(
                    id=uid(),
                    post_id=post.id,
                    platform=platform,
                    likes=likes,
                    comments=comments,
                    shares=shares,
                    saves=saves,
                    views=views,
                    reach=reach,
                    impressions=impressions,
                    engagement_rate=engagement_rate,
                )
            )


# ----------------------------------------------------------
# ALERTS
# ----------------------------------------------------------

def create_alerts(db, user):

    for _ in range(20):

        alert_types = [
            "viral_post",
            "engagement_spike",
            "milestone_hit",
            "trending_topic",
            "engagement_drop",
        ]

        db.add(
            Alert(
                id=uid(),
                user_id=user.id,
                type=random.choice(alert_types),
                severity=random.choice(["info", "success", "warning"]),
                platform=random.choice(list(PLATFORMS.keys())),
                title="Creator insight detected",
                body="AI detected unusual engagement spike in your recent content.",
                alert_metadata={},
                is_read=random.choice([True, False]),
            )
        )


# ----------------------------------------------------------
# MILESTONES
# ----------------------------------------------------------

def create_milestones(db, user):

    goals = [50000, 100000, 250000]

    for g in goals:

        db.add(
            Milestone(
                id=uid(),
                user_id=user.id,
                goal_type="followers",
                target_value=g,
                current_value=random.randint(10000, g),
                is_achieved=random.choice([True, False]),
                badge_name=f"{g} Followers Club",
            )
        )


# ----------------------------------------------------------
# BRAND DEALS
# ----------------------------------------------------------

def create_brand_deals(db, user):

    for _ in range(15):

        db.add(
            BrandDeal(
                id=uid(),
                user_id=user.id,
                brand_name=random.choice(BRANDS),
                deal_type=random.choice(
                    [
                        "Instagram Reel",
                        "TikTok Video",
                        "YouTube Integration",
                        "Brand Ambassador",
                    ]
                ),
                platform=random.choice(list(PLATFORMS.keys())),
                stage=random.choice(DEAL_STAGES),
                value=random.randint(300, 3000),
                ai_fit_score=random.randint(60, 98),
            )
        )


# ----------------------------------------------------------
# MAIN
# ----------------------------------------------------------

def seed():

    with Session(engine) as db:

        print("Creating demo user")
        user = create_user(db)

        print("Creating social accounts")
        create_social_accounts(db, user)

        print("Generating analytics")
        create_analytics(db, user)

        print("Creating posts")
        posts = create_posts(db, user)

        print("Generating post metrics")
        create_post_metrics(db, posts)

        print("Creating alerts")
        create_alerts(db, user)

        print("Creating milestones")
        create_milestones(db, user)

        print("Creating brand deals")
        create_brand_deals(db, user)

        db.commit()

    print("")
    print("DEMO ACCOUNT READY")
    print("Email: demo@creatorinsight.app")
    print("Password: Demo1234!")


if __name__ == "__main__":
    seed()