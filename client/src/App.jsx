import React, { useEffect, useState } from 'react';

const DEFAULT_BAND = {
  kind: 'band',
  name: 'AITO',
  genre: 'Rock, 80s, local Bollywood covers, electronic',
  venues: 'Weddings, private parties, and clubs',
  tone: 'High energy, fun, professional'
};

const DEFAULT_BUSINESS = {
  kind: 'business',
  name: '',
  type: 'Restaurant',
  location: '',
  services: '',
  tone: 'Friendly, trustworthy',
  keyword: ''
};

const DEFAULT_TEACHER = {
  kind: 'teacher',
  name: 'Tiny Riffs Guitar',
  subject: 'Guitar',
  students: 'Young kids, beginners',
  style: 'Patient, fun, encouraging',
  location: 'Mumbai: based in Malad, teaches across Mumbai'
};

const BAND_TASKS = [
  { type: 'social', label: 'Social posts (5)' },
  { type: 'gig', label: 'Gig announcement template' },
  { type: 'pitch', label: 'Booking pitch email' },
  { type: 'blog', label: 'Blog: Booking AITO' },
  { type: 'hashtags', label: 'Hashtags (20)' },
  { type: 'socialcsv', label: 'Auto-post CSV (5)' }
];

const BUSINESS_TASKS = [
  { type: 'social', label: 'Social posts (5)' },
  { type: 'blog', label: 'SEO blog post' },
  { type: 'review', label: 'Review responses' },
  { type: 'gbp', label: 'Google Business posts' },
  { type: 'hashtags', label: 'Hashtags (20)' },
  { type: 'whatsapp', label: 'WhatsApp broadcasts (5)' },
  { type: 'socialcsv', label: 'Auto-post CSV (5)' }
];

const TEACHER_TASKS = [
  { type: 'setup', label: 'Channel setup pack' },
  { type: 'short', label: 'Shorts/Reels scripts (3)' },
  { type: 'lesson', label: 'Lesson video script' },
  { type: 'parents', label: 'Parent pitch videos (3)' },
  { type: 'songs', label: 'Original song ideas (5)' },
  { type: 'calendar', label: '2-week content calendar' },
  { type: 'hashtags', label: 'Hashtags (20)' },
  { type: 'whatsapp', label: 'WhatsApp broadcasts (5)' },
  { type: 'socialcsv', label: 'Auto-post CSV (5)' }
];

const PURPOSES = [
  { id: 'logo', label: 'Channel logo', width: 512, height: 512, prompt: 'logo design for a kids guitar channel' },
  { id: 'fbad', label: 'Facebook ad', width: 1200, height: 628, prompt: 'Facebook ad banner for a kids guitar channel' },
  { id: 'fbpost', label: 'Facebook / IG post', width: 1080, height: 1080, prompt: 'square social media post for a kids guitar channel' },
  { id: 'li', label: 'LinkedIn banner', width: 1584, height: 396, prompt: 'LinkedIn company banner for a kids guitar channel' },
  { id: 'ytthumb', label: 'YouTube thumbnail', width: 1280, height: 720, prompt: 'YouTube video thumbnail for a kids guitar lesson' },
  { id: 'ytbanner', label: 'YouTube channel banner', width: 2560, height: 1440, prompt: 'YouTube channel banner art for a kids guitar channel' },
  { id: 'whatsapp', label: 'WhatsApp / story', width: 1080, height: 1920, prompt: 'vertical story image for a kids guitar channel' }
];

const STYLES = [
  'colorful and playful for children',
  'modern minimal, clean professional',
  'bold rock and edgy',
  'warm, friendly and musical',
  'flat cartoon illustration style'
];

