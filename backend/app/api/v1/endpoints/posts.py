from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.core.dependencies import DBSession, CurrentUser
from app.models.models import Post
from app.schemas.schemas import PostCreate, PostUpdate, PostOut, PostMetricOut, MessageResponse

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def create_post(payload: PostCreate, current_user: CurrentUser, db: DBSession):
    post = Post(
        user_id=current_user.id,
        caption=payload.caption,
        hashtags=payload.hashtags,
        platforms=[p if isinstance(p, str) else p.value for p in payload.platforms],
        media_urls=payload.media_urls,
        scheduled_at=payload.scheduled_at,
        status="scheduled" if payload.scheduled_at else "draft",
    )
    db.add(post)
    await db.flush()
    await db.refresh(post)
    return post


@router.get("", response_model=list[PostOut])
async def list_posts(
    current_user: CurrentUser,
    db: DBSession,
    post_status: str | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
):
    query = select(Post).where(Post.user_id == current_user.id)
    if post_status:
        query = query.where(Post.status == post_status)
    query = query.order_by(desc(Post.created_at)).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{post_id}", response_model=PostOut)
async def get_post(post_id: str, current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(Post).where(Post.id == post_id, Post.user_id == current_user.id)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.patch("/{post_id}", response_model=PostOut)
async def update_post(post_id: str, payload: PostUpdate, current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(Post).where(Post.id == post_id, Post.user_id == current_user.id)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.status == "published":
        raise HTTPException(status_code=400, detail="Cannot edit a published post")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(post, field, value)
    return post


@router.delete("/{post_id}", response_model=MessageResponse)
async def delete_post(post_id: str, current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(Post).where(Post.id == post_id, Post.user_id == current_user.id)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.delete(post)
    return MessageResponse(message="Post deleted")


@router.post("/{post_id}/publish", response_model=PostOut)
async def publish_post(post_id: str, current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(Post).where(Post.id == post_id, Post.user_id == current_user.id)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.status == "published":
        raise HTTPException(status_code=400, detail="Already published")
    # For hackathon: mark as published immediately (no real API call)
    from datetime import datetime, timezone
    post.status = "published"
    post.published_at = datetime.now(timezone.utc)
    return post


@router.get("/{post_id}/metrics", response_model=list[PostMetricOut])
async def get_post_metrics(post_id: str, current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(Post).options(selectinload(Post.metrics))
        .where(Post.id == post_id, Post.user_id == current_user.id)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post.metrics
