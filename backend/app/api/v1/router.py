from fastapi import APIRouter
from app.api.v1.endpoints import auth, analytics, posts, ai, social, brand_collabs
from app.api.v1.endpoints.alerts_milestones import alerts_router, milestones_router

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(analytics.router)
api_router.include_router(posts.router)
api_router.include_router(ai.router)
api_router.include_router(social.router)
api_router.include_router(brand_collabs.router)
api_router.include_router(alerts_router)
api_router.include_router(milestones_router)
