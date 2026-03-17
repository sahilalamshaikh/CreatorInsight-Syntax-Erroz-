import uuid
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select, desc, update
from datetime import datetime, timezone
from app.core.dependencies import DBSession, CurrentUser
from app.models.models import Alert, Milestone
from app.schemas.schemas import AlertOut, MilestoneCreate, MilestoneOut, MessageResponse

# ── Alerts ────────────────────────────────────────────────────────────────

alerts_router = APIRouter(prefix="/alerts", tags=["alerts"])


@alerts_router.get("", response_model=list[AlertOut])
async def list_alerts(
    current_user: CurrentUser,
    db: DBSession,
    unread_only: bool = Query(default=False),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=30, ge=1, le=100),
):
    query = select(Alert).where(Alert.user_id == current_user.id)
    if unread_only:
        query = query.where(Alert.is_read == False)
    query = query.order_by(desc(Alert.created_at)).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    return result.scalars().all()


@alerts_router.patch("/{alert_id}/read", response_model=AlertOut)
async def mark_alert_read(alert_id: str, current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(Alert).where(Alert.id == alert_id, Alert.user_id == current_user.id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    alert.read_at = datetime.now(timezone.utc)
    return alert


@alerts_router.post("/read-all", response_model=MessageResponse)
async def mark_all_read(current_user: CurrentUser, db: DBSession):
    await db.execute(
        update(Alert)
        .where(Alert.user_id == current_user.id, Alert.is_read == False)
        .values(is_read=True, read_at=datetime.now(timezone.utc))
    )
    return MessageResponse(message="All alerts marked as read")


# ── Milestones ────────────────────────────────────────────────────────────

milestones_router = APIRouter(prefix="/milestones", tags=["milestones"])


def _calc_pct(m: Milestone) -> float:
    if not m.target_value:
        return 0.0
    return round(min(100.0, (m.current_value / m.target_value) * 100), 1)


@milestones_router.get("", response_model=list[MilestoneOut])
async def list_milestones(current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(Milestone)
        .where(Milestone.user_id == current_user.id)
        .order_by(Milestone.is_achieved, desc(Milestone.created_at))
    )
    milestones = result.scalars().all()
    return [MilestoneOut.from_model(m) for m in milestones]


@milestones_router.post("", response_model=MilestoneOut, status_code=201)
async def create_milestone(payload: MilestoneCreate, current_user: CurrentUser, db: DBSession):
    badge_map = {
        1000: "Rising Star", 5000: "Community Builder",
        10000: "Five-Figure Creator", 50000: "Influencer",
        100000: "Six-Figure Creator",
    }
    badge = next((v for k, v in badge_map.items() if payload.target_value <= k), "Goal Setter")
    milestone = Milestone(
        user_id=current_user.id,
        platform=payload.platform,
        goal_type=payload.goal_type,
        target_value=payload.target_value,
        badge_name=badge,
    )
    db.add(milestone)
    await db.flush()
    await db.refresh(milestone)
    return MilestoneOut.from_model(milestone)


@milestones_router.delete("/{milestone_id}", response_model=MessageResponse)
async def delete_milestone(milestone_id: str, current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(Milestone).where(Milestone.id == milestone_id, Milestone.user_id == current_user.id)
    )
    m = result.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=404, detail="Milestone not found")
    await db.delete(m)
    return MessageResponse(message="Milestone deleted")
