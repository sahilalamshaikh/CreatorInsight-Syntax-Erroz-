import uuid
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import (
    String, Boolean, Float, Integer, Text, DateTime,
    ForeignKey, JSON, Enum, UniqueConstraint, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.session import Base


# ── Enums ─────────────────────────────────────────────────────────────────

class Platform(str, PyEnum):
    INSTAGRAM = "instagram"
    YOUTUBE   = "youtube"
    TIKTOK    = "tiktok"
    TWITTER   = "twitter"
    LINKEDIN  = "linkedin"
    FACEBOOK  = "facebook"


class PostStatus(str, PyEnum):
    DRAFT      = "draft"
    SCHEDULED  = "scheduled"
    PUBLISHING = "publishing"
    PUBLISHED  = "published"
    FAILED     = "failed"


class AlertType(str, PyEnum):
    ENGAGEMENT_DROP  = "engagement_drop"
    ENGAGEMENT_SPIKE = "engagement_spike"
    VIRAL_POST       = "viral_post"
    TRENDING_TOPIC   = "trending_topic"
    MILESTONE_NEAR   = "milestone_near"
    MILESTONE_HIT    = "milestone_hit"


class AlertSeverity(str, PyEnum):
    INFO    = "info"
    WARNING = "warning"
    SUCCESS = "success"


class GoalType(str, PyEnum):
    FOLLOWERS   = "followers"
    ENGAGEMENT  = "engagement"
    IMPRESSIONS = "impressions"
    VIEWS       = "views"


# ── Mixin ─────────────────────────────────────────────────────────────────

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )


# ── Models ────────────────────────────────────────────────────────────────

