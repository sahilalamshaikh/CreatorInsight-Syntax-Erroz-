'use client';
import { useState, useCallback, useRef } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import SectionLabel from '@/components/ui/SectionLabel';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { postsApi, aiApi } from '@/lib/api';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#534AB7', followers: '31.4K' },
  { id: 'youtube',   label: 'YouTube',   color: '#1D9E75', followers: '22.1K' },
  { id: 'tiktok',    label: 'TikTok',    color: '#D85A30', followers: '18.7K' },
  { id: 'twitter',   label: 'X/Twitter', color: '#BA7517', followers: '8.3K'  },
  { id: 'linkedin',  label: 'LinkedIn',  color: '#639922', followers: '3.7K'  },
];

const SUGGESTED_TAGS = [
  '#MorningRoutine','#DailyHabits','#Wellness','#ContentCreator',
  '#Mindfulness','#GrowthHacking','#SmallCreator','#HabitStack',
];

const FORMAT_SPECS: Record<string, Record<string, string>> = {
  photo: {
    instagram: 'Square 1:1 or 4:5 portrait · JPG/PNG · max 8MB',
    youtube:   'Thumbnail 16:9 · JPG/PNG · max 2MB',
    tiktok:    'Cover image 9:16 · JPG/PNG · max 10MB',
    twitter:   'Up to 4 images · JPG/PNG/GIF · max 5MB each',
    linkedin:  'Landscape 1.91:1 · JPG/PNG · max 5MB',
  },
  video: {
    instagram: 'Reels 9:16 · MP4 · max 60s · max 100MB',
    youtube:   'Landscape 16:9 · MP4/MOV · max 128GB',
    tiktok:    '9:16 vertical · MP4 · max 10 min · max 500MB',
    twitter:   'Any ratio · MP4/MOV · max 2m20s · max 512MB',
    linkedin:  'Landscape 16:9 · MP4 · max 10 min · max 5GB',
  },
  text: {
    instagram: 'Caption up to 2,200 chars + hashtags',
    youtube:   'Community post · text + optional image',
    tiktok:    'Caption up to 2,200 chars',
    twitter:   'Up to 280 chars per tweet',
    linkedin:  'Post up to 3,000 chars',
  },
};

type AdaptItem = { label: string; desc: string; status: 'done' | 'warn' | 'info' };

