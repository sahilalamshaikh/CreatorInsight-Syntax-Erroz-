code = r'''import json
from fastapi import APIRouter
from app.core.dependencies import CurrentUser
from app.core.config import settings
from app.schemas.schemas import AIFeedbackRequest, AIFeedbackResponse

router = APIRouter(prefix="/ai", tags=["ai"])


def _clean_json(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1] if len(parts) > 1 else raw
        if raw.startswith("json"):
            raw = raw[4:]
    return raw.strip()


async def _groq_score(caption, hashtags, platforms):
    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        names = [p if isinstance(p, str) else p.value for p in platforms]
        prompt = (
            f"You are a social media growth expert. Analyse this caption for {names}.\n"
            f"Caption: {caption}\n"
            f"Hashtags: {hashtags}\n\n"
            "Reply with ONLY valid JSON, no markdown, no explanation:\n"
            '{"score": 75, "grade": "Good", '
            '"suggestions": [{"type": "positive", "text": "specific tip here"}, {"type": "improve", "text": "specific improvement here"}], '
            '"hashtag_recommendations": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"], '
            '"best_post_time": "6-8 PM Tue/Thu"}'
            "\n\nReplace ALL values with your actual analysis of the caption above. Score 0-100."
        )
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
        )
        raw = response.choices[0].message.content
        print("Groq response:", raw[:120])
        return json.loads(_clean_json(raw))
    except Exception as e:
        print("Groq error:", e)
        return None


def _fallback_score(caption, hashtags, platforms):
    score = 50
    suggestions = []
    if len(caption) > 80:
        score += 10
    if "?" in caption:
        score += 9
        suggestions.append({"type": "positive", "text": "Question CTA boosts comments by 22%."})
    else:
        suggestions.append({"type": "improve", "text": "Add a question to invite comments."})
    if len(hashtags) < 3:
        score -= 5
        suggestions.append({"type": "improve", "text": "Add 3-5 niche hashtags for reach."})
    elif len(hashtags) <= 8:
        score += 8
        suggestions.append({"type": "positive", "text": "Good hashtag count."})
    score = max(0, min(100, score))
    grade = "Excellent" if score >= 85 else "Good" if score >= 70 else "Fair" if score >= 50 else "Needs work"
    return {
        "score": score, "grade": grade, "suggestions": suggestions,
        "hashtag_recommendations": ["#ContentCreator", "#CreatorEconomy", "#GrowthHacking", "#SmallCreator", "#Viral"],
        "best_post_time": "6-8 PM Tue/Thu",
    }


@router.post("/feedback", response_model=AIFeedbackResponse)
async def get_ai_feedback(payload: AIFeedbackRequest, current_user: CurrentUser):
    key = settings.GROQ_API_KEY
    print("GROQ KEY present:", bool(key))
    if key:
        result = await _groq_score(payload.caption, payload.hashtags, payload.platforms)
        if result:
            return AIFeedbackResponse(**result)
    return AIFeedbackResponse(**_fallback_score(payload.caption, payload.hashtags, payload.platforms))


@router.get("/growth-tips", response_model=list[dict])
async def get_growth_tips(current_user: CurrentUser):
    niche = current_user.niche or "content creation"
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            prompt = (
                f"Give 5 specific actionable social media growth tips for a {niche} creator with 80K followers.\n"
                "Reply with ONLY a JSON array, no markdown:\n"
                '[{"platform": "instagram", "impact": "high", "tip": "your specific tip here"}]'
            )
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
            )
            raw = response.choices[0].message.content
            return json.loads(_clean_json(raw))
        except Exception as e:
            print("Tips error:", e)
    return [
        {"platform": "instagram", "impact": "high",   "tip": f"Post Reels 4x/week for {niche} creators."},
        {"platform": "youtube",   "impact": "medium", "tip": "Add chapter markers to boost watch time."},
        {"platform": "tiktok",    "impact": "high",   "tip": "Hook viewers in the first 2 seconds."},
        {"platform": "all",       "impact": "medium", "tip": "Cross-post your best content within 24h."},
        {"platform": "instagram", "impact": "medium", "tip": "Reply to comments in the first 60 minutes."},
    ]


@router.get("/trending-hashtags", response_model=list[dict])
async def get_trending_hashtags(current_user: CurrentUser):
    niche = current_user.niche or "lifestyle"
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            prompt = (
                f"List 7 trending hashtags for {niche} creators on Instagram and TikTok in 2025.\n"
                "Reply with ONLY a JSON array, no markdown:\n"
                '[{"hashtag": "#example", "posts": "186K", "trend": "rising"}]'
            )
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=400,
            )
            raw = response.choices[0].message.content
            return json.loads(_clean_json(raw))
        except Exception as e:
            print("Hashtag error:", e)
    return [
        {"hashtag": "#ContentCreator", "posts": "412K", "trend": "stable"},
        {"hashtag": "#CreatorEconomy", "posts": "310K", "trend": "rising"},
        {"hashtag": "#MorningRitual",  "posts": "186K", "trend": "rising"},
        {"hashtag": "#GrowthHacking",  "posts": "210K", "trend": "stable"},
        {"hashtag": "#SmallCreator",   "posts": "67K",  "trend": "rising"},
        {"hashtag": "#HabitStack",     "posts": "61K",  "trend": "rising"},
        {"hashtag": "#Wellness",       "posts": "500K", "trend": "stable"},
    ]
'''

with open("app/api/v1/endpoints/ai.py", "w", encoding="utf-8") as f:
    f.write(code)

print("Done! ai.py updated to use Groq.")