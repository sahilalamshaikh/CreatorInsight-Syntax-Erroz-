from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator

# ── Auth ──────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    niche: str | None = Field(default=None, max_length=100)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

# ── User ──────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: str
    email: str
    username: str
    full_name: str
    avatar_url: str | None
    niche: str | None
    bio: str | None
    is_verified: bool
    onboarded: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class UserUpdate(BaseModel):
    full_name: str | None = None
    username:  str | None = None
    niche:     str | None = None
    bio:       str | None = None
    avatar_url: str | None = None

# ── Social ────────────────────────────────────────────────────────────────

class SocialAccountOut(BaseModel):
    id: str
    platform: str
    platform_username: str
    follower_count: int
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}

# ── Posts ─────────────────────────────────────────────────────────────────

class PostCreate(BaseModel):
    caption: str = Field(min_length=1, max_length=5000)
    hashtags: list[str] = Field(default_factory=list)
    platforms: list[str] = Field(min_length=1)
    media_urls: list[str] = Field(default_factory=list)
    scheduled_at: datetime | None = None

    @field_validator("platforms")
    @classmethod
    def platforms_not_empty(cls, v):
        if not v:
            raise ValueError("Select at least one platform")
        return list(set(v))

class PostUpdate(BaseModel):
    caption: str | None = Field(default=None, max_length=5000)
    hashtags: list[str] | None = None
    platforms: list[str] | None = None
    scheduled_at: datetime | None = None

class PostOut(BaseModel):
    id: str
    caption: str
    hashtags: list
    platforms: list
    status: str
    scheduled_at: datetime | None
    published_at: datetime | None
    ai_score: float | None
    ai_feedback: dict | None
    platform_post_ids: dict
    created_at: datetime
    model_config = {"from_attributes": True}

class PostMetricOut(BaseModel):
    platform: str
    likes: int
    comments: int
    shares: int
    saves: int
    views: int
    reach: int
    impressions: int
    engagement_rate: float
    snapshotted_at: datetime
    model_config = {"from_attributes": True}

# ── Analytics ─────────────────────────────────────────────────────────────

class AnalyticsSummary(BaseModel):
    platform: str
    platform_username: str
    follower_count: int
    follower_delta: int
    avg_engagement_rate: float
    total_reach: int
    total_impressions: int
    best_post_time: dict
    date: datetime
    model_config = {"from_attributes": True}

class AnalyticsOverview(BaseModel):
    total_followers: int
    total_follower_delta: int
    avg_engagement_rate: float
    total_reach: int
    total_impressions: int
    platforms: list[AnalyticsSummary]

# ── AI ────────────────────────────────────────────────────────────────────

class AIFeedbackRequest(BaseModel):
    caption: str = Field(min_length=1, max_length=5000)
    platforms: list[str]
    hashtags: list[str] = Field(default_factory=list)

class AIFeedbackResponse(BaseModel):
    score: int = Field(ge=0, le=100)
    grade: str
    suggestions: list[dict]
    hashtag_recommendations: list[str]
    best_post_time: str

# ── Alerts ────────────────────────────────────────────────────────────────

class AlertOut(BaseModel):
    id: str
    type: str
    severity: str
    platform: str | None
    title: str
    body: str
    alert_metadata: dict
    is_read: bool
    read_at: datetime | None
    created_at: datetime
    model_config = {"from_attributes": True}

# ── Milestones ────────────────────────────────────────────────────────────

class MilestoneCreate(BaseModel):
    platform: str | None = None
    goal_type: str
    target_value: int = Field(gt=0)

class MilestoneOut(BaseModel):
    id: str
    platform: str | None
    goal_type: str
    target_value: int
    current_value: int
    is_achieved: bool
    achieved_at: datetime | None
    next_target: int | None
    badge_name: str | None
    progress_pct: float
    model_config = {"from_attributes": True}

    @classmethod
    def from_model(cls, m) -> "MilestoneOut":
        pct = round(min(100.0, (m.current_value / m.target_value) * 100), 1) if m.target_value else 0
        return cls(
            id=m.id, platform=m.platform, goal_type=m.goal_type,
            target_value=m.target_value, current_value=m.current_value,
            is_achieved=m.is_achieved, achieved_at=m.achieved_at,
            next_target=m.next_target, badge_name=m.badge_name,
            progress_pct=pct,
        )

# ── Brand Collabs ─────────────────────────────────────────────────────────

class BrandDealCreate(BaseModel):
    brand_name: str = Field(min_length=1, max_length=255)
    deal_type: str = Field(min_length=1, max_length=50)
    platform: str | None = None
    stage: str | None = "prospect"
    value: float | None = None
    ai_fit_score: float | None = None
    notes: str | None = None
    contact_email: str | None = None

class BrandDealUpdate(BaseModel):
    brand_name: str | None = None
    deal_type: str | None = None
    platform: str | None = None
    stage: str | None = None
    value: float | None = None
    notes: str | None = None
    contact_email: str | None = None

class BrandDealOut(BaseModel):
    id: str
    brand_name: str
    deal_type: str
    platform: str | None
    stage: str
    value: float | None
    ai_fit_score: float | None
    notes: str | None
    contact_email: str | None
    created_at: datetime
    model_config = {"from_attributes": True}

# ── Shared ────────────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