class User(TimestampMixin, Base):
    __tablename__ = "users"

    id:               Mapped[str]      = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email:            Mapped[str]      = mapped_column(String(255), unique=True, nullable=False, index=True)
    username:         Mapped[str]      = mapped_column(String(50),  unique=True, nullable=False, index=True)
    full_name:        Mapped[str]      = mapped_column(String(255), nullable=False)
    hashed_password:  Mapped[str|None] = mapped_column(String(255), nullable=True)
    avatar_url:       Mapped[str|None] = mapped_column(Text, nullable=True)
    niche:            Mapped[str|None] = mapped_column(String(100), nullable=True)
    bio:              Mapped[str|None] = mapped_column(Text, nullable=True)
    is_active:        Mapped[bool]     = mapped_column(Boolean, default=True)
    is_verified:      Mapped[bool]     = mapped_column(Boolean, default=False)
    onboarded:        Mapped[bool]     = mapped_column(Boolean, default=False)

    social_accounts: Mapped[list["SocialAccount"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    posts:           Mapped[list["Post"]]           = relationship(back_populates="user", cascade="all, delete-orphan")
    alerts:          Mapped[list["Alert"]]          = relationship(back_populates="user", cascade="all, delete-orphan")
    milestones:      Mapped[list["Milestone"]]      = relationship(back_populates="user", cascade="all, delete-orphan")
    analytics:       Mapped[list["Analytics"]]      = relationship(back_populates="user", cascade="all, delete-orphan")
    brand_deals:     Mapped[list["BrandDeal"]]      = relationship(back_populates="user", cascade="all, delete-orphan")


class SocialAccount(TimestampMixin, Base):
    __tablename__ = "social_accounts"
    __table_args__ = (UniqueConstraint("user_id", "platform", name="uq_user_platform"),)

    id:                Mapped[str]      = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id:           Mapped[str]      = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    platform:          Mapped[str]      = mapped_column(String(20), nullable=False)
    platform_user_id:  Mapped[str]      = mapped_column(String(255), nullable=False)
    platform_username: Mapped[str]      = mapped_column(String(255), nullable=False)
    access_token:      Mapped[str]      = mapped_column(Text, nullable=False, default="seeded")
    refresh_token:     Mapped[str|None] = mapped_column(Text, nullable=True)
    follower_count:    Mapped[int]      = mapped_column(Integer, default=0)
    is_active:         Mapped[bool]     = mapped_column(Boolean, default=True)

    user: Mapped["User"] = relationship(back_populates="social_accounts")


class Post(TimestampMixin, Base):
    __tablename__ = "posts"

    id:            Mapped[str]      = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id:       Mapped[str]      = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    caption:       Mapped[str]      = mapped_column(Text, nullable=False)
    media_urls:    Mapped[str]      = mapped_column(JSON, default=list)
    hashtags:      Mapped[str]      = mapped_column(JSON, default=list)
    platforms:     Mapped[str]      = mapped_column(JSON, default=list)
    status:        Mapped[str]      = mapped_column(String(20), default="draft")
    scheduled_at:  Mapped[datetime|None] = mapped_column(DateTime, nullable=True)
    published_at:  Mapped[datetime|None] = mapped_column(DateTime, nullable=True)
    ai_score:      Mapped[float|None]    = mapped_column(Float, nullable=True)
    ai_feedback:   Mapped[str|None]      = mapped_column(JSON, nullable=True)
    platform_post_ids: Mapped[str]       = mapped_column(JSON, default=dict)

    user:    Mapped["User"]             = relationship(back_populates="posts")
    metrics: Mapped[list["PostMetric"]] = relationship(back_populates="post", cascade="all, delete-orphan")


class PostMetric(TimestampMixin, Base):
    __tablename__ = "post_metrics"

    id:              Mapped[str]   = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    post_id:         Mapped[str]   = mapped_column(String(36), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    platform:        Mapped[str]   = mapped_column(String(20), nullable=False)
    likes:           Mapped[int]   = mapped_column(Integer, default=0)
    comments:        Mapped[int]   = mapped_column(Integer, default=0)
    shares:          Mapped[int]   = mapped_column(Integer, default=0)
    saves:           Mapped[int]   = mapped_column(Integer, default=0)
    views:           Mapped[int]   = mapped_column(Integer, default=0)
    reach:           Mapped[int]   = mapped_column(Integer, default=0)
    impressions:     Mapped[int]   = mapped_column(Integer, default=0)
    engagement_rate: Mapped[float] = mapped_column(Float, default=0.0)
    snapshotted_at:  Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    post: Mapped["Post"] = relationship(back_populates="metrics")


class Analytics(TimestampMixin, Base):
    __tablename__ = "analytics"

    id:                  Mapped[str]   = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id:             Mapped[str]   = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    platform:            Mapped[str]   = mapped_column(String(20), nullable=False)
    date:                Mapped[datetime] = mapped_column(DateTime, nullable=False)
    follower_count:      Mapped[int]   = mapped_column(Integer, default=0)
    follower_delta:      Mapped[int]   = mapped_column(Integer, default=0)
    total_reach:         Mapped[int]   = mapped_column(Integer, default=0)
    total_impressions:   Mapped[int]   = mapped_column(Integer, default=0)
    avg_engagement_rate: Mapped[float] = mapped_column(Float, default=0.0)
    posts_count:         Mapped[int]   = mapped_column(Integer, default=0)
    audience_data:       Mapped[str]   = mapped_column(JSON, default=dict)
    best_post_time:      Mapped[str]   = mapped_column(JSON, default=dict)

    user: Mapped["User"] = relationship(back_populates="analytics")


class Alert(TimestampMixin, Base):
    __tablename__ = "alerts"

    id:       Mapped[str]      = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id:  Mapped[str]      = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type:     Mapped[str]      = mapped_column(String(30), nullable=False)
    severity: Mapped[str]      = mapped_column(String(10), nullable=False)
    platform: Mapped[str|None] = mapped_column(String(20), nullable=True)
    title:    Mapped[str]      = mapped_column(String(255), nullable=False)
    body:     Mapped[str]      = mapped_column(Text, nullable=False)
    alert_metadata: Mapped[str] = mapped_column(JSON, default=dict)
    is_read:  Mapped[bool]     = mapped_column(Boolean, default=False)
    read_at:  Mapped[datetime|None] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship(back_populates="alerts")


class Milestone(TimestampMixin, Base):
    __tablename__ = "milestones"

    id:            Mapped[str]      = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id:       Mapped[str]      = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    platform:      Mapped[str|None] = mapped_column(String(20), nullable=True)
    goal_type:     Mapped[str]      = mapped_column(String(20), nullable=False)
    target_value:  Mapped[int]      = mapped_column(Integer, nullable=False)
    current_value: Mapped[int]      = mapped_column(Integer, default=0)
    is_achieved:   Mapped[bool]     = mapped_column(Boolean, default=False)
    achieved_at:   Mapped[datetime|None] = mapped_column(DateTime, nullable=True)
    next_target:   Mapped[int|None] = mapped_column(Integer, nullable=True)
    badge_name:    Mapped[str|None] = mapped_column(String(100), nullable=True)

    user: Mapped["User"] = relationship(back_populates="milestones")


class BrandDeal(TimestampMixin, Base):
    __tablename__ = "brand_deals"

    id:           Mapped[str]      = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id:      Mapped[str]      = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    brand_name:   Mapped[str]      = mapped_column(String(255), nullable=False)
    deal_type:    Mapped[str]      = mapped_column(String(50), nullable=False)
    platform:     Mapped[str|None] = mapped_column(String(20), nullable=True)
    stage:        Mapped[str]      = mapped_column(String(30), default="prospect")
    value:        Mapped[float|None] = mapped_column(Float, nullable=True)
    ai_fit_score: Mapped[float|None] = mapped_column(Float, nullable=True)
    notes:        Mapped[str|None] = mapped_column(Text, nullable=True)
    contact_email: Mapped[str|None] = mapped_column(String(255), nullable=True)

    user: Mapped["User"] = relationship(back_populates="brand_deals")
