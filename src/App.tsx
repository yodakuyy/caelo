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
    const [selectionStage, setSelectionStage] = useState(0); // 0: Category, 1: Mode, 2: Route, 3: CP Setup
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedMode, setSelectedMode] = useState<any>(null);
    const [lastActivity, setLastActivity] = useState<any>(null);
    const [rideMode, setRideMode] = useState<string>('daily'); // 'race', 'touring', 'daily'
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [checkpoints, setCheckpoints] = useState([
        { id: 1, name: 'CP 1', km: 54 },
        { id: 2, name: 'CP 2', km: 101 },
        { id: 3, name: 'CP 3', km: 154 },
    ]);
    const [cockpitMode, setCockpitMode] = useState<'stats' | 'nav'>('stats');
    const [showStopOptions, setShowStopOptions] = useState(false);
    const [pendingConfirm, setPendingConfirm] = useState<'nav' | 'record' | null>(null);
    const [showRouteSelectorDuringRide, setShowRouteSelectorDuringRide] = useState(false);
    const [hideNavPrompt, setHideNavPrompt] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [summaryData, setSummaryData] = useState<any>(null);
    const [rideHistory, setRideHistory] = useState<any[]>([]);

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
        { id: 'r1', name: 'Bandung Epic Ride 2026', dist: 207 },
        { id: 'r2', name: 'Sentul Hill Training', dist: 45 },
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

    const handleRouteSelect = (route: any) => {
        setSelectedRoute(route);
        if (rideMode === 'race') {
            setSelectionStage(3);
        } else {
            startJourney(selectedCategory, rideMode, route);
        }
    };

    const startJourney = (cat: any, sub: string, route: any) => {
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
                                <div className="mode-row">
                                    {rideMode === 'race' && <span className="mode-indicator-chip chip-race">🏁 Race Mode</span>}
                                    {rideMode === 'touring' && <span className="mode-indicator-chip chip-touring">🎒 Expedition</span>}
                                    <div className="cockpit-toggle">
                                        <button className={cockpitMode === 'stats' ? 'active' : ''} onClick={() => setCockpitMode('stats')}>STATS</button>
                                        <button className={cockpitMode === 'nav' ? 'active' : ''} onClick={() => setCockpitMode('nav')}>NAV</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="recording-center">
                            {cockpitMode === 'stats' ? (
                                <>
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
                                </>
                            ) : (
                                <div className="nav-navigation-view">
                                    {selectedRoute && (
                                        <div className="nav-overlay-info">
                                            <span className="turn-icon">⬅️</span>
                                            <div className="turn-text">
                                                <span className="next-turn">Turn Left in 400m</span>
                                                <span className="street-name">Jl. Raya Bandung</span>
                                            </div>
                                        </div>
                                    )}

                                    {!selectedRoute && !hideNavPrompt && (
                                        <div className="no-route-overlay">
                                            <div className="no-route-content">
                                                <button className="btn-load-route" onClick={() => setShowRouteSelectorDuringRide(true)}>
                                                    LOAD NEW ROUTE
                                                </button>
                                                <button className="btn-hide-prompt" onClick={() => setHideNavPrompt(true)}>
                                                    FREE RIDE (HIDE GPS)
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!selectedRoute && hideNavPrompt && (
                                        <button className="map-fab-search" onClick={() => setShowRouteSelectorDuringRide(true)}>
                                            <span className="fab-icon">🗺️</span>
                                            <span className="fab-text">MAPS</span>
                                        </button>
                                    )}

                                    <div className="gpx-path-container">
                                        <div className="map-labels">
                                            <span className="map-label" style={{ top: '10%', left: '70%' }}>Mount Peak</span>
                                            <span className="map-label" style={{ top: '80%', left: '20%' }}>Start Point</span>
                                            <span className="map-label" style={{ top: '45%', left: '50%' }}>Mid Valley</span>
                                        </div>
                                        <svg viewBox="0 0 100 100" className="gpx-svg">
                                            <defs>
                                                <pattern id="urban-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                                    <rect x="2" y="2" width="6" height="6" fill="rgba(255,255,255,0.02)" rx="1" />
                                                    <rect x="12" y="4" width="4" height="8" fill="rgba(255,255,255,0.02)" rx="1" />
                                                    <rect x="4" y="12" width="8" height="4" fill="rgba(255,255,255,0.02)" rx="1" />
                                                </pattern>
                                                <filter id="glow">
                                                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                    </feMerge>
                                                </filter>
                                            </defs>

                                            {/* Map Background Base */}
                                            <rect width="100%" height="100%" fill="rgba(0,0,0,0.1)" />

                                            {/* Urban Areas / City Blocks */}
                                            <rect width="100" height="100" fill="url(#urban-pattern)" />

                                            {/* Sub Grid */}
                                            <g className="map-subgrid">
                                                {[...Array(10)].map((_, i) => (
                                                    <line key={`v-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.1" />
                                                ))}
                                                {[...Array(10)].map((_, i) => (
                                                    <line key={`h-${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="rgba(255,255,255,0.03)" strokeWidth="0.1" />
                                                ))}
                                            </g>

                                            {/* Secondary Road Network */}
                                            <g className="map-secondary-roads">
                                                <path d="M0,45 L100,40 M30,0 L35,100 M0,75 Q50,65 100,80 M70,0 C65,40 85,60 80,100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                                            </g>

                                            {/* Main GPX Route Path - Differentiated Traveled vs Planned */}
                                            <path
                                                className="path-planned"
                                                d="M10,90 C25,85 20,70 35,65 S45,40 65,35 S80,10 90,5"
                                                fill="none"
                                                stroke="#34ace0"
                                                strokeWidth="5"
                                                strokeLinecap="round"
                                                opacity="0.2"
                                            />
                                            <path
                                                className="main-route-active"
                                                d="M10,90 C25,85 20,70 35,65 S45,40 65,35 S80,10 90,5"
                                                fill="none"
                                                stroke="#2ed573"
                                                strokeWidth="5"
                                                strokeLinecap="round"
                                                strokeDasharray="200"
                                                strokeDashoffset={200 - (distance / (selectedRoute?.dist || 207)) * 200}
                                                filter="url(#glow)"
                                            />

                                            {/* Checkpoint Markers - Only show if CP exists */}
                                            {rideMode === 'race' && (
                                                <g className="checkpoints">
                                                    <circle cx="35" cy="65" r="2.5" fill="#ff9f43" stroke="white" strokeWidth="0.5" />
                                                    <circle cx="65" cy="35" r="2.5" fill="#ff9f43" stroke="white" strokeWidth="0.5" />
                                                </g>
                                            )}

                                            {/* Finish Goal Marker */}
                                            <g transform="translate(90, 5)">
                                                <circle r="4" fill="rgba(46, 213, 115, 0.2)">
                                                    <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
                                                </circle>
                                                <path d="M-1,0 L1,0 M0,-1 L0,1" stroke="white" strokeWidth="0.5" />
                                                <circle r="1.5" fill="#2ed573" />
                                            </g>

                                            {/* Live Rider Position Cursor */}
                                            <g className="rider-cursor">
                                                <circle r="8" fill="rgba(255, 71, 87, 0.15)">
                                                    <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
                                                </circle>
                                                <circle r="3.5" fill="#ff4757" stroke="white" strokeWidth="1" />
                                                <path d="M0,-8 L0,-5 M8,0 L5,0 M0,8 L0,5 M-8,0 L-5,0" stroke="#ff4757" strokeWidth="0.5" />

                                                <animateMotion
                                                    path="M10,90 C25,85 20,70 35,65 S45,40 65,35 S80,10 90,5"
                                                    dur="120s"
                                                    rotate="auto"
                                                    repeatCount="indefinite"
                                                />
                                            </g>
                                        </svg>
                                    </div>

                                </div>
                            )}

                            {/* MODE SPECIFIC MOCKUP DATA - Only show if data exists */}
                            {rideMode === 'race' && (() => {
                                const raceCheckpoints = [
                                    { name: 'CP 1', km: 54 },
                                    { name: 'CP 2', km: 101 },
                                    { name: 'CP 3', km: 154 },
                                    { name: 'Finish', km: 207 }
                                ];

                                // Conditional check: If we have CP data, show the ticker
                                if (raceCheckpoints.length > 0) {
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
                                }
                                return null;
                            })()}
                            {rideMode === 'touring' && (
                                <div className="checkpoint-ticker touring-active">
                                    <span>📍 <b>Day 2</b> of 3</span>
                                    <span style={{ opacity: 0.6 }}>To: Garut City</span>
                                </div>
                            )}

                            {/* CLIMB PRO - REPOSITIONED BELOW CP (Auto-Appear: 0.1km - 10km) */}
                            {cockpitMode === 'nav' && distance >= 0.1 && distance <= 10 && (
                                <div className="climb-profile-container auto-appear">
                                    <div className="climb-info-header">
                                        <div className="climb-badge">
                                            <span className="climb-label">CLIMB 2/4</span>
                                            <span className="climb-distance">900m to peak</span>
                                        </div>
                                        <div className="climb-gradient-live">
                                            <span className="grad-num">7%</span>
                                            <span className="grad-sub">GRAD</span>
                                        </div>
                                    </div>
                                    <div className="elevation-visual-bars">
                                        <div className="elev-bar" style={{ height: '30%', background: '#2ed573' }}></div>
                                        <div className="elev-bar" style={{ height: '45%', background: '#ff9f43' }}></div>
                                        <div className="elev-bar" style={{ height: '70%', background: '#ff4757', border: '1px solid rgba(255,255,255,0.4)', position: 'relative' }}>
                                            <div className="rider-climb-marker" />
                                        </div>
                                        <div className="elev-bar" style={{ height: '90%', background: '#b33939' }}></div>
                                        <div className="elev-bar" style={{ height: '60%', background: '#ff4757' }}></div>
                                        <div className="elev-bar" style={{ height: '40%', background: '#ff9f43' }}></div>
                                        <div className="elev-bar" style={{ height: '20%', background: '#2ed573' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="recording-bottom">
                            {cockpitMode === 'stats' && (
                                <>
                                    <div className="safety-status-chip">🛡️ SkyGuard Enabled</div>
                                    <div className="control-bar">
                                        <button className="btn-glass" onClick={() => setIsRecording(!isRecording)}>
                                            {isRecording ? 'PAUSE' : 'RESUME'}
                                        </button>
                                        <button className="btn-glass stop-btn" onClick={() => setShowStopOptions(true)}>STOP</button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* STOP ACTION OVERLAY MENU */}
                        {showStopOptions && (
                            <div className="stop-action-overlay">
                                <div className="stop-action-sheet">
                                    <h3>MANAGE SESSION</h3>
                                    <p className="stop-sheet-sub">What would you like to do?</p>
                                    <div className="stop-options-list">
                                        {selectedRoute && (
                                            <button className="stop-opt-btn" onClick={() => setPendingConfirm('nav')}>
                                                <span className="opt-icon">🧭</span>
                                                <div className="opt-text">
                                                    <strong>Stop Navigation</strong>
                                                    <small>Clear route but keep recording</small>
                                                </div>
                                            </button>
                                        )}
                                        <button className="stop-opt-btn danger" onClick={() => setPendingConfirm('record')}>
                                            <span className="opt-icon">🏁</span>
                                            <div className="opt-text">
                                                <strong>End & Save Ride</strong>
                                                <small>Complete this session</small>
                                            </div>
                                        </button>
                                        <button className="stop-opt-cancel" onClick={() => setShowStopOptions(false)}>GO BACK</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FINAL VALIDATION MODAL */}
                        {pendingConfirm && (
                            <div className="validation-overlay">
                                <div className="validation-card">
                                    <div className="val-icon">{pendingConfirm === 'nav' ? '❓' : '⚠️'}</div>
                                    <h3>Confirm Action</h3>
                                    <p>Are you sure you want to {pendingConfirm === 'nav' ? 'stop the current navigation?' : 'end and save this ride?'}</p>
                                    <div className="val-actions">
                                        <button className="val-btn-confirm" onClick={() => {
                                            if (pendingConfirm === 'nav') {
                                                setSelectedRoute(null);
                                                setCockpitMode('stats');
                                            } else {
                                                setIsRecording(false);
                                                const finalDoc = {
                                                    id: Date.now(),
                                                    dist: distance,
                                                    time: seconds,
                                                    elev: elevation,
                                                    route: selectedRoute,
                                                    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
                                                    type: rideMode
                                                };
                                                setSummaryData(finalDoc);
                                                setRideHistory(prev => [finalDoc, ...prev]);
                                                setShowSummary(true);
                                                setScreen(0);
                                                setSelectionStage(0);
                                            }
                                            setPendingConfirm(null);
                                            setShowStopOptions(false);
                                        }}>YES, CONFIRM</button>
                                        <button className="val-btn-cancel" onClick={() => setPendingConfirm(null)}>NOT YET</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ROUTE SELECTOR DURING RIDE */}
                        {showRouteSelectorDuringRide && (
                            <div className="mid-ride-selector-overlay">
                                <div className="selector-sheet">
                                    <div className="sheet-header">
                                        <h3>SELECT NEW ROUTE</h3>
                                        <button className="close-sheet" onClick={() => setShowRouteSelectorDuringRide(false)}>×</button>
                                    </div>
                                    <div className="route-picker-list">
                                        {recentRoutes.map(r => (
                                            <button key={r.id} className="route-select-item" onClick={() => {
                                                setSelectedRoute(r);
                                                setShowRouteSelectorDuringRide(false);
                                            }}>
                                                <div className="route-icon">🗺️</div>
                                                <div className="route-info">
                                                    <strong>{r.name}</strong>
                                                    <small>{r.dist}km · GPX File</small>
                                                </div>
                                            </button>
                                        ))}
                                        <div className="upload-new-gpx-mini">
                                            <span>+ Upload New GPX</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* 2: EXPEDITION / HISTORY */}
                    <section className={`screen ${screen === 2 ? 'active' : ''}`}>
                        <h2 className="screen-title">Expeditions</h2>

                        <div className="expedition-list">
                            <p className="section-mini-group">Featured Trips</p>
                            <ExpeditionCard title="Java Crossing" stats="124 km · 3 Days" sub="Under changing skies" />
                            <ExpeditionCard title="Rinjani Trek" stats="45 km · 2 Days" sub="Above the clouds" />

                            {rideHistory.length > 0 && (
                                <>
                                    <p className="section-mini-group" style={{ marginTop: '20px' }}>Activity History</p>
                                    {rideHistory.map((ride) => (
                                        <ExpeditionCard
                                            key={ride.id}
                                            title={`${ride.dist.toFixed(1)} km Ride`}
                                            stats={`${ride.date} · ${ride.elev}m Elevation`}
                                            sub={`${ride.type.toUpperCase()} SESSION`}
                                        />
                                    ))}
                                </>
                            )}
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

            {/* RIDE SUMMARY OVERLAY (STRAVA STYLE) */}
            {showSummary && summaryData && (
                <div className="ride-summary-overlay">
                    <div className="summary-card-container">
                        <div className="summary-share-card">
                            <div className="card-header">
                                <div className="user-info-mini">
                                    <div className="mini-avatar">YF</div>
                                    <div className="user-meta">
                                        <strong>Yogi Fermana</strong>
                                        <span>{summaryData.date} · {summaryData.type.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="brand-logo-mini">CAELO</div>
                            </div>

                            <div className="summary-map-preview">
                                <svg viewBox="0 0 100 100" className="summary-svg">
                                    <path
                                        d="M10,90 C25,85 20,70 35,65 S45,40 65,35 S80,10 90,5"
                                        fill="none"
                                        stroke="#2ed573"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        filter="url(#glow)"
                                    />
                                    <circle cx="10" cy="90" r="2" fill="white" />
                                    <circle cx="90" cy="5" r="2" fill="#2ed573" />
                                </svg>
                                <div className="map-watermark">Caelo Maps Engine</div>
                            </div>

                            <div className="summary-stats-grid">
                                <div className="s-stat">
                                    <span className="s-val">{summaryData.dist.toFixed(2)}</span>
                                    <span className="s-lbl">Distance (km)</span>
                                </div>
                                <div className="s-stat">
                                    <span className="s-val">{formatTime(summaryData.time)}</span>
                                    <span className="s-lbl">Moving Time</span>
                                </div>
                                <div className="s-stat">
                                    <span className="s-val">{summaryData.elev}m</span>
                                    <span className="s-lbl">Elevation</span>
                                </div>
                                <div className="s-stat">
                                    <span className="s-val">{(summaryData.dist / (summaryData.time / 3600)).toFixed(1)}</span>
                                    <span className="s-lbl">Avg (km/h)</span>
                                </div>
                            </div>

                            <div className="card-footer-quotes">
                                "The mountains are calling, and I must go."
                            </div>
                        </div>

                        <div className="summary-actions">
                            <button className="btn-share-social">
                                <span>📤</span> SHARE TO SOCMED
                            </button>
                            <button className="btn-save-gallery">
                                <span>💾</span> SAVE TO GALLERY
                            </button>
                            <button className="btn-summary-done" onClick={() => setShowSummary(false)}>
                                DONE
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            {selectionStage === 3 && 'Race Planning'}
                        </div>
                    </div>

                    <div className={`activity-grid ${selectionStage === 1 ? 'sub-mode' : ''} ${selectionStage >= 2 ? 'route-stage' : ''}`}>
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
                                        <div key={r.id} className="route-item" onClick={() => handleRouteSelect(r)}>
                                            <div className="route-info">
                                                <span className="name">{r.name}</span>
                                                <span className="dist">{r.dist}km Route</span>
                                            </div>
                                            <span style={{ opacity: 0.3 }}>⟩</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="skip-btn" onClick={() => handleRouteSelect(null)}>
                                    Skip Route Selection
                                </button>
                            </div>
                        )}

                        {selectionStage === 3 && (
                            <div style={{ width: '100%' }}>
                                <div className="route-summary-card">
                                    <div className="summary-info">
                                        <span className="summary-name">{selectedRoute?.name || 'Custom Route'}</span>
                                        <span className="summary-dist">{selectedRoute?.dist || '---'} KM Total Distance</span>
                                    </div>
                                    <div className="summary-badge">GPX</div>
                                </div>

                                <p className="sub-label" style={{ margin: '1.5rem 0 0.8rem', textAlign: 'center' }}>Configure Checkpoints</p>

                                <div className="cp-setup-scroll-area">
                                    <div className="cp-setup-list">
                                        {checkpoints.map((cp, idx) => (
                                            <div key={cp.id} className="cp-setup-item">
                                                <div className="cp-left">
                                                    <span className="cp-dot" />
                                                    <input
                                                        type="text"
                                                        value={cp.name}
                                                        className="cp-name-input"
                                                        onChange={(e) => {
                                                            const newCPs = [...checkpoints];
                                                            newCPs[idx].name = e.target.value;
                                                            setCheckpoints(newCPs);
                                                        }}
                                                    />
                                                </div>
                                                <div className="cp-right">
                                                    <input
                                                        type="number"
                                                        value={cp.km}
                                                        className="cp-km-input"
                                                        onChange={(e) => {
                                                            const newCPs = [...checkpoints];
                                                            newCPs[idx].km = parseFloat(e.target.value) || 0;
                                                            setCheckpoints(newCPs);
                                                        }}
                                                    />
                                                    <span className="cp-unit">KM</span>
                                                    <button className="cp-remove-btn" onClick={() => setCheckpoints(checkpoints.filter(item => item.id !== cp.id))}>✕</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="add-cp-btn" onClick={() => setCheckpoints([...checkpoints, { id: Date.now(), name: `CP ${checkpoints.length + 1}`, km: 0 }])}>
                                        + Add Checkpoint
                                    </button>

                                    <div className="cp-setup-item finish-line" style={{ marginTop: '1rem' }}>
                                        <div className="cp-left">
                                            <span className="cp-dot checker" />
                                            <span className="cp-name">🏁 Finish Line</span>
                                        </div>
                                        <div className="cp-right">
                                            <input type="number" defaultValue={selectedRoute?.dist || 207} className="cp-km-input" style={{ width: 80 }} />
                                            <span className="cp-unit">KM</span>
                                        </div>
                                    </div>
                                </div>

                                <button className="start-race-btn" onClick={() => startJourney(selectedCategory, rideMode, selectedRoute)}>
                                    START RACE JOURNEY
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
