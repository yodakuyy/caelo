import { useState, useEffect } from 'react'

const skyModes = {
    sunrise: {
        class: 'sunrise',
        meta: 'Clear Morning',
        quote: 'Under a quiet morning sky'
    },
    day: {
        class: 'day',
        meta: 'Clear Day',
        quote: 'Under a vast blue sky'
    },
    sunset: {
        class: 'sunset',
        meta: 'Golden Hour',
        quote: 'Under a changing sky'
    },
    night: {
        class: 'night',
        meta: 'Silent Night',
        quote: 'Under the watchful stars'
    },
    emergency: {
        class: 'night', // Reuse night gradient for safety alert darkness
        meta: 'SkyGuard Active',
        quote: 'Safety First'
    }
};

type Mode = keyof typeof skyModes;

function Clouds() {
    return (
        <div className="sky-clouds">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className={`cloud cloud-${i}`}
                    style={{
                        top: `${5 + Math.random() * 50}%`,
                        opacity: 0.3 + Math.random() * 0.3,
                        transform: `scale(${0.7 + Math.random() * 1.5})`,
                        animationDuration: `${100 + Math.random() * 200}s`,
                        animationDelay: `${-Math.random() * 200}s`
                    }}
                >
                    <svg width="240" height="120" viewBox="0 0 240 120">
                        <path fill="white" d="M50,80 C50,50 80,50 90,50 C100,20 150,20 170,50 C190,50 220,50 220,80 C220,110 190,110 170,110 L70,110 C40,110 50,80 50,80 Z" />
                    </svg>
                </div>
            ))}
        </div>
    )
}

