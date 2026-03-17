from fastapi import APIRouter, Query
from sqlalchemy import select, desc
from app.core.dependencies import DBSession, CurrentUser
from app.models.models import Analytics, SocialAccount
from app.schemas.schemas import AnalyticsOverview, AnalyticsSummary

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
async def get_overview(current_user: CurrentUser, db: DBSession):
    """Aggregate analytics across all platforms for this user."""
    rows_result = await db.execute(
        select(Analytics)
        .where(Analytics.user_id == current_user.id)
        .order_by(desc(Analytics.date))
    )
    all_rows = rows_result.scalars().all()

    # Get latest row per platform
    seen_platforms = set()
    latest = []
    for row in all_rows:
        if row.platform not in seen_platforms:
            seen_platforms.add(row.platform)
            latest.append(row)

    summaries = [
        AnalyticsSummary(
            platform=r.platform,
            platform_username=r.platform,
            follower_count=r.follower_count,
            follower_delta=r.follower_delta,
            avg_engagement_rate=r.avg_engagement_rate,
            total_reach=r.total_reach,
            total_impressions=r.total_impressions,
            best_post_time=r.best_post_time,
            date=r.date,
        )
        for r in latest
    ]

    total_followers  = sum(s.follower_count for s in summaries)
    total_delta      = sum(s.follower_delta for s in summaries)
    total_reach      = sum(s.total_reach for s in summaries)
    total_imp        = sum(s.total_impressions for s in summaries)
    eng_rates        = [s.avg_engagement_rate for s in summaries if s.avg_engagement_rate > 0]
    avg_eng          = round(sum(eng_rates) / len(eng_rates), 2) if eng_rates else 0.0

    return AnalyticsOverview(
        total_followers=total_followers,
        total_follower_delta=total_delta,
        avg_engagement_rate=avg_eng,
        total_reach=total_reach,
        total_impressions=total_imp,
        platforms=summaries,
    )


@router.get("/platform/{platform}", response_model=list[AnalyticsSummary])
async def get_platform_analytics(
    platform: str,
    current_user: CurrentUser,
    db: DBSession,
    days: int = Query(default=30, ge=1, le=90),
):
    """Time-series analytics for a single platform."""
    rows_result = await db.execute(
        select(Analytics)
        .where(
            Analytics.user_id == current_user.id,
            Analytics.platform == platform,
        )
        .order_by(desc(Analytics.date))
        .limit(days)
    )
    rows = rows_result.scalars().all()

    return [
        AnalyticsSummary(
            platform=r.platform,
            platform_username=r.platform,
            follower_count=r.follower_count,
            follower_delta=r.follower_delta,
            avg_engagement_rate=r.avg_engagement_rate,
            total_reach=r.total_reach,
            total_impressions=r.total_impressions,
            best_post_time=r.best_post_time,
            date=r.date,
        )
        for r in rows
    ]
