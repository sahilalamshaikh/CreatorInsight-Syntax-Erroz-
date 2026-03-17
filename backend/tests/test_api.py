"""
Tests for auth and post endpoints.
Run with: pytest tests/ -v
Requires a test database — set DATABASE_URL in your .env to a test DB.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.main import app
from app.db.session import Base, get_db
from app.core.config import settings

TEST_DB_URL = settings.DATABASE_URL.replace("/creatorinsight", "/creatorinsight_test")

test_engine = create_async_engine(TEST_DB_URL, echo=False)
TestSession = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSession() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "email": "test@creatorinsight.dev",
        "username": "testcreator",
        "full_name": "Test Creator",
        "password": "testpassword123",
        "niche": "lifestyle",
    })
    resp = await client.post("/api/v1/auth/login", json={
        "email": "test@creatorinsight.dev",
        "password": "testpassword123",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── Auth tests ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    resp = await client.post("/api/v1/auth/register", json={
        "email": "new@example.com",
        "username": "newuser",
        "full_name": "New User",
        "password": "password1234",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_register_duplicate(client: AsyncClient):
    payload = {"email": "dup@example.com", "username": "dupuser", "full_name": "Dup", "password": "password1234"}
    await client.post("/api/v1/auth/register", json=payload)
    resp = await client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "test@creatorinsight.dev"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    resp = await client.post("/api/v1/auth/login", json={
        "email": "test@creatorinsight.dev",
        "password": "wrongpassword",
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 403


# ── Post tests ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_post(client: AsyncClient, auth_headers):
    resp = await client.post("/api/v1/posts", headers=auth_headers, json={
        "caption": "My first post on CreatorInsight!",
        "platforms": ["instagram", "tiktok"],
        "hashtags": ["#creator", "#growth"],
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "draft"
    assert "instagram" in data["platforms"]
    return data["id"]


@pytest.mark.asyncio
async def test_list_posts(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/posts", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_create_post_no_platforms(client: AsyncClient, auth_headers):
    resp = await client.post("/api/v1/posts", headers=auth_headers, json={
        "caption": "This should fail",
        "platforms": [],
    })
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