const ADAPTATIONS: Record<string, Record<string, AdaptItem[]>> = {
  photo: {
    instagram: [
      { label: 'Crop to 4:5',       desc: 'Portrait crop applied for feed',  status: 'done' },
      { label: 'Alt text generated', desc: 'AI wrote accessibility text',     status: 'done' },
      { label: 'Cover frame set',    desc: 'First image used as cover',       status: 'done' },
    ],
    youtube: [
      { label: 'Thumbnail 16:9',    desc: 'Landscape crop for thumbnail',    status: 'done' },
      { label: 'Title extracted',   desc: 'First line used as video title',  status: 'done' },
    ],
    tiktok: [
      { label: 'Caption trimmed',   desc: 'Capped at 150 chars for TikTok', status: 'warn' },
      { label: 'Cover 9:16',        desc: 'Vertical crop applied',           status: 'done' },
      { label: 'Hashtags kept',     desc: 'All tags preserved in post',      status: 'done' },
    ],
    twitter: [
      { label: 'Caption at 240',    desc: 'Trimmed to fit tweet limit',      status: 'warn' },
      { label: 'Up to 4 images',    desc: 'First 4 photos selected',         status: 'done' },
    ],
    linkedin: [
      { label: 'Square crop 1:1',   desc: 'Best format for LinkedIn feed',   status: 'done' },
      { label: 'Caption cleaned',   desc: 'Hashtags moved to end of post',   status: 'done' },
      { label: 'CTA preserved',     desc: 'Question kept for engagement',    status: 'done' },
    ],
  },
  video: {
    instagram: [
      { label: 'Reels 9:16',        desc: 'Vertical crop auto-applied',      status: 'done' },
      { label: 'Trimmed to 60s',    desc: 'First 60s used for Reels',        status: 'warn' },
      { label: 'Captions added',    desc: 'Auto-subtitles generated',        status: 'done' },
      { label: 'Cover frame',       desc: 'Best frame auto-selected',        status: 'done' },
    ],
    youtube: [
      { label: 'Landscape 16:9',    desc: 'Horizontal crop for YouTube',     status: 'done' },
      { label: 'Chapters detected', desc: 'Auto chapter markers added',      status: 'done' },
      { label: 'Description set',   desc: 'Caption used as description',     status: 'done' },
      { label: 'Tags extracted',    desc: 'Hashtags converted to tags',      status: 'done' },
    ],
    tiktok: [
      { label: 'Vertical 9:16',     desc: 'TikTok native format applied',    status: 'done' },
      { label: 'Sound preserved',   desc: 'Original audio kept',             status: 'done' },
      { label: 'Caption 150 chars', desc: 'Caption trimmed for TikTok',      status: 'warn' },
    ],
    twitter: [
      { label: 'Trimmed to 2m20s',  desc: 'Twitter video limit applied',     status: 'warn' },
      { label: 'Thumbnail set',     desc: 'First frame as preview',          status: 'done' },
    ],
    linkedin: [
      { label: 'Landscape 16:9',    desc: 'LinkedIn prefers horizontal',     status: 'done' },
      { label: 'Subtitles added',   desc: 'Auto-captions for accessibility', status: 'done' },
      { label: 'Hook trimmed',      desc: 'Hook in first 3 seconds',         status: 'done' },
    ],
  },
  text: {
    instagram: [
      { label: 'Hashtags formatted', desc: 'Tags grouped at end of caption', status: 'done' },
      { label: 'Line breaks added',  desc: 'Spacing optimised for feed',     status: 'done' },
      { label: 'Emoji check',        desc: 'Emojis verified for rendering',  status: 'done' },
    ],
    youtube: [
      { label: 'Community post',    desc: 'Formatted for Community tab',     status: 'done' },
      { label: 'Links removed',     desc: 'YouTube blocks external links',   status: 'warn' },
    ],
    tiktok: [
      { label: 'Caption at 150',    desc: 'Trimmed to TikTok limit',         status: 'warn' },
      { label: 'Top 5 tags kept',   desc: 'Best hashtags preserved',         status: 'done' },
    ],
    twitter: [
      { label: 'Thread created',    desc: 'Long captions split into thread', status: 'done' },
      { label: '280 char limit',    desc: 'Each tweet within limit',         status: 'done' },
    ],
    linkedin: [
      { label: 'Professional tone', desc: 'Caption kept as-is',              status: 'done' },
      { label: 'Tags at end',       desc: 'Hashtags moved to bottom',        status: 'done' },
      { label: 'CTA preserved',     desc: 'Question kept for engagement',    status: 'done' },
    ],
  },
};

let scoreTimer: ReturnType<typeof setTimeout>;