const PROMPT_PRESETS = [
  { id: 'custom', label: 'Custom (write your own below)', subject: '', extraText: '' },
  {
    id: 'kid-chords',
    label: 'Kid practicing chords at home',
    subject: 'a happy 8-year-old kid practicing guitar chords at home in Mumbai',
    extraText: 'Tiny Riffs Guitar'
  },
  {
    id: 'chord-chart',
    label: 'Colourful chord chart poster',
    subject: 'a colourful guitar chord chart poster for kids with a cartoon guitar',
    extraText: 'Learn Guitar · Tiny Riffs'
  },
  {
    id: 'stage',
    label: 'Kid on stage',
    subject: 'a cheerful kid performing guitar on a small school stage',
    extraText: 'Tiny Riffs Guitar · Malad, Mumbai'
  },
  {
    id: 'parent-kid',
    label: 'Parent & kid learning together',
    subject: 'a parent and young child learning guitar together at home, warm light',
    extraText: 'Tiny Riffs Guitar · Lessons across Mumbai'
  },
  {
    id: 'new-video',
    label: 'NEW VIDEO thumbnail',
    subject: 'YouTube thumbnail: excited kid holding a guitar, big smile, playful cartoon style',
    extraText: 'NEW VIDEO · Tiny Riffs'
  },
  {
    id: 'flatlay',
    label: 'Guitar flat-lay',
    subject: 'a bright flat-lay of a kid-sized acoustic guitar with music notes and crayons',
    extraText: 'Music Lessons · Malad to Bandra'
  }
];

const DEFAULT_DESIGN = {
  subject: 'Tiny Riffs Guitar',
  purpose: 'logo',
  style: STYLES[0],
  mode: 'svg',
  model: 'sana',
  preset: 'custom',
  extraText: '',
  photo: null,
  photoBrand: 'Tiny Riffs Guitar',
  photoContact: 'Malad, Mumbai · 98xxxxxx00'
};

const IMAGE_MODELS = [
  { id: 'sana', label: 'Sana (fast, default)' },
  { id: 'flux', label: 'Flux (best quality)' },
  { id: 'turbo', label: 'Turbo (fast SDXL)' }
];

const CLIENT_STATUSES = ['Lead', 'Pitched', 'Follow-up', 'Signed', 'Closed'];
const KIND_LABELS = { band: 'Band', business: 'Business', teacher: 'Teacher' };

