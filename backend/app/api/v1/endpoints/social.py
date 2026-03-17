from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from app.core.dependencies import DBSession, CurrentUser
from app.models.models import SocialAccount
from app.schemas.schemas import SocialAccountOut, MessageResponse

router = APIRouter(prefix="/social", tags=["social"])


@router.get("/accounts", response_model=list[SocialAccountOut])
async def list_connected_accounts(current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(SocialAccount).where(SocialAccount.user_id == current_user.id)
    )
    return result.scalars().all()


@router.get("/{platform}/connect")
async def connect_platform(platform: str, current_user: CurrentUser):
    """Returns mock OAuth URL — real implementation needs platform API keys."""
    return {
        "oauth_url": f"https://example.com/oauth/{platform}",
        "message": f"Add {platform.upper()}_CLIENT_ID to .env to enable real OAuth"
    }


@router.get("/{platform}/callback")
async def oauth_callback(platform: str):
    return {"message": f"{platform} OAuth callback — implement token exchange here"}


@router.delete("/{platform}/disconnect", response_model=MessageResponse)
async def disconnect_platform(platform: str, current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(SocialAccount).where(
            SocialAccount.user_id == current_user.id,
            SocialAccount.platform == platform,
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Account not connected")
    await db.delete(account)
    return MessageResponse(message=f"{platform} disconnected")