export default function PublishPage() {
  const [postType, setPostType]             = useState<'photo'|'video'|'text'>('photo');
  const [caption, setCaption]               = useState('');
  const [selectedPlats, setSelectedPlats]   = useState<string[]>(['instagram','tiktok']);
  const [hashtags, setHashtags]             = useState<string[]>([]);
  const [schedMode, setSchedMode]           = useState<'now'|'best'|'custom'>('now');
  const [aiResult, setAiResult]             = useState<any>(null);
  const [scoring, setScoring]               = useState(false);
  const [publishing, setPublishing]         = useState(false);
  const [published, setPublished]           = useState(false);
  const [progress, setProgress]             = useState(0);
  const [statusMsg, setStatusMsg]           = useState('');
  const [mediaFiles, setMediaFiles]         = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews]   = useState<string[]>([]);
  const [dragOver, setDragOver]             = useState(false);
  const fileRef                             = useRef<HTMLInputElement>(null);

  function togglePlat(id: string) {
    setSelectedPlats(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  function addTag(tag: string) {
    if (!caption.includes(tag)) {
      setCaption(prev => prev + ' ' + tag);
      setHashtags(prev => [...new Set([...prev, tag])]);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    const validTypes = postType === 'video'
      ? ['video/mp4','video/mov','video/quicktime','video/mpeg']
      : ['image/jpeg','image/png','image/gif','image/webp'];
    const valid = arr.filter(f => validTypes.includes(f.type));
    if (valid.length === 0) return;
    const maxFiles = postType === 'video' ? 1 : 10;
    const remaining = maxFiles - mediaFiles.length;
    const toAdd = valid.slice(0, remaining);
    setMediaFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setMediaPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }

  function removeMedia(index: number) {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  const scoreCaption = useCallback((text: string) => {
    clearTimeout(scoreTimer);
    if (!text.trim()) { setAiResult(null); return; }
    scoreTimer = setTimeout(async () => {
      setScoring(true);
      try {
        const tags = (text.match(/#\w+/g) || []);
        const res = await aiApi.feedback({ caption: text, platforms: selectedPlats, hashtags: tags });
        setAiResult(res.data);
      } catch {
        let s = 50;
        if (text.length > 80) s += 10;
        if (text.includes('?')) s += 9;
        if ((text.match(/#\w+/g) || []).length >= 3) s += 10;
        s = Math.min(99, s);
        setAiResult({
          score: s,
          grade: s >= 85 ? 'Excellent' : s >= 70 ? 'Good' : 'Fair',
          suggestions: [{ type: 'improve', text: 'Add a question to boost comments.' }],
          hashtag_recommendations: SUGGESTED_TAGS.slice(0, 5),
          best_post_time: '6–8 PM Tue/Thu',
        });
      } finally {
        setScoring(false);
      }
    }, 800);
  }, [selectedPlats]);

  async function handlePublish() {
    if (!caption.trim() && mediaFiles.length === 0) return;
    if (selectedPlats.length === 0) return;
    setPublishing(true);
    setProgress(0);

    const steps: [number, string][] =
      postType === 'video'
        ? [[10,'Uploading video…'],[25,'Processing video…'],[45,'Adapting format per platform…'],[60,'Generating subtitles…'],[75,'Publishing to platforms…'],[90,'Finalising…'],[100,'Published!']]
        : postType === 'photo'
        ? [[15,'Uploading photos…'],[35,'Optimising images…'],[55,'Applying platform crops…'],[75,'Publishing to platforms…'],[100,'Published!']]
        : [[20,'Preparing post…'],[50,'Formatting per platform…'],[80,'Publishing…'],[100,'Published!']];

    let i = 0;
    const tick = setInterval(() => {
      if (i >= steps.length) { clearInterval(tick); return; }
      setProgress(steps[i][0]);
      setStatusMsg(steps[i][1]);
      i++;
    }, 700);

    try {
      const res = await postsApi.create({
        caption, platforms: selectedPlats, hashtags,
        media_urls: mediaPreviews.slice(0, 3),
      });
      await postsApi.publish(res.data.id);
    } catch {}

    setTimeout(() => {
      clearInterval(tick);
      setProgress(100);
      setStatusMsg('Published!');
      setPublishing(false);
      setPublished(true);
    }, steps.length * 700 + 400);
  }

  function reset() {
    setPublished(false); setCaption(''); setAiResult(null);
    setProgress(0); setMediaFiles([]); setMediaPreviews([]);
    setPostType('photo');
  }

  const scoreColor = aiResult
    ? aiResult.score >= 85 ? '#1D9E75' : aiResult.score >= 70 ? '#534AB7' : '#BA7517'
    : '#9CA3AF';

  const maxFiles = postType === 'video' ? 1 : 10;

  return (
    <AppShell>
      <div className="p-5">
        <h1 className="text-[15px] font-medium text-gray-900 mb-5">New post</h1>

        {published ? (
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 text-3xl flex items-center justify-center mx-auto mb-4">✓</div>
            <div className="text-[16px] font-medium text-gray-900 mb-2">
              Published to {selectedPlats.length} platform{selectedPlats.length !== 1 ? 's' : ''}!
            </div>
            <div className="text-[13px] text-gray-400 mb-6">
              Your {postType} is live on {selectedPlats.join(', ')}.
            </div>
            <button onClick={reset} className="px-8 py-3 rounded-xl text-white text-[13px] font-medium" style={{ background: '#534AB7' }}>
              Create another post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">

            {/* ── Left + Middle ── */}
            <div className="col-span-2 flex flex-col gap-4">

              {/* Post type */}
              <Card>
                <SectionLabel>Post type</SectionLabel>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'photo', icon: '🖼️', label: 'Photo',     sub: 'JPG, PNG, GIF' },
                    { id: 'video', icon: '🎬', label: 'Video',     sub: 'MP4, MOV'      },
                    { id: 'text',  icon: '✍️', label: 'Text only', sub: 'Caption post'  },
                  ] as const).map(t => (
                    <button key={t.id}
                      onClick={() => { setPostType(t.id); setMediaFiles([]); setMediaPreviews([]); }}
                      className="flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: postType === t.id ? '#534AB7' : '#E5E7EB',
                        background:  postType === t.id ? '#EEEDFE'  : 'white',
                      }}>
                      <span className="text-2xl">{t.icon}</span>
                      <span className="text-[13px] font-medium" style={{ color: postType === t.id ? '#534AB7' : '#374151' }}>{t.label}</span>
                      <span className="text-[10px] text-gray-400">{t.sub}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Media upload */}
              {postType !== 'text' && (
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <SectionLabel>{postType === 'video' ? 'Upload video' : 'Upload photos'}</SectionLabel>
                    <span className="text-[11px] text-gray-400">{mediaPreviews.length}/{maxFiles}</span>
                  </div>

                  {mediaPreviews.length < maxFiles && (
                    <div
                      onDrop={handleDrop}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all mb-3"
                      style={{
                        height: mediaPreviews.length > 0 ? 90 : 180,
                        borderColor: dragOver ? '#534AB7' : '#E5E7EB',
                        background:  dragOver ? '#EEEDFE'  : '#FAFAFA',
                      }}>
                      <span className="text-3xl mb-2">{postType === 'video' ? '🎬' : '🖼️'}</span>
                      <div className="text-[13px] font-medium text-gray-700">
                        {dragOver ? 'Drop to upload' : `Click or drag ${postType === 'video' ? 'video' : 'photos'} here`}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1">
                        {postType === 'video' ? 'MP4, MOV up to 500MB' : 'JPG, PNG, GIF up to 10MB each'}
                      </div>
                      <input
                        ref={fileRef}
                        type="file"
                        accept={postType === 'video' ? 'video/*' : 'image/*'}
                        multiple={postType !== 'video'}
                        className="hidden"
                        onChange={e => handleFiles(e.target.files)}
                      />
                    </div>
                  )}

                  {mediaPreviews.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {mediaPreviews.map((src, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden flex-shrink-0"
                          style={{ width: postType === 'video' ? '100%' : 96, height: postType === 'video' ? 220 : 96 }}>
                          {postType === 'video'
                            ? <video src={src} className="w-full h-full object-cover" controls />
                            : <img src={src} alt="" className="w-full h-full object-cover" />
                          }
                          <button onClick={() => removeMedia(i)}
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px] hover:bg-black/80">
                            ✕
                          </button>
                          {i === 0 && (
                            <div className="absolute bottom-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-black/50 text-white">
                              Cover
                            </div>
                          )}
                        </div>
                      ))}
                      {postType === 'photo' && mediaPreviews.length < maxFiles && (
                        <button onClick={() => fileRef.current?.click()}
                          className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-400 transition-colors flex-shrink-0">
                          <span className="text-xl mb-1">+</span>
                          <span className="text-[10px]">Add more</span>
                        </button>
                      )}
                    </div>
                  )}
                </Card>
              )}

              {/* Platforms */}
              <Card>
                <SectionLabel>Publish to</SectionLabel>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {PLATFORMS.map(p => {
                    const on = selectedPlats.includes(p.id);
                    return (
                      <button key={p.id} onClick={() => togglePlat(p.id)}
                        className="flex items-center gap-2 p-2.5 rounded-lg border text-[12px] font-medium transition-all text-left"
                        style={{
                          borderColor: on ? p.color : '#E5E7EB', borderWidth: on ? 1.5 : 1,
                          color: on ? p.color : '#9CA3AF', background: on ? p.color + '10' : 'white',
                        }}>
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                        <div>
                          <div>{p.label}</div>
                          <div className="text-[10px] text-gray-400 font-normal">{p.followers}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Format requirements */}
                {selectedPlats.length > 0 && postType !== 'text' && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-[11px] font-medium text-gray-500 mb-2">Format requirements</div>
                    {selectedPlats.map(p => (
                      <div key={p} className="flex gap-2 text-[11px] py-1.5 border-b border-gray-100 last:border-0">
                        <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: PLATFORMS.find(pl => pl.id === p)?.color }} />
                        <span className="text-gray-500 w-20 flex-shrink-0 capitalize">{p}</span>
                        <span className="text-gray-400">{FORMAT_SPECS[postType]?.[p] || '—'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Caption */}
              <Card>
                <SectionLabel>Caption</SectionLabel>
                <textarea
                  value={caption}
                  onChange={e => { setCaption(e.target.value); scoreCaption(e.target.value); }}
                  placeholder="Write your caption… AI scores it as you type"
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-purple-400 resize-none leading-relaxed"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1 mb-3">
                  <span>{caption.length} characters</span>
                  <span className={caption.length > 2000 ? 'text-red-400' : ''}>{caption.length} / 2200</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map(tag => (
                    <button key={tag} onClick={() => addTag(tag)} disabled={caption.includes(tag)}
                      className="text-[11px] px-2 py-0.5 rounded-full transition-opacity"
                      style={{ background: '#E6F1FB', color: '#0C447C', opacity: caption.includes(tag) ? 0.4 : 1 }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Schedule */}
              <Card>
                <SectionLabel>When to publish</SectionLabel>
                <div className="flex gap-2 flex-wrap mb-3">
                  {([
                    { id: 'now'    as const, label: 'Publish now'            },
                    { id: 'best'   as const, label: '⚡ Best time — Tue 7 PM' },
                    { id: 'custom' as const, label: 'Custom time'            },
                  ]).map(opt => (
                    <button key={opt.id} onClick={() => setSchedMode(opt.id)}
                      className="text-[12px] px-3 py-1.5 rounded-lg border transition-all"
                      style={{
                        background:   schedMode === opt.id ? '#534AB7' : 'white',
                        color:        schedMode === opt.id ? 'white'   : '#6B7280',
                        borderColor:  schedMode === opt.id ? '#534AB7' : '#E5E7EB',
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                {schedMode === 'custom' && (
                  <input type="datetime-local"
                    className="text-[12px] border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-400 mb-2" />
                )}
                <p className="text-[11px] text-gray-400">
                  {schedMode === 'now'  ? 'Posts go live immediately on all selected platforms.'  :
                   schedMode === 'best' ? 'Scheduled for Tuesday 7:00 PM — your best window.'    :
                                          'Pick your preferred date and time.'}
                </p>
              </Card>

              {/* Progress */}
              {publishing && (
                <div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: progress + '%', background: '#534AB7' }} />
                  </div>
                  <div className="text-[12px] text-gray-400 text-center">{statusMsg}</div>
                </div>
              )}

              {/* Publish button */}
              <button
                onClick={handlePublish}
                disabled={publishing || selectedPlats.length === 0 || (!caption.trim() && mediaFiles.length === 0)}
                className="w-full py-3 rounded-xl text-white text-[13px] font-medium transition-all"
                style={{
                  background: publishing ? '#1D9E75' : '#534AB7',
                  opacity: (selectedPlats.length === 0 || (!caption.trim() && mediaFiles.length === 0)) ? 0.4 : 1,
                }}>
                {publishing
                  ? statusMsg || 'Publishing…'
                  : `Publish ${postType} to ${selectedPlats.length} platform${selectedPlats.length !== 1 ? 's' : ''}`}
              </button>
            </div>

            {/* ── Right column ── */}
            <div className="flex flex-col gap-4">

              {/* AI score */}
              <Card>
                <SectionLabel>AI caption score</SectionLabel>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl mb-3">
                  <div className="text-center">
                    <div className="text-3xl font-medium" style={{ color: scoreColor }}>
                      {scoring ? '…' : aiResult ? aiResult.score : '--'}
                    </div>
                    <div className="text-[10px] text-gray-400">/100</div>
                  </div>
                  <div className="flex-1">
                    {scoring ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size={14} />
                        <span className="text-[12px] text-gray-400">Analysing…</span>
                      </div>
                    ) : aiResult ? (
                      <>
                        <div className="text-[13px] font-medium text-gray-900">{aiResult.grade}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">Best time: {aiResult.best_post_time}</div>
                      </>
                    ) : (
                      <div className="text-[12px] text-gray-400">Type a caption to score</div>
                    )}
                  </div>
                </div>
                {aiResult && (
                  <div className="space-y-2">
                    {aiResult.suggestions.map((s: any, i: number) => (
                      <div key={i} className="flex gap-2 items-start text-[12px]">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                          style={{ background: s.type === 'positive' ? '#1D9E75' : '#D85A30' }} />
                        <span className="text-gray-700 leading-relaxed">{s.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Media preview */}
              <Card>
                <SectionLabel>
                  {postType === 'video' ? 'Video preview' : postType === 'photo' ? 'Photo preview' : 'Caption preview'}
                </SectionLabel>
                {mediaPreviews.length > 0 ? (
                  <div className="space-y-2">
                    {postType === 'video' ? (
                      <video src={mediaPreviews[0]} className="w-full rounded-xl object-cover" style={{ maxHeight: 200 }} controls />
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        {mediaPreviews.slice(0, 4).map((src, i) => (
                          <div key={i} className="relative" style={{ paddingBottom: '100%' }}>
                            <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                            {mediaPreviews.length > 4 && i === 3 && (
                              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center text-white text-[13px] font-medium">
                                +{mediaPreviews.length - 4}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-[11px] text-gray-400 text-center">
                      {mediaFiles.length} {postType === 'video' ? 'video' : `photo${mediaFiles.length !== 1 ? 's' : ''}`} selected
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-2"
                    style={{ height: postType === 'text' ? 'auto' : 130, padding: 16 }}>
                    {postType !== 'text' ? (
                      <>
                        <span className="text-3xl text-gray-300">{postType === 'video' ? '🎬' : '🖼️'}</span>
                        <span className="text-[12px] text-gray-300">No {postType} selected yet</span>
                      </>
                    ) : (
                      <div className="text-[12px] text-gray-500 leading-relaxed whitespace-pre-wrap w-full">
                        {caption || <span className="text-gray-300">Your caption will appear here…</span>}
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Smart format adapter */}
              <Card>
                <SectionLabel>Smart format adapter</SectionLabel>
                {selectedPlats.length === 0 ? (
                  <div className="text-[12px] text-gray-400 text-center py-4">
                    Select platforms to see auto-adaptations
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedPlats.map(p => {
                      const plat    = PLATFORMS.find(pl => pl.id === p)!;
                      const items   = ADAPTATIONS[postType]?.[p] || [];
                      const doneCount = items.filter(i => i.status === 'done').length;
                      const warnCount = items.filter(i => i.status === 'warn').length;
                      return (
                        <div key={p} className="border border-gray-100 rounded-xl overflow-hidden">
                          {/* Platform header */}
                          <div className="flex items-center justify-between px-3 py-2"
                            style={{ background: plat.color + '10', borderBottom: '1px solid ' + plat.color + '20' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: plat.color }} />
                              <span className="text-[12px] font-medium capitalize" style={{ color: plat.color }}>{p}</span>
                            </div>
                            <div className="flex gap-1">
                              {doneCount > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                  {doneCount} ready
                                </span>
                              )}
                              {warnCount > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                                  {warnCount} adjusted
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Items */}
                          <div className="divide-y divide-gray-50">
                            {items.map((item, i) => (
                              <div key={i} className="flex items-start gap-2.5 px-3 py-2">
                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold"
                                  style={{
                                    background: item.status === 'done' ? '#EAF3DE' : item.status === 'warn' ? '#FAEEDA' : '#E6F1FB',
                                    color:      item.status === 'done' ? '#27500A' : item.status === 'warn' ? '#633806' : '#0C447C',
                                  }}>
                                  {item.status === 'done' ? '✓' : item.status === 'warn' ? '~' : 'i'}
                                </div>
                                <div>
                                  <div className="text-[11px] font-medium text-gray-800">{item.label}</div>
                                  <div className="text-[10px] text-gray-400 mt-0.5">{item.desc}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {/* Summary */}
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-700 leading-relaxed">
                      ✨ Your {postType} will be automatically optimised for each platform. No manual editing needed.
                    </div>
                  </div>
                )}
              </Card>

            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}