const PROFILES_KEY = 'lce-saved-profiles';
const CLIENTS_KEY = 'lce-clients';

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function Field({ label, value, onChange, placeholder, textarea }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {textarea ? (
        <textarea
          rows="2"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.id || o} value={o.id || o}>
            {o.label || o}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function App() {
  const [kind, setKind] = useState('teacher');
  const [band, setBand] = useState(DEFAULT_BAND);
  const [business, setBusiness] = useState(DEFAULT_BUSINESS);
  const [teacher, setTeacher] = useState(DEFAULT_TEACHER);
  const [design, setDesign] = useState(DEFAULT_DESIGN);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastTask, setLastTask] = useState('');
  const [designSvg, setDesignSvg] = useState('');
  const [designIsPhoto, setDesignIsPhoto] = useState(false);

  const [savedProfiles, setSavedProfiles] = useState(() => loadJSON(PROFILES_KEY, []));
  const [selectedProfile, setSelectedProfile] = useState('');
  const [clients, setClients] = useState(() => loadJSON(CLIENTS_KEY, []));
  const [clientForm, setClientForm] = useState({ name: '', niche: '', contact: '', status: 'Lead', followUp: '', notes: '' });

  useEffect(() => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(savedProfiles));
  }, [savedProfiles]);

  useEffect(() => {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  }, [clients]);

  const profiles = { band, business, teacher };
  const setters = { band: setBand, business: setBusiness, teacher: setTeacher };
  const profile = profiles[kind];
  const setProfile = setters[kind];

  const update = (key) => (value) => setProfile((p) => ({ ...p, [key]: value }));
  const updateDesign = (key) => (value) => setDesign((p) => ({ ...p, [key]: value }));

  const generate = async (request) => {
    setLoading(true);
    setError('');
    setOutput('');
    setDesignSvg('');
    setLastTask(request.type);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, request: { ...request, today: new Date().toISOString().slice(0, 10) } })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      setOutput(data.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    alert('Copied to clipboard');
  };

  const download = () => {
    const ext = lastTask === 'socialcsv' ? '.csv' : '.md';
    const safe = `${profile.name.replace(/[^a-z0-9]/gi, '_')}_${lastTask}${ext}`;
    const type = lastTask === 'socialcsv' ? 'text/csv' : 'text/markdown';
    const blob = new Blob([output], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safe;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    window.print();
  };

  const generateImages = async () => {
    const purpose = PURPOSES.find((p) => p.id === design.purpose);
    setLoading(true);
    setError('');
    setDesignSvg('');
    setOutput('');
    setLastTask(purpose.id);
    try {
      if (design.mode === 'photo') {
        const res = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: design.subject,
            purpose: purpose.prompt,
            style: design.style,
            width: purpose.width,
            height: purpose.height,
            model: design.model,
            extraText: design.extraText || undefined
          })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Image generation failed');
        }
        const blob = await res.blob();
        setDesignIsPhoto(true);
        setDesignSvg(URL.createObjectURL(blob));
      } else {
        const res = await fetch('/api/design', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: design.subject,
            purpose: purpose.prompt,
            style: design.style,
            width: purpose.width,
            height: purpose.height
          })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Design generation failed');
        }
        setDesignIsPhoto(false);
        setDesignSvg(data.content);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSvg = () => {
    const safe = `${design.subject.replace(/[^a-z0-9]/gi, '_')}_${lastTask}${designIsPhoto ? '.jpg' : '.svg'}`;
    const url = designIsPhoto ? designSvg : URL.createObjectURL(new Blob([designSvg], { type: 'image/svg+xml' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = safe;
    a.click();
    if (!designIsPhoto) URL.revokeObjectURL(url);
  };

  const svgPreview = designSvg
    ? designIsPhoto
      ? designSvg
      : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(designSvg)}`
    : '';

  const applyPreset = (id) => {
    const preset = PROMPT_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    if (id === 'custom') {
      setDesign((p) => ({ ...p, preset: 'custom' }));
      return;
    }
    setDesign((p) => ({ ...p, preset: id, subject: preset.subject, extraText: preset.extraText }));
  };

  const onPhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDesign((p) => ({ ...p, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  const makePhotoPost = () => {
    const img = new Image();
    img.onload = () => {
      const purpose = PURPOSES.find((p) => p.id === design.purpose);
      const width = purpose.width;
      const height = purpose.height;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const scale = Math.max(width / img.width, height / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
      const barH = Math.max(90, Math.round(height * 0.16));
      ctx.fillStyle = 'rgba(0,0,0,0.62)';
      ctx.fillRect(0, height - barH, width, barH);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(barH * 0.4)}px Arial, sans-serif`;
      ctx.fillText(design.photoBrand || '', width / 2, height - barH + barH * 0.42, width * 0.9);
      ctx.fillStyle = '#ffe08a';
      ctx.font = `${Math.round(barH * 0.2)}px Arial, sans-serif`;
      ctx.fillText(design.photoContact || '', width / 2, height - barH + barH * 0.74, width * 0.9);
      const url = canvas.toDataURL('image/jpeg', 0.92);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${design.subject.replace(/[^a-z0-9]/gi, '_') || 'post'}_${purpose.id}.jpg`;
      a.click();
    };
    img.src = design.photo;
  };

  const saveProfile = () => {
    if (!profile.name) {
      alert('Give this profile a name first.');
      return;
    }
    setSavedProfiles((prev) => {
      const existing = prev.find((p) => p.kind === profile.kind && p.profile.name === profile.name);
      if (existing) {
        return prev.map((p) => (p.id === existing.id ? { ...p, profile: { ...profile } } : p));
      }
      return [...prev, { id: `${Date.now()}`, kind: profile.kind, profile: { ...profile } }];
    });
    alert(`Saved "${profile.name}"`);
  };

  const handleLoadProfile = (id) => {
    const found = savedProfiles.find((p) => p.id === id);
    if (!found) return;
    setters[found.kind](found.profile);
    setKind(found.kind);
    setSelectedProfile(id);
  };

  const deleteProfile = () => {
    if (!selectedProfile) return;
    setSavedProfiles((prev) => prev.filter((p) => p.id !== selectedProfile));
    setSelectedProfile('');
  };

  const addClient = () => {
    if (!clientForm.name) return;
    setClients((prev) => [
      ...prev,
      { id: `${Date.now()}`, ...clientForm, name: clientForm.name.trim() }
    ]);
    setClientForm({ name: '', niche: '', contact: '', status: 'Lead', followUp: '', notes: '' });
  };

  const setClientStatus = (id, status) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const deleteClient = (id) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const tasks = { band: BAND_TASKS, business: BUSINESS_TASKS, teacher: TEACHER_TASKS }[kind];

  const tabList = [
    ['band', 'Band / Musician'],
    ['business', 'Local business'],
    ['teacher', 'Music teacher'],
    ['images', 'Design studio'],
    ['clients', 'Clients']
  ];

  return (
    <div className="app">
      <header className="header print-hide">
        <h1>Local Content Engine</h1>
        <p>
          Generate client-ready marketing content for local businesses and bands.
          Sell it as a monthly content service.
        </p>
      </header>

      <div className="print-brand">
        <div className="print-brand-name">Local Content Engine</div>
        <div className="print-brand-client">{profile.name}</div>
      </div>

      <div className="layout">
        <section className="card form-card print-hide">
          <div className="tabs">
            {tabList.map(([key, label]) => (
              <button
                key={key}
                className={kind === key ? 'tab active' : 'tab'}
                onClick={() => setKind(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {['band', 'business', 'teacher'].includes(kind) && (
            <div className="saved-row">
              <select
                className="saved-select"
                value={selectedProfile}
                onChange={(e) => handleLoadProfile(e.target.value)}
              >
                <option value="">— Load saved profile —</option>
                {savedProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.profile.name} ({KIND_LABELS[p.kind]})
                  </option>
                ))}
              </select>
              <button className="ghost-btn" onClick={saveProfile}>Save profile</button>
              <button className="ghost-btn danger" onClick={deleteProfile} disabled={!selectedProfile}>Delete</button>
            </div>
          )}

          {kind === 'band' && (
            <>
              <Field label="Band name" value={band.name} onChange={update('name')} />
              <Field label="Genre / style" value={band.genre} onChange={update('genre')} textarea />
              <Field label="Where they play" value={band.venues} onChange={update('venues')} textarea />
              <Field label="Tone" value={band.tone} onChange={update('tone')} />
            </>
          )}

          {kind === 'business' && (
            <>
              <Field label="Business name" value={business.name} onChange={update('name')} placeholder="e.g. Bella's Diner" />
              <Field label="Business type" value={business.type} onChange={update('type')} placeholder="e.g. Restaurant" />
              <Field label="Location" value={business.location} onChange={update('location')} placeholder="e.g. Mumbai" />
              <Field label="Services / products" value={business.services} onChange={update('services')} textarea />
              <Field label="Tone" value={business.tone} onChange={update('tone')} />
              <Field label="Target keyword" value={business.keyword} onChange={update('keyword')} placeholder="e.g. best pizza near me" />
            </>
          )}

          {kind === 'teacher' && (
            <>
              <Field label="Channel name" value={teacher.name} onChange={update('name')} />
              <Field label="What they teach" value={teacher.subject} onChange={update('subject')} placeholder="e.g. Guitar" />
              <Field label="Who they teach" value={teacher.students} onChange={update('students')} placeholder="e.g. Young kids, beginners" />
              <Field label="Teaching style / tone" value={teacher.style} onChange={update('style')} />
              <Field label="Location / service area" value={teacher.location} onChange={update('location')} placeholder="e.g. Mumbai: Malad to Bandra" />
            </>
          )}

          {kind === 'images' && (
            <>
              <Field
                label="Brand / subject"
                value={design.subject}
                onChange={updateDesign('subject')}
                placeholder="e.g. Tiny Riffs Guitar"
              />
              <Select
                label="Output type"
                value={design.mode}
                onChange={(v) => updateDesign('mode')(v)}
                options={[
                  { id: 'photo', label: 'Photo (AI image — posts & thumbnails)' },
                  { id: 'svg', label: 'Vector (SVG — crisp logo & banners)' }
                ]}
              />
              <Select
                label="Purpose"
                value={design.purpose}
                onChange={(v) => updateDesign('purpose')(v)}
                options={PURPOSES}
              />
              <Select
                label="Style"
                value={design.style}
                onChange={(v) => updateDesign('style')(v)}
                options={STYLES}
              />
              {design.mode === 'photo' && (
                <>
                  <Select
                    label="Ready-made prompt"
                    value={design.preset}
                    onChange={(v) => applyPreset(v)}
                    options={PROMPT_PRESETS}
                  />
                  <Select
                    label="AI model"
                    value={design.model}
                    onChange={(v) => updateDesign('model')(v)}
                    options={IMAGE_MODELS}
                  />
                  <Field
                    label="Text to put on the image (name, phone, address…)"
                    value={design.extraText}
                    onChange={updateDesign('extraText')}
                    placeholder="e.g. Tiny Riffs Guitar · Malad, Mumbai · 98xxxxxx00"
                  />
                </>
              )}
              <div className="task-grid">
                <button className="task-btn" disabled={loading} onClick={generateImages}>
                  {loading ? 'Generating…' : 'Generate image'}
                </button>
              </div>
              <p className="hint">
                {design.mode === 'photo'
                  ? 'Real AI images (free, no key needed) at exact platform sizes. Text on image works best for posters & thumbnails.'
                  : 'Free vector designs generated by the AI model (uses your Groq key). Crisp logos & banners at the exact size each platform needs.'}
              </p>

              <hr className="divider" />
              <p className="section-title">Use your own photo</p>
              <Field label="Brand name to stamp on it" value={design.photoBrand} onChange={updateDesign('photoBrand')} placeholder="e.g. Tiny Riffs Guitar" />
              <Field label="Contact / extra line" value={design.photoContact} onChange={updateDesign('photoContact')} placeholder="e.g. Malad, Mumbai · 98xxxxxx00" />
              <input
                type="file"
                accept="image/*"
                className="file-input"
                onChange={onPhotoUpload}
              />
              {design.photo && (
                <>
                  <img src={design.photo} alt="your photo preview" className="photo-preview" />
                  <div className="task-grid">
                    <button className="task-btn" onClick={makePhotoPost} disabled={!design.photoBrand}>
                      Make post &amp; download .jpg
                    </button>
                  </div>
                  <p className="hint">
                    Your photo is placed at the chosen purpose size with your brand
                    name + contact in a bar at the bottom. Done in your browser, free.
                  </p>
                </>
              )}
            </>
          )}

          {kind === 'clients' && (
            <>
              <Field label="Client / business name" value={clientForm.name} onChange={(v) => setClientForm((f) => ({ ...f, name: v }))} placeholder="e.g. Raj's Dhaba" />
              <Field label="Niche" value={clientForm.niche} onChange={(v) => setClientForm((f) => ({ ...f, niche: v }))} placeholder="e.g. Restaurant / Band / Teacher" />
              <Field label="Contact (phone / email)" value={clientForm.contact} onChange={(v) => setClientForm((f) => ({ ...f, contact: v }))} placeholder="e.g. 98xxxxxx00" />
              <Select
                label="Status"
                value={clientForm.status}
                onChange={(v) => setClientForm((f) => ({ ...f, status: v }))}
                options={CLIENT_STATUSES}
              />
              <Field label="Next follow-up date" value={clientForm.followUp} onChange={(v) => setClientForm((f) => ({ ...f, followUp: v }))} placeholder="YYYY-MM-DD" />
              <Field label="Notes" value={clientForm.notes} onChange={(v) => setClientForm((f) => ({ ...f, notes: v }))} textarea placeholder="e.g. Liked the free sample, asked for pricing" />
              <button className="task-btn" onClick={addClient} disabled={!clientForm.name}>
                Add client
              </button>
            </>
          )}

          {kind !== 'images' && kind !== 'clients' && (
            <div className="task-grid">
              {tasks.map((t) => (
                <button
                  key={t.type}
                  className="task-btn"
                  disabled={loading}
                  onClick={() => generate({ ...t, count: 5 })}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="card output-card">
          {kind === 'clients' ? (
            <>
              <div className="output-head">
                <span className="output-title">Client tracker</span>
              </div>
              {clients.length === 0 && (
                <div className="empty">
                  <p>No clients yet. Add your first lead on the left.</p>
                  <p className="hint">
                    Track everyone you pitch. Follow-ups are where deals close — check
                    this list daily.
                  </p>
                </div>
              )}
              <div className="client-list">
                {clients.map((c) => (
                  <div key={c.id} className="client-item">
                    <div className="client-top">
                      <strong>{c.name}</strong>
                      <select
                        className="status-select"
                        value={c.status}
                        onChange={(e) => setClientStatus(c.id, e.target.value)}
                      >
                        {CLIENT_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="client-meta">
                      {c.niche && <span>{c.niche}</span>}
                      {c.contact && <span>{c.contact}</span>}
                      {c.followUp && <span className={isOverdue(c.followUp) ? 'overdue' : ''}>Follow-up: {c.followUp}</span>}
                    </div>
                    {c.notes && <div className="client-notes">{c.notes}</div>}
                    <button className="ghost-btn danger small" onClick={() => deleteClient(c.id)}>Remove</button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="output-head">
                <span className="output-title">
                  {kind === 'images'
                    ? designSvg
                      ? `${design.subject} — ${lastTask}`
                      : 'Design output'
                    : output
                      ? `${profile.name} — ${lastTask}`
                      : 'Output'}
                </span>
                {output && (
                  <div className="output-actions">
                    <button onClick={copy}>Copy</button>
                    <button onClick={download}>Download {lastTask === 'socialcsv' ? '.csv' : '.md'}</button>
                    <button onClick={downloadPdf}>Download PDF</button>
                  </div>
                )}
                {designSvg && (
                  <div className="output-actions">
                    <button onClick={downloadSvg}>Download {designIsPhoto ? '.jpg' : '.svg'}</button>
                  </div>
                )}
              </div>

              {error && <div className="error">{error}</div>}

              {loading && <div className="loading">Generating&hellip; this can take 15-30s.</div>}

              {!loading && kind === 'images' && !designSvg && !error && (
                <div className="empty">
                  <p>Choose an output type and purpose, then click <strong>Generate</strong>.</p>
                  <p className="hint">
                    Photo mode makes real posts &amp; thumbnails (free). Vector mode makes crisp
                    logos &amp; banners at the exact size each platform needs.
                  </p>
                </div>
              )}

              {!loading && kind !== 'images' && !output && !error && (
                <div className="empty">
                  <p>Pick a task to generate content for <strong>{profile.name || 'your client'}</strong>.</p>
                  <p className="hint">
                    Band mode: use the gig + booking pitch to land AITO shows.
                    Teacher mode: Shorts bring kids in, lessons turn them into paying students.
                  </p>
                </div>
              )}

              {designSvg && (
                <div className="image-grid">
                  <div className="image-item">
                    <img src={svgPreview} alt={design.subject} />
                  </div>
                </div>
              )}

              {output && <pre className="output print-content">{output}</pre>}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  return d < new Date();
}
