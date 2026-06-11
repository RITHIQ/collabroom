/**
 * ProfileEdit.tsx
 * Real profile editor — saves to Supabase profiles, creators, and brands tables.
 */
import { useEffect, useState } from 'react';
import { Camera, Save, Loader } from 'lucide-react';
import { useAppSelector } from '../store';
import { userService } from '../services/userService';
import { supabase } from '../services/supabaseClient';
import toast from 'react-hot-toast';

export default function ProfileEdit() {
  const { user } = useAppSelector(s => s.auth);
  const isCreator = user?.role === 'creator';
  const isBrand = user?.role === 'brand';
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Base fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('India');
  const [tagline, setTagline] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Creator-specific
  const [username, setUsername] = useState('');
  const [niches, setNiches] = useState<string[]>([]);
  const [availability, setAvailability] = useState('available');

  // Brand-specific
  const [companyName, setCompanyName] = useState('');
  const [handle, setHandle] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');

  const nicheOptions = ['Beauty', 'Tech', 'Fitness', 'Food', 'Travel', 'Gaming', 'Finance', 'Fashion', 'Education', 'Lifestyle', 'Photography', 'Music', 'Parenting', 'Sports'];

  useEffect(() => {
    if (!user?.id) return;
    const loadProfile = async () => {
      try {
        const profile = await userService.getMyProfile(user.id);
        setDisplayName(profile?.full_name || '');
        setAvatarUrl(profile?.avatar_url || '');

        if (isCreator) {
          const c = await userService.getMyCreatorProfile(user.id);
          if (c) {
            setDisplayName(c.display_name || '');
            setUsername(c.username || '');
            setBio(c.bio || '');
            setLocation(c.location || 'India');
            setTagline(c.tagline || '');
            setNiches(c.niches || []);
            setAvailability(c.availability || 'available');
          }
        } else if (isBrand) {
          const b = await userService.getMyBrandProfile(user.id);
          if (b) {
            setCompanyName(b.company_name || '');
            setHandle(b.handle || '');
            setBio(b.description || '');
            setIndustry(b.industry || '');
            setCompanySize(b.company_size || '');
            setWebsite(b.website || '');
          }
        }
      } catch (err: unknown) {
        toast.error((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    void loadProfile();
  }, [user?.id, isCreator, isBrand]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user?.id) return;
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from('uploads').getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    toast.success('Photo uploaded');
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      // Always update base profile
      await userService.updateProfile(user.id, { full_name: displayName, avatar_url: avatarUrl || undefined });

      if (isCreator) {
        await userService.upsertCreatorProfile(user.id, {
          display_name: displayName,
          username,
          bio,
          location,
          tagline,
          niches,
          availability,
          profile_photo: avatarUrl || undefined,
        });
      } else if (isBrand) {
        await userService.upsertBrandProfile(user.id, {
          company_name: companyName,
          handle,
          description: bio,
          industry,
          company_size: companySize,
          website,
          logo_url: avatarUrl || undefined,
        });
      }

      toast.success('Profile saved successfully!');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 32, maxWidth: 920, margin: '0 auto' }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10, marginBottom: 12 }} />)}
    </div>
  );

  return (
    <div style={{ padding: 32, maxWidth: 920, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>Edit Profile</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28 }}>
        Update your public profile — changes are saved to your account.
      </p>

      <div className="card" style={{ padding: 28 }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <label htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: avatarUrl ? 'transparent' : 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', overflow: 'hidden', border: '2px solid var(--color-border)', position: 'relative' }}>
              {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={26} />}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                <Camera size={20} color="#fff" />
              </div>
            </div>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </label>
          <div>
            <div style={{ fontWeight: 700 }}>{displayName || 'Your name'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{user?.email}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Click photo to change</div>
          </div>
        </div>

        {/* Form Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {isCreator && (
            <>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Display Name *</label>
                <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your full name" />
              </div>
              <div>
                <label className="label">Username</label>
                <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="@username" />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Tagline</label>
                <input className="input" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Lifestyle creator · 450K reach" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Bio</label>
                <textarea className="input" rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell brands about your content and audience…" style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label className="label">Availability</label>
                <select className="input" value={availability} onChange={e => setAvailability(e.target.value)} style={{ cursor: 'pointer' }}>
                  <option value="available">✅ Available for collabs</option>
                  <option value="selective">🔶 Selective — DM to discuss</option>
                  <option value="unavailable">🔴 Not taking new projects</option>
                </select>
              </div>
              <div>
                <label className="label">Niches</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {nicheOptions.map(n => (
                    <button type="button" key={n}
                      onClick={() => setNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])}
                      className={`niche-chip ${niches.includes(n) ? 'active' : ''}`}
                      style={{ fontSize: '0.75rem' }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {isBrand && (
            <>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Company Name *</label>
                <input className="input" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your company name" />
              </div>
              <div>
                <label className="label">Brand Handle</label>
                <input className="input" value={handle} onChange={e => setHandle(e.target.value)} placeholder="@yourhandle" />
              </div>
              <div>
                <label className="label">Industry</label>
                <input className="input" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Fashion, Tech…" />
              </div>
              <div>
                <label className="label">Company Size</label>
                <select className="input" value={companySize} onChange={e => setCompanySize(e.target.value)} style={{ cursor: 'pointer' }}>
                  <option value="">Select size</option>
                  {['1-10','11-50','51-200','201-500','500+'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Website</label>
                <input className="input" type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.com" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Brand Description</label>
                <textarea className="input" rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell creators what your brand stands for…" style={{ resize: 'vertical' }} />
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: 24 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {saving ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
