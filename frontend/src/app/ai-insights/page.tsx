'use client';
import { useState, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import SectionLabel from '@/components/ui/SectionLabel';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { aiApi } from '@/lib/api';

const PLATFORMS = ['instagram','youtube','tiktok','twitter','linkedin'];
const PAST_POSTS = [
  { title: 'Morning routine that changed my life', platform: 'instagram', score: 91, eng: '6.8%', caption: 'Morning routine that changed my life 🌅 Starting the day with intention, movement, and calm. What\'s your non-negotiable morning habit? Drop it below! #MorningRoutine #DailyHabits #Wellness' },
  { title: '5 productivity habits in 60 seconds',  platform: 'youtube',   score: 85, eng: '5.9%', caption: '5 productivity habits that will transform your week ⚡ Which one are you adding first? Subscribe for weekly growth tips! #Productivity #Habits' },
  { title: 'POV: You fixed your sleep schedule',   platform: 'tiktok',    score: 88, eng: '5.4%', caption: 'POV: You finally fixed your sleep schedule and everything changed 🌙 What\'s your bedtime secret? #SleepTok #Wellness' },
  { title: '10 lessons from year 1 as a creator',  platform: 'linkedin',  score: 72, eng: '3.1%', caption: '10 lessons from my first year as a full-time creator. Lesson 1: consistency beats virality every single time. #CreatorEconomy' },
];

const PLAT_COLOR: Record<string,string> = {
  instagram:'#534AB7', youtube:'#1D9E75', tiktok:'#D85A30', twitter:'#BA7517', linkedin:'#639922',
};

const RELATED_TOPICS: Record<string, string[]> = {
  wellness:     ['Morning routines','Sleep optimization','Meditation tips','Mindful eating','Stress management'],
  lifestyle:    ['Daily habits','Minimalism','Work-life balance','Self-improvement','Productivity hacks'],
  fitness:      ['Home workouts','Nutrition tips','Recovery routines','Gym motivation','Meal prep'],
  tech:         ['AI tools','App reviews','Coding tips','Tech news','Gadget reviews'],
  finance:      ['Budgeting tips','Investing basics','Side hustles','Saving money','Financial freedom'],
  food:         ['Easy recipes','Meal prep','Restaurant reviews','Cooking tips','Healthy snacks'],
  travel:       ['Budget travel','Solo travel tips','Hidden gems','Travel hacks','Packing tips'],
  default:      ['Content strategy','Audience growth','Engagement tips','Creator monetisation','Brand deals'],
};

export default function AiInsightsPage() {
  const [caption, setCaption]     = useState('');
  const [selPlats, setSelPlats]   = useState(['instagram','tiktok']);
  const [result, setResult]       = useState<any>(null);
  const [loading, setLoading]     = useState(false);
  const [tips, setTips]           = useState<any[]>([]);
  const [hashtags, setHashtags]   = useState<any[]>([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'analyser'|'trending'>('analyser');
  const [niche, setNiche]         = useState('wellness');

  function togglePlat(p: string) {
    setSelPlats(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  async function analyse() {
    if (!caption.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const tags = (caption.match(/#\w+/g) || []);
      const res = await aiApi.feedback({ caption, platforms: selPlats, hashtags: tags });
      setResult(res.data);
    } catch {
      setResult({
        score: 50, grade: 'Fair',
        suggestions: [{ type: 'improve', text: 'Add a question to invite comments.' }],
        hashtag_recommendations: ['#ContentCreator','#Growth','#Creator','#Social','#Viral'],
        best_post_time: '6–8 PM Tue/Thu',
      });
    } finally {
      setLoading(false);
    }

    // Also fetch tips and hashtags in background
    setTipsLoading(true);
    try {
      const [tipsRes, hashRes] = await Promise.all([
        aiApi.growthTips(),
        aiApi.trendingHashtags(),
      ]);
      setTips(tipsRes.data);
      setHashtags(hashRes.data);
    } catch {} finally {
      setTipsLoading(false);
    }
  }

  function loadPost(post: typeof PAST_POSTS[0]) {
    setCaption(post.caption);
    setResult(null);
    setActiveTab('analyser');
  }

  function addHashtagToCaption(tag: string) {
    if (!caption.includes(tag)) {
      setCaption(prev => prev + ' ' + tag);
    }
  }

  const scoreColor = result
    ? result.score >= 85 ? '#1D9E75' : result.score >= 70 ? '#534AB7' : '#BA7517'
    : '#9CA3AF';

  const relatedTopics = RELATED_TOPICS[niche] || RELATED_TOPICS.default;

  return (
    <AppShell>
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[15px] font-medium text-gray-900">AI insights</h1>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['analyser','trending'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="text-[12px] px-3 py-1.5 rounded-md capitalize transition-all"
                style={{
                  background: activeTab === tab ? 'white' : 'transparent',
                  color: activeTab === tab ? '#374151' : '#9CA3AF',
                  fontWeight: activeTab === tab ? 500 : 400,
                  boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}>
                {tab === 'analyser' ? 'Content analyser' : 'Trending topics'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'analyser' ? (
          <div className="grid grid-cols-3 gap-4">
            {/* Left: input + results */}
            <div className="col-span-2 flex flex-col gap-4">

              {/* Caption input */}
              <Card>
                <SectionLabel>Paste or type your caption</SectionLabel>
                <textarea
                  value={caption}
                  onChange={e => { setCaption(e.target.value); setResult(null); }}
                  rows={5}
                  placeholder="Write a caption and click Analyse — or click a past post on the right to load it…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-purple-400 resize-none leading-relaxed"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1 mb-3">
                  <span>{caption.length} characters</span>
                  <span>{(caption.match(/#\w+/g) || []).length} hashtags</span>
                </div>

                {/* Platform toggles */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {PLATFORMS.map(p => {
                    const on = selPlats.includes(p);
                    return (
                      <button key={p} onClick={() => togglePlat(p)}
                        className="text-[11px] px-2.5 py-1 rounded-full border capitalize transition-all"
                        style={{
                          background: on ? PLAT_COLOR[p] : 'white',
                          color: on ? 'white' : '#9CA3AF',
                          borderColor: on ? 'transparent' : '#E5E7EB',
                        }}>
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button onClick={analyse} disabled={loading || !caption.trim()}
                  className="px-5 py-2.5 rounded-lg text-white text-[13px] font-medium transition-opacity"
                  style={{ background: '#534AB7', opacity: !caption.trim() ? 0.4 : 1 }}>
                  {loading ? 'Analysing with AI…' : 'Analyse with AI'}
                </button>
              </Card>

              {/* Loading */}
              {loading && (
                <div className="flex items-center gap-3 p-4">
                  <LoadingSpinner />
                  <span className="text-[13px] text-gray-400">AI is reading your caption…</span>
                </div>
              )}

              {/* Results */}
              {result && (
                <>
                  {/* Score */}
                  <Card>
                    <SectionLabel>Score breakdown</SectionLabel>
                    <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-xl mb-4">
                      <div className="text-center">
                        <div className="text-4xl font-medium" style={{ color: scoreColor }}>{result.score}</div>
                        <div className="text-[10px] text-gray-400">/100</div>
                      </div>
                      <div>
                        <div className="text-[16px] font-medium text-gray-900">{result.grade}</div>
                        <div className="text-[12px] text-gray-400 mt-1">Best time to post: <strong>{result.best_post_time}</strong></div>
                      </div>
                      {/* Score bar */}
                      <div className="flex-1">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: result.score + '%', background: scoreColor }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-300 mt-1">
                          <span>0</span><span>50</span><span>100</span>
                        </div>
                      </div>
                    </div>

                    {/* Suggestions from AI */}
                    <SectionLabel>AI suggestions</SectionLabel>
                    <div className="flex flex-col gap-2 mb-4">
                      {result.suggestions.map((s: any, i: number) => (
                        <div key={i} className="flex gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-medium"
                            style={{
                              background: s.type === 'positive' ? '#EAF3DE' : '#FAECE7',
                              color: s.type === 'positive' ? '#27500A' : '#712B13',
                            }}>
                            {s.type === 'positive' ? '✓' : '↑'}
                          </div>
                          <div className="flex-1">
                            <span className="text-[11px] font-medium mr-2"
                              style={{ color: s.type === 'positive' ? '#1D9E75' : '#D85A30' }}>
                              {s.type === 'positive' ? 'Strength' : 'Improve'}
                            </span>
                            <span className="text-[12px] text-gray-700">{s.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recommended hashtags */}
                    <SectionLabel>Recommended hashtags — click to add</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {result.hashtag_recommendations.map((tag: string) => (
                        <button key={tag} onClick={() => addHashtagToCaption(tag)}
                          disabled={caption.includes(tag)}
                          className="text-[11px] px-2.5 py-1 rounded-full transition-all border"
                          style={{
                            background: caption.includes(tag) ? '#F3F4F6' : '#E6F1FB',
                            color: caption.includes(tag) ? '#9CA3AF' : '#0C447C',
                            borderColor: 'transparent',
                            cursor: caption.includes(tag) ? 'default' : 'pointer',
                          }}>
                          {tag} {caption.includes(tag) ? '✓' : '+'}
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Related topics */}
                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <SectionLabel>Related content topics</SectionLabel>
                      <select value={niche} onChange={e => setNiche(e.target.value)}
                        className="text-[11px] border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-purple-400 bg-white">
                        {Object.keys(RELATED_TOPICS).map(n => (
                          <option key={n} value={n} className="capitalize">{n}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {relatedTopics.map((topic, i) => (
                        <button key={i}
                          onClick={() => setCaption(prev => prev ? prev + '\n\n' + topic + ' — share your thoughts below! 👇' : topic + ' — share your thoughts below! 👇')}
                          className="text-left p-3 bg-gray-50 rounded-xl hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-all group">
                          <div className="text-[12px] font-medium text-gray-700 group-hover:text-purple-700">{topic}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">Click to use as caption starter</div>
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Growth tips */}
                  {tipsLoading ? (
                    <Card>
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size={14} />
                        <span className="text-[12px] text-gray-400">Loading personalised growth tips…</span>
                      </div>
                    </Card>
                  ) : tips.length > 0 && (
                    <Card>
                      <SectionLabel>Personalised growth tips</SectionLabel>
                      <div className="flex flex-col gap-2">
                        {tips.map((tip: any, i: number) => (
                          <div key={i} className="flex gap-3 items-start p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                              style={{ background: ['#534AB7','#1D9E75','#D85A30','#BA7517','#639922'][i % 5] }} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full capitalize font-medium"
                                  style={{ background: '#EEEDFE', color: '#534AB7' }}>{tip.platform}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                                  style={{
                                    background: tip.impact === 'high' ? '#EAF3DE' : '#FAEEDA',
                                    color: tip.impact === 'high' ? '#27500A' : '#633806',
                                  }}>{tip.impact} impact</span>
                              </div>
                              <p className="text-[12px] text-gray-700 leading-relaxed">{tip.tip}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              )}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">
              {/* Past posts */}
              <Card>
                <SectionLabel>Past posts — click to re-analyse</SectionLabel>
                {PAST_POSTS.map((post, i) => (
                  <div key={i} onClick={() => loadPost(post)}
                    className="flex items-center gap-2.5 py-2.5 border-b border-gray-50 last:border-0 cursor-pointer hover:opacity-70 transition-opacity">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-medium flex-shrink-0"
                      style={{ background: PLAT_COLOR[post.platform] + '20', color: PLAT_COLOR[post.platform] }}>
                      {post.platform.slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-gray-800 truncate">{post.title}</div>
                      <div className="text-[11px] text-gray-400">{post.eng} engagement</div>
                    </div>
                    <span className="text-[12px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: post.score >= 85 ? '#EAF3DE' : post.score >= 70 ? '#EEEDFE' : '#FAEEDA',
                        color: post.score >= 85 ? '#27500A' : post.score >= 70 ? '#3C3489' : '#633806',
                      }}>
                      {post.score}
                    </span>
                  </div>
                ))}
              </Card>

              {/* Trending hashtags sidebar */}
              {hashtags.length > 0 && (
                <Card>
                  <SectionLabel>Trending hashtags</SectionLabel>
                  {hashtags.slice(0, 6).map((h: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                      <button onClick={() => addHashtagToCaption(h.hashtag)}
                        className="text-[12px] font-medium text-blue-600 hover:text-blue-800 flex-1 text-left">
                        {h.hashtag}
                      </button>
                      <span className="text-[10px] text-gray-400">{h.posts}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${h.trend === 'rising' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {h.trend}
                      </span>
                    </div>
                  ))}
                </Card>
              )}

              {/* Tip of the day */}
              <Card>
                <SectionLabel>AI tip of the day</SectionLabel>
                <div className="text-[12px] text-gray-700 leading-relaxed p-3 bg-gray-50 rounded-xl border-l-2 border-purple-400">
                  At your current growth rate of +1,240 followers/week, posting 1 extra Reel on Tuesday could accelerate your path to 100K by 4–5 days.
                </div>
              </Card>

              {/* Quick caption ideas */}
              <Card>
                <SectionLabel>Quick caption starters</SectionLabel>
                <div className="flex flex-col gap-1.5">
                  {[
                    'POV: You finally tried this and it changed everything…',
                    'Nobody talks about this but it matters so much…',
                    'I wish someone told me this 2 years ago…',
                    'Stop doing this if you want to grow faster…',
                    'The one habit that 10x\'d my results in 30 days…',
                  ].map((starter, i) => (
                    <button key={i} onClick={() => setCaption(starter)}
                      className="text-left text-[11px] text-gray-600 px-3 py-2 bg-gray-50 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors">
                      {starter}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* Trending tab */
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <SectionLabel>Trending hashtags in your niche</SectionLabel>
              {hashtags.length > 0 ? hashtags.map((t: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <button onClick={() => { setActiveTab('analyser'); addHashtagToCaption(t.hashtag); }}
                    className="text-[13px] font-medium text-blue-600 hover:underline flex-1 text-left">
                    {t.hashtag}
                  </button>
                  <span className="text-[11px] text-gray-400">{t.posts} posts</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.trend === 'rising' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {t.trend}
                  </span>
                </div>
              )) : (
                <div className="text-[12px] text-gray-400 py-4 text-center">
                  Click Analyse on a caption first to load trending hashtags
                </div>
              )}
              <button onClick={async () => {
                try {
                  const res = await aiApi.trendingHashtags();
                  setHashtags(res.data);
                } catch {}
              }} className="mt-3 text-[11px] text-purple-600 hover:underline">
                Refresh hashtags ↗
              </button>
            </Card>

            <Card>
              <SectionLabel>Content format performance</SectionLabel>
              {[
                ['Reels',          '6.8%', '#534AB7', 88],
                ['TikTok videos',  '5.9%', '#D85A30', 76],
                ['YouTube Shorts', '5.1%', '#1D9E75', 66],
                ['Carousels',      '3.2%', '#BA7517', 42],
                ['Static posts',   '2.4%', '#888780', 31],
              ].map(([fmt, eng, color, pct]) => (
                <div key={fmt as string} className="flex items-center gap-3 py-2">
                  <span className="text-[12px] text-gray-600 w-36 flex-shrink-0">{fmt}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: pct + '%', background: color as string }} />
                  </div>
                  <span className="text-[12px] font-medium text-gray-700 w-10 text-right">{eng}</span>
                </div>
              ))}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl text-[12px] text-gray-600 leading-relaxed">
                Reels are outperforming carousels by <strong>2.4×</strong> in your niche. Shift 60% of output to short-form video.
              </div>

              <div className="mt-4">
                <SectionLabel>Related topics to explore</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {relatedTopics.map((topic, i) => (
                    <button key={i}
                      onClick={() => { setActiveTab('analyser'); setCaption(topic + ' — share your thoughts below! 👇'); }}
                      className="text-[11px] px-2.5 py-1.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}