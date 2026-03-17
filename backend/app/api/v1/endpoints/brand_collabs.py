from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select, desc
from app.core.dependencies import DBSession, CurrentUser
from app.models.models import BrandDeal
from app.schemas.schemas import BrandDealCreate, BrandDealOut, BrandDealUpdate, MessageResponse

router = APIRouter(prefix="/brand-collabs", tags=["brand-collabs"])

STAGES = ["prospect", "in_talks", "contract_sent", "live", "completed"]


@router.get("", response_model=list[BrandDealOut])
async def list_deals(
    current_user: CurrentUser,
    db: DBSession,
    stage: str | None = Query(default=None),
):
    query = select(BrandDeal).where(BrandDeal.user_id == current_user.id)
    if stage:
        query = query.where(BrandDeal.stage == stage)
    query = query.order_by(desc(BrandDeal.created_at))
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=BrandDealOut, status_code=201)
async def create_deal(payload: BrandDealCreate, current_user: CurrentUser, db: DBSession):
    deal = BrandDeal(
        user_id=current_user.id,
        brand_name=payload.brand_name,
        deal_type=payload.deal_type,
        platform=payload.platform,
        stage=payload.stage or "prospect",
        value=payload.value,
        ai_fit_score=payload.ai_fit_score,
        notes=payload.notes,
        contact_email=payload.contact_email,
    )
    db.add(deal)
    await db.flush()
    await db.refresh(deal)
    return deal


@router.patch("/{deal_id}", response_model=BrandDealOut)
async def update_deal(deal_id: str, payload: BrandDealUpdate, current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(BrandDeal).where(BrandDeal.id == deal_id, BrandDeal.user_id == current_user.id)
    )
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(deal, field, value)
    return deal


@router.delete("/{deal_id}", response_model=MessageResponse)
async def delete_deal(deal_id: str, current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(BrandDeal).where(BrandDeal.id == deal_id, BrandDeal.user_id == current_user.id)
    )
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    await db.delete(deal)
    return MessageResponse(message="Deal deleted")


@router.get("/discover", response_model=list[dict])
async def discover_brands(current_user: CurrentUser):
    """AI-matched brand suggestions based on creator niche."""
    niche = current_user.niche or "lifestyle"
    return [
        {"name": "Calm",          "fit": 92, "budget": "$500-$900",  "niche": "wellness",   "description": "Meditation app targeting 25-34 audience — perfect match."},
        {"name": "Headspace",     "fit": 95, "budget": "$600-$1000", "niche": "wellness",   "description": "Top mindfulness app, actively recruiting lifestyle creators."},
        {"name": "Ritual",        "fit": 88, "budget": "$700-$1200", "niche": "wellness",   "description": "Science-backed supplements, female-skewed audience alignment."},
        {"name": "Lululemon",     "fit": 81, "budget": "$600-$900",  "niche": "lifestyle",  "description": "Activewear expanding into wellness content verticals."},
        {"name": "Notion",        "fit": 74, "budget": "$500-$800",  "niche": "lifestyle",  "description": "Productivity app with creator program, YouTube preferred."},
        {"name": "Oura Ring",     "fit": 86, "budget": "$500-$750",  "niche": "wellness",   "description": "Sleep tracker wearable — authentic lifestyle integration."},
        {"name": "Athletic Greens", "fit": 84, "budget": "$800-$1400", "niche": "fitness", "description": "Nutrition brand with strong creator affiliate program."},
    ]
