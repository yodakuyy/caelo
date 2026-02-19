
import sys

path = r'c:\Users\yogi.fermana\Pictures\Caelo\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# recording-center is 238 to 471 (1-indexed) -> 237 to 470 (0-indexed)
# Wait, let's verify line counts from the last view_file.
# 238: <div className="recording-center">
# 471: </div>

start_idx = 237
end_idx = 470

new_content = """                        <div className="recording-center">
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
                                <>
                                    {selectedRoute && (
                                        <div className={`nav-overlay-info ${isNavMinimized ? 'minimized' : ''}`} onClick={() => isNavMinimized && setIsNavMinimized(false)}>
                                            <span className="turn-icon">⬅️</span>
                                            {!isNavMinimized && (
                                                <div className="turn-text">
                                                    <span className="next-turn">Turn Left in 400m</span>
                                                    <span className="street-name">Jl. Raya Bandung</span>
                                                </div>
                                            )}
                                            <button className="btn-nav-toggle" onClick={(e) => { e.stopPropagation(); setIsNavMinimized(!isNavMinimized); }}>
                                                {isNavMinimized ? '▼' : '▲'}
                                            </button>
                                        </div>
                                    )}

                                    <div className="nav-navigation-view">
                                        {!selectedRoute && !hideNavPrompt && (
                                            <div className="no-route-overlay">
                                                <div className="no-route-content">
                                                    <button className="btn-load-route" onClick={() => setShowRouteSelectorDuringRide(true)}>LOAD NEW ROUTE</button>
                                                    <button className="btn-hide-prompt" onClick={() => setHideNavPrompt(true)}>FREE RIDE (HIDE GPS)</button>
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
                                                <rect width="100%" height="100%" fill="rgba(0,0,0,0.1)" />
                                                <rect width="100" height="100" fill="url(#urban-pattern)" />
                                                <g className="map-subgrid">
                                                    {[...Array(10)].map((_, i) => (<line key={`v-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.1" />))}
                                                    {[...Array(10)].map((_, i) => (<line key={`h-${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="rgba(255,255,255,0.03)" strokeWidth="0.1" />))}
                                                </g>
                                                <g className="map-secondary-roads">
                                                    <path d="M0,45 L100,40 M30,0 L35,100 M0,75 Q50,65 100,80 M70,0 C65,40 85,60 80,100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                                                </g>
                                                <path className="path-planned" d="M10,90 C25,85 20,70 35,65 S45,40 65,35 S80,10 90,5" fill="none" stroke="#34ace0" strokeWidth="5" strokeLinecap="round" opacity="0.2" />
                                                <path className="main-route-active" d="M10,90 C25,85 20,70 35,65 S45,40 65,35 S80,10 90,5" fill="none" stroke="#2ed573" strokeWidth="5" strokeLinecap="round" strokeDasharray="200" strokeDashoffset={200 - (distance / (selectedRoute?.dist || 207)) * 200} filter="url(#glow)" />
                                                {rideMode === 'race' && (
                                                    <g className="checkpoints">
                                                        <circle cx="35" cy="65" r="2.5" fill="#ff9f43" stroke="white" strokeWidth="0.5" />
                                                        <circle cx="65" cy="35" r="2.5" fill="#ff9f43" stroke="white" strokeWidth="0.5" />
                                                    </g>
                                                )}
                                                <g transform="translate(90, 5)">
                                                    <circle r="4" fill="rgba(46, 213, 115, 0.2)"><animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" /></circle>
                                                    <path d="M-1,0 L1,0 M0,-1 L0,1" stroke="white" strokeWidth="0.5" />
                                                    <circle r="1.5" fill="#2ed573" />
                                                </g>
                                                <g className="rider-cursor">
                                                    <circle r="8" fill="rgba(255, 71, 87, 0.15)"><animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" /></circle>
                                                    <circle r="3.5" fill="#ff4757" stroke="white" strokeWidth="1" />
                                                    <path d="M0,-8 L0,-5 M8,0 L5,0 M0,8 L0,5 M-8,0 L-5,0" stroke="#ff4757" strokeWidth="0.5" />
                                                    <animateMotion path="M10,90 C25,85 20,70 35,65 S45,40 65,35 S80,10 90,5" dur="120s" rotate="auto" repeatCount="indefinite" />
                                                </g>
                                            </svg>
                                        </div>
                                    </div>
                                </>
                            )}

                            {cockpitMode !== 'nav' && rideMode === 'race' && (() => {
                                const raceCheckpoints = [{ name: 'CP 1', km: 54 }, { name: 'CP 2', km: 101 }, { name: 'CP 3', km: 154 }, { name: 'Finish', km: 207 }];
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
                                            {!isFinished && <div className="ticker-progress-bg"><div className="ticker-progress-bar" style={{ width: `${(distance / nextCP.km) * 100}%` }} /></div>}
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {cockpitMode !== 'nav' && rideMode === 'touring' && (
                                <div className="checkpoint-ticker touring-active">
                                    <span>📍 <b>Day 2</b> of 3</span>
                                    <span style={{ opacity: 0.6 }}>To: Garut City</span>
                                </div>
                            )}

                            {cockpitMode === 'nav' && distance >= 0.1 && distance <= 10 && (
                                <div className="climb-profile-container auto-appear">
                                    <div className="climb-info-header">
                                        <div className="climb-badge"><span className="climb-label">CLIMB 2/4</span><span className="climb-distance">900m to peak</span></div>
                                        <div className="climb-gradient-live"><span className="grad-num">7%</span><span className="grad-sub">GRAD</span></div>
                                    </div>
                                    <div className="elevation-chart-wrapper">
                                        <svg viewBox="0 0 200 60" className="climb-svg">
                                            <defs>
                                                <linearGradient id="climbGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#ff4757" stopOpacity="0.8" /><stop offset="60%" stopColor="#ff9f43" stopOpacity="0.6" /><stop offset="100%" stopColor="#2ed573" stopOpacity="0.2" />
                                                </linearGradient>
                                            </defs>
                                            <path d="M0,60 L0,45 C20,40 35,55 50,35 S80,10 110,25 S150,45 180,40 L200,35 L200,60 Z" fill="url(#climbGradient)" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                                            <g className="rider-climb-position"><circle cx="85" cy="22" r="3" fill="white" stroke="#ff4757" strokeWidth="2"><animate attributeName="r" values="3;5;3" dur="1s" repeatCount="indefinite" /></circle></g>
                                        </svg>
                                        <div className="chart-labels"><span>4km left</span><span>Peak: 1240m</span></div>
                                    </div>
                                </div>
                            )}
                        </div>
"""

new_lines = new_content.splitlines(keepends=True)
lines[start_idx:end_idx+1] = new_lines

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