function App() {
    const [mode, setMode] = useState<Mode>('day');
    const [screen, setScreen] = useState(0); // 0: Home, 1: Track, 2: Expedition, 3: Safety
    const [showProfile, setShowProfile] = useState(false);
    const [showActivitySheet, setShowActivitySheet] = useState(false);
    const [selectionStage, setSelectionStage] = useState(0); // 0: Category, 1: Mode, 2: Route
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedMode, setSelectedMode] = useState<any>(null);
    const [lastActivity, setLastActivity] = useState<any>(null);
    const [rideMode, setRideMode] = useState<string>('daily'); // 'race', 'touring', 'daily'
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

    const [distance, setDistance] = useState(12.4);
    const [seconds, setSeconds] = useState(3720);
    const [elevation, setElevation] = useState(342);
    const [isRecording, setIsRecording] = useState(false);
    const [timeStr, setTimeStr] = useState('');

    const activities = [
        { id: 'ride', label: 'Ride', icon: '🚴', hasSub: true },
        { id: 'motor', label: 'Motor', icon: '🏍' },
        { id: 'run', label: 'Run', icon: '🏃' },
        { id: 'hike', label: 'Hike', icon: '⛰' },
    ];

    const rideSubModes = [
        { id: 'race', label: 'Race / Event', icon: '🏁', modeId: 'race', desc: 'Auto Check-in & Navigation (GPX focus)' },
        { id: 'touring', label: 'Expedition', icon: '🎒', modeId: 'touring', desc: 'Multi-day Touring Plan (Day-by-day)' },
        { id: 'daily', label: 'Daily Ride', icon: '🚲', modeId: 'daily', desc: 'Free Ride (Optional GPX)' },
    ];

    const recentRoutes = [
        { id: 'r1', name: 'Bandung Epic Ride 2026', dist: '142km' },
        { id: 'r2', name: 'Sentul Hill Training', dist: '45km' },
    ];

    useEffect(() => {
        const autoSetSky = () => {
            const hour = new Date().getHours();
            let newMode: Mode = 'day';
            if (hour >= 5 && hour < 7) newMode = 'sunrise';
            else if (hour >= 7 && hour < 16.5) newMode = 'day';
            else if (hour >= 16.5 && hour < 18.5) newMode = 'sunset';
            else newMode = 'night';
            setMode(newMode);
            setTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        };

        autoSetSky();
        const interval = setInterval(autoSetSky, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => {
                setDistance(prev => prev + Math.random() * 0.005);
                setSeconds(prev => prev + 1);
                if (Math.random() > 0.95) setElevation(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const formatTime = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        return `${h}h ${m.toString().padStart(2, '0')}m`;
    };

    const handleCategoryClick = (cat: any) => {
        if (cat.hasSub) {
            setSelectedCategory(cat);
            setSelectionStage(1);
        } else {
            startJourney(cat, 'daily', null);
        }
    };

    const handleModeClick = (mode: any) => {
        setSelectedMode(mode);
        setRideMode(mode.modeId);
        setSelectionStage(2);
    };

    const startJourney = (cat: any, sub: string, route: string | null) => {
        setLastActivity(cat);
        setRideMode(sub);
        setSelectedRoute(route);
        setDistance(0);
        setSeconds(0);
        setElevation(0);
        setIsRecording(true);
        setScreen(1);
        setShowActivitySheet(false);
        setSelectionStage(0);
    };

    return (
        <div className={`app-root mode-${mode} ${mode === 'night' ? 'active-night' : ''}`}>
            {/* BACKGROUND LAYERS */}
            {(['sunrise', 'day', 'sunset', 'night'] as const).map(m => (
                <div key={m} className={`sky-layer ${m} ${mode === m ? 'active' : ''}`} />
            ))}
            <div className="sky-glow" />
            <Clouds />
            <Stars />

            <main id="app">
                <header className="main-header">
                    <div className="meta-info">{timeStr} · {skyModes[mode].meta}</div>
                    <div className="avatar-btn" onClick={() => setShowProfile(true)}><div className="avatar-img" /></div>
                </header>

                {/* SCREENS */}
                <div className="screen-container">
                    {/* 0: HOME */}
                    <section className={`screen ${screen === 0 ? 'active' : ''}`}>
                        <p className="sky-quote">{skyModes[mode].quote}</p>
                        <div className="btn-start-container">
                            <button className="btn-start" onClick={() => setShowActivitySheet(true)}>
                                {lastActivity ? (
                                    <>
                                        <span>START {lastActivity.label.toUpperCase()}</span>
                                        <span className="change-arrow">▼ Change</span>
                                    </>
                                ) : 'START JOURNEY'}
                            </button>
                        </div>
                        <div className="card last-journey-card">
                            <p className="sub-label">Last Journey</p>
                            <h2 style={{ margin: '0.5rem 0', fontWeight: 300 }}>12.4 km · {rideMode.toUpperCase()}</h2>
                            <p className="sub-label">“Yesterday at Sunset”</p>
                        </div>
                    </section>

                    {/* 1: TRACK (Ride Recording Mode) */}
                    <section className={`screen ${screen === 1 ? 'active' : ''}`}>
                        <div className="recording-top">
                            <p className="sub-label pulse-dot">
                                <span className="dot-red" /> {isRecording ? 'SkyTrack Active' : 'Paused'}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <h3 style={{ fontWeight: 400, marginTop: '5px' }}>
                                    {lastActivity?.label || 'Ride'} Journey
                                </h3>
                                {rideMode === 'race' && <span className="mode-indicator-chip chip-race">🏁 Race Mode</span>}
                                {rideMode === 'touring' && <span className="mode-indicator-chip chip-touring">🎒 Expedition</span>}
                            </div>
                        </div>

                        <div className="recording-center">
                            <div className="big-number">{distance.toFixed(1)}</div>
                            <div className="unit-label">KILOMETERS</div>

                            <div className="stats-grid-ride">
                                <div className="stat-item-ride">
                                    <span className="val">{(22.4 + Math.random() * 2).toFixed(1)}</span>
                                    <span className="lbl">KM/H</span>
                                </div>
                                <div className="stat-item-ride">
                                    <span className="val">{formatTime(seconds)}</span>
                                    <span className="lbl">Duration</span>
                                </div>
                                <div className="stat-item-ride">
                                    <span className="val">+{elevation}m</span>
                                    <span className="lbl">Elevation</span>
                                </div>
                            </div>

                            {/* MODE SPECIFIC MOCKUP DATA */}
                            {rideMode === 'race' && (() => {
                                const raceCheckpoints = [
                                    { name: 'CP 1', km: 54 },
                                    { name: 'CP 2', km: 101 },
                                    { name: 'CP 3', km: 154 },
                                    { name: 'Finish', km: 207 }
                                ];
                                const nextCP = raceCheckpoints.find(cp => distance < cp.km) || { name: 'Finish', km: 207 };
                                const remaining = nextCP.km - distance;
                                const isFinished = distance >= 207;

                                return (
                                    <div className="checkpoint-ticker race-active">
                                        <div className="ticker-main">
                                            <span>🚩 {isFinished ? 'Race Completed!' : `Next: ${nextCP.name}`}</span>
                                            {!isFinished && <span className="remaining-val">-{remaining.toFixed(1)} <small>KM LEFT</small></span>}
                                        </div>
                                        {!isFinished && (
                                            <div className="ticker-progress-bg">
                                                <div className="ticker-progress-bar" style={{ width: `${(distance / nextCP.km) * 100}%` }} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                            {rideMode === 'touring' && (
                                <div className="checkpoint-ticker touring-active">
                                    <span>📍 <b>Day 2</b> of 3</span>
                                    <span style={{ opacity: 0.6 }}>To: Garut City</span>
                                </div>
                            )}
                        </div>

                        <div className="recording-bottom">
                            <div className="safety-status-chip">🛡️ SkyGuard Enabled</div>
                            <div className="control-bar">
                                <button className="btn-glass" onClick={() => setIsRecording(!isRecording)}>
                                    {isRecording ? 'PAUSE' : 'RESUME'}
                                </button>
                                <button className="btn-glass stop-btn" onClick={() => setScreen(0)}>STOP</button>
                            </div>
                        </div>
                    </section>

                    {/* 2: EXPEDITION */}
                    <section className={`screen ${screen === 2 ? 'active' : ''}`}>
                        <h2 className="screen-title">Expeditions</h2>
                        <div className="expedition-list">
                            <ExpeditionCard title="Java Crossing" stats="124 km · 3 Days" sub="Under changing skies" />
                            <ExpeditionCard title="Rinjani Trek" stats="45 km · 2 Days" sub="Above the clouds" />
                        </div>
                    </section>

                    {/* 3: SAFETY */}
                    <section className={`screen ${screen === 3 ? 'active' : ''}`}>
                        <div className="recording-center">
                            <div className="big-circle-alert">🛡️</div>
                            <h2 style={{ marginTop: '2rem', fontWeight: 300 }}>SkyGuard Active</h2>
                            <p className="sub-label" style={{ marginTop: '1rem', textTransform: 'none' }}>
                                Your location is being shared with 2 emergency contacts.
                            </p>
                        </div>
                        <div className="card" style={{ marginTop: 'auto' }}>
                            <p className="sub-label">Automatic Check-in</p>
                            <h3>Next in 45:12</h3>
                        </div>
                    </section>
                </div>

                {/* BOTTOM NAVIGATION */}
                <nav className="bottom-nav">
                    <NavItem active={screen === 0} label="Home" icon="☀️" onClick={() => setScreen(0)} />
                    <NavItem active={screen === 1} label="Track" icon="🛰️" onClick={() => setScreen(1)} />
                    <NavItem active={screen === 2} label="Expedition" icon="🏔️" onClick={() => setScreen(2)} />
                    <NavItem active={screen === 3} label="Safety" icon="🛡️" onClick={() => setScreen(3)} />
                </nav>
            </main>

            {/* PROFILE HUB OVERLAY */}
            {showProfile && <ProfileHub onClose={() => setShowProfile(false)} />}

            {/* ACTIVITY SHEET OVERLAY */}
            <div className={`overlay ${showActivitySheet ? 'active' : ''}`} onClick={() => {
                setShowActivitySheet(false);
                setSelectionStage(0);
            }}>
                <div className="activity-sheet" onClick={(e) => e.stopPropagation()}>
                    <div className="sheet-grabber" />
                    <div className="sheet-header">
                        {selectionStage > 0 && (
                            <button className="back-btn" onClick={() => setSelectionStage(selectionStage - 1)}>⟨</button>
                        )}
                        <div className="sheet-title">
                            {selectionStage === 0 && 'Select Activity'}
                            {selectionStage === 1 && `Type of ${selectedCategory?.label}`}
                            {selectionStage === 2 && 'Choose Route'}
                        </div>
                    </div>

                    <div className={`activity-grid ${selectionStage === 1 ? 'sub-mode' : ''} ${selectionStage === 2 ? 'route-stage' : ''}`}>
                        {selectionStage === 0 && (
                            activities.map(act => (
                                <div key={act.id} className="activity-card" onClick={() => handleCategoryClick(act)}>
                                    <span className="activity-icon">{act.icon}</span>
                                    <span className="activity-label">{act.label}</span>
                                </div>
                            ))
                        )}

                        {selectionStage === 1 && (
                            rideSubModes.map(sub => (
                                <div key={sub.id} className="activity-card sub-card" onClick={() => handleModeClick(sub)}>
                                    <div className="header-row">
                                        <span className="activity-icon">{sub.icon}</span>
                                        <span className="activity-label">{sub.label}</span>
                                    </div>
                                    <p className="description">{sub.desc}</p>
                                </div>
                            ))
                        )}

                        {selectionStage === 2 && (
                            <div style={{ width: '100%' }}>
                                <div className="upload-zone">
                                    <span className="upload-icon">📄</span>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Upload GPX File</p>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '4px' }}>Select from your device</p>
                                </div>
                                <p className="sub-label" style={{ marginBottom: '0.8rem', textAlign: 'center' }}>Recent Routes</p>
                                <div className="route-list">
                                    {recentRoutes.map(r => (
                                        <div key={r.id} className="route-item" onClick={() => startJourney(selectedCategory, selectedMode.id, r.name)}>
                                            <div className="route-info">
                                                <span className="name">{r.name}</span>
                                                <span className="dist">{r.dist} Route</span>
                                            </div>
                                            <span style={{ opacity: 0.3 }}>⟩</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="skip-btn" onClick={() => startJourney(selectedCategory, selectedMode.id, null)}>
                                    Skip Route Selection
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* DEV SIMULATION */}
            <div style={{ position: 'fixed', bottom: 10, right: 10, zIndex: 1000, display: 'flex', gap: 5, opacity: 0.1 }}>
                {(['sunrise', 'day', 'sunset', 'night'] as Mode[]).map(m => (
                    <button key={m} onClick={() => setMode(m)} style={{ fontSize: 8 }}>{m[0].toUpperCase()}</button>
                ))}
            </div>
        </div>
    )
}

function NavItem({ active, label, icon, onClick }: any) {
    return (
        <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
        </div>
    )
}

function ProfileHub({ onClose }: any) {
    return (
        <div className="profile-overlay active">
            <div className="profile-content scrollable">
                <header className="profile-header">
                    <button className="close-btn" onClick={onClose}>✕</button>
                    <div className="profile-top">
                        <div className="avatar-large" />
                        <h2>Yogi Fermana</h2>
                        <p className="sub-label">3,427 km · 327 journeys</p>
                    </div>
                </header>

                <div className="settings-list">
                    {/* SECTION 1 - ACCOUNT */}
                    <div className="settings-section">
                        <p className="section-title">Account</p>
                        <SettingRow label="Edit Profile" />
                        <SettingRow label="Subscription" sub="Free Plan" />
                        <SettingRow label="Connected Devices" />
                    </div>

                    {/* SECTION 2 - SAFETY */}
                    <div className="settings-section">
                        <p className="section-title">Safety</p>
                        <SettingRow label="Emergency Contacts" />
                        <SettingRow label="Auto Alert Timer" />
                        <SettingRow label="Share Preferences" />
                    </div>

                    {/* SECTION 3 - PREFERENCES */}
                    <div className="settings-section">
                        <p className="section-title">Preferences</p>
                        <SettingRow label="Unit (km/mile)" sub="Metric" />
                        <SettingRow label="Theme Override" sub="Auto Sky" />
                        <SettingRow label="Battery Saver Mode" />
                        <SettingRow label="Privacy" />
                    </div>

                    {/* SECTION 4 - DATA */}
                    <div className="settings-section">
                        <p className="section-title">Data</p>
                        <SettingRow label="Export GPX" />
                        <SettingRow label="Delete Account" color="#ff6b6b" />
                        <SettingRow label="Backup" />
                    </div>
                </div>

                <div style={{ height: '5rem' }} /> {/* Spacing at bottom */}
            </div>
        </div>
    )
}

function SettingRow({ label, sub, color }: any) {
    return (
        <div className="setting-row">
            <div className="setting-info">
                <span style={{ color: color || 'white' }}>{label}</span>
                {sub && <span className="setting-sub">{sub}</span>}
            </div>
            <span className="setting-arrow">⟩</span>
        </div>
    )
}


function Stars() {
    return (
        <div className="night-stars">
            {Array.from({ length: 50 }).map((_, i) => (
                <div
                    key={i}
                    className="star"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: '1.5px',
                        height: '1.5px',
                        opacity: Math.random()
                    }}
                />
            ))}
        </div>
    )
}


function ExpeditionCard({ title, stats, sub }: any) {
    return (
        <div className="expedition-card">
            <h3>{title}</h3>
            <p>{stats}</p>
            <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: 5 }}>{sub}</p>
        </div>
    )
}

export default App
