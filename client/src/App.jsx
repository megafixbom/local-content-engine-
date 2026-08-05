import React, { useState } from 'react';

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
  { type: 'blog', label: 'Blog: Booking AITO' }
];

const BUSINESS_TASKS = [
  { type: 'social', label: 'Social posts (5)' },
  { type: 'blog', label: 'SEO blog post' },
  { type: 'review', label: 'Review responses' },
  { type: 'gbp', label: 'Google Business posts' }
];

const TEACHER_TASKS = [
  { type: 'setup', label: 'Channel setup pack' },
  { type: 'short', label: 'Shorts/Reels scripts (3)' },
  { type: 'lesson', label: 'Lesson video script' },
  { type: 'parents', label: 'Parent pitch videos (3)' },
  { type: 'songs', label: 'Original song ideas (5)' },
  { type: 'calendar', label: '2-week content calendar' }
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

const DEFAULT_DESIGN = {
  subject: 'Tiny Riffs Guitar',
  purpose: 'logo',
  style: STYLES[0]
};

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
    setImages([]);
    setLastTask(request.type);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, request })
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
    const safe = `${profile.name.replace(/[^a-z0-9]/gi, '_')}_${lastTask}.md`;
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safe;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateImages = async () => {
    const purpose = PURPOSES.find((p) => p.id === design.purpose);
    setLoading(true);
    setError('');
    setDesignSvg('');
    setOutput('');
    setLastTask(purpose.id);
    try {
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
      setDesignSvg(data.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSvg = () => {
    const safe = `${design.subject.replace(/[^a-z0-9]/gi, '_')}_${lastTask}.svg`;
    const blob = new Blob([designSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safe;
    a.click();
    URL.revokeObjectURL(url);
  };

  const svgPreview = designSvg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(designSvg)}`
    : '';

  const tasks = { band: BAND_TASKS, business: BUSINESS_TASKS, teacher: TEACHER_TASKS }[kind];

  return (
    <div className="app">
      <header className="header">
        <h1>Local Content Engine</h1>
        <p>
          Generate client-ready marketing content for local businesses and bands.
          Sell it as a monthly content service.
        </p>
      </header>

      <div className="layout">
        <section className="card form-card">
          <div className="tabs">
            {[
              ['band', 'Band / Musician'],
              ['business', 'Local business'],
              ['teacher', 'Music teacher'],
              ['images', 'Design studio']
            ].map(([key, label]) => (
              <button
                key={key}
                className={kind === key ? 'tab active' : 'tab'}
                onClick={() => setKind(key)}
              >
                {label}
              </button>
            ))}
          </div>

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
              <Field label="Location" value={business.location} onChange={update('location')} placeholder="e.g. Austin, TX" />
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
              <div className="task-grid">
                <button className="task-btn" disabled={loading} onClick={generateImages}>
                  Generate design
                </button>
              </div>
              <p className="hint">
                Free vector designs generated by the AI model (uses your Groq key).
                Crisp logos &amp; banners at the exact size each platform needs.
              </p>
            </>
          )}

          {kind !== 'images' && (
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
                <button onClick={download}>Download .md</button>
              </div>
            )}
            {designSvg && (
              <div className="output-actions">
                <button onClick={downloadSvg}>Download .svg</button>
              </div>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          {loading && <div className="loading">Generating&hellip; this can take 20-60s.</div>}

          {!loading && kind === 'images' && !designSvg && !error && (
            <div className="empty">
              <p>Choose a purpose and click <strong>Generate design</strong>.</p>
              <p className="hint">
                Logo, Facebook ad, LinkedIn banner, YouTube thumbnail &amp; more — all
                sized correctly for each platform.
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

          {output && <pre className="output">{output}</pre>}
        </section>
      </div>
    </div>
  );
}
