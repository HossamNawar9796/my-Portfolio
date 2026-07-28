/**
 * Future Technology Academy - Bowling Challenge JS Engine
 * High-performance, object-oriented tournament automation client.
 */

// Global Game State
const GAME_STATE = {
    players: [], // String values of 7 players
    teams: {
        teamA: [], // Array of objects { name, photo, attempt1, attempt2, total, isBonus }
        teamB: []
    },
    bonusPlayerName: "", // Selected Team B Player for extra frame
    matchSequence: [],   // Array containing index reference elements of player match sequence
    currentStep: 1,      // Track Step flow
    currentMatchIndex: 0,// Track whose turn it is
    audioEnabled: true,  // sound state flag
    isDarkTheme: false   // CSS theme flag
};

// Web Audio Synthesizer Interface
const SoundFX = {
    ctx: null,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    play(freqStart, freqEnd, duration, type = "sine", gainStart = 0.15) {
        if (!GAME_STATE.audioEnabled) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
        if (freqEnd) {
            osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + duration);
        }

        gainNode.gain.setValueAtTime(gainStart, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    playClick() {
        this.play(600, 1200, 0.08, "triangle", 0.2);
    },

    playTick() {
        this.play(800, 400, 0.04, "sine", 0.08);
    },

    playCheer() {
        // Synthesizes a simulated crowd noise cheer
        if (!GAME_STATE.audioEnabled) return;
        this.init();

        const bufferSize = this.ctx.sampleRate * 1.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(1000, this.ctx.currentTime);
        noiseFilter.frequency.exponentialRampToValueAtTime(1600, this.ctx.currentTime + 1.2);

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

        noise.connect(noiseFilter);
        noiseFilter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        noise.start();
        noise.stop(this.ctx.currentTime + 1.5);
    },

    playSpinTone(progressRatio) {
        // Plays changing tone mapped to spinning speed progress
        const freq = 150 + (1 - progressRatio) * 600;
        this.play(freq, freq - 50, 0.06, "sawtooth", 0.05);
    },

    playStrikeSfx() {
        // Deep roll sound followed by heavy impact crash
        this.play(120, 60, 0.4, "sine", 0.3); // Ball rolling rumble
        setTimeout(() => {
            this.play(200, 10, 0.6, "triangle", 0.4); // Exploding crash
            this.playCheer();
        }, 400);
    },

    playSpareSfx() {
        // Bright chimes
        this.play(880, 1760, 0.2, "sine", 0.2);
        setTimeout(() => {
            this.play(1320, 2640, 0.25, "sine", 0.2);
            this.playCheer();
        }, 120);
    },

    playFanfare() {
        // Victory song sequence
        const now = this.ctx?.currentTime || 0;
        const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25];
        const times = [0, 0.15, 0.3, 0.45, 0.65, 0.85];
        
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.play(freq, freq, 0.35, "sine", 0.15);
            }, times[idx] * 1000);
        });
    }
};

// Canvas Effects Engines (Confetti, Fireworks)
const FXEngine = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,

    init() {
        this.canvas = document.getElementById("fx-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.resize();
        window.addEventListener("resize", () => this.resize());
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    spawnConfetti(durationMs = 2000) {
        const colors = ["#ff4757", "#2ed573", "#1e90ff", "#ffa502", "#ff007f", "#00d2ff"];
        const end = Date.now() + durationMs;

        const addParticles = () => {
            if (Date.now() > end) return;
            for (let i = 0; i < 6; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: -10,
                    size: Math.random() * 8 + 6,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    speedY: Math.random() * 4 + 3,
                    speedX: Math.random() * 2 - 1,
                    rot: Math.random() * 360,
                    rotSpeed: Math.random() * 5 - 2.5
                });
            }
            requestAnimationFrame(addParticles);
        };

        addParticles();
        this.startLoop();
    },

    spawnFireworks() {
        const colors = ["#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#FF007F"];
        for (let burst = 0; idx = 5, burst < 5; burst++) {
            setTimeout(() => {
                const targetX = Math.random() * (this.canvas.width - 200) + 100;
                const targetY = Math.random() * (this.canvas.height / 2);
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                for (let i = 0; i < 40; i++) {
                    const angle = (Math.PI * 2 / 40) * i;
                    const velocity = Math.random() * 6 + 2;
                    this.particles.push({
                        x: targetX,
                        y: targetY,
                        size: Math.random() * 4 + 3,
                        color: color,
                        speedX: Math.cos(angle) * velocity,
                        speedY: Math.sin(angle) * velocity,
                        alpha: 1,
                        decay: Math.random() * 0.015 + 0.01
                    });
                }
            }, burst * 350);
        }
        this.startLoop();
    },

    startLoop() {
        if (!this.animationId) {
            this.loop();
        }
    },

    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            if (p.alpha !== undefined) {
                // Firework particle behavior
                p.x += p.speedX;
                p.y += p.speedY;
                p.speedY += 0.05; // gravity simulation
                p.alpha -= p.decay;
                
                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }
                
                this.ctx.save();
                this.ctx.globalAlpha = p.alpha;
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            } else {
                // Confetti particle behavior
                p.y += p.speedY;
                p.x += p.speedX;
                p.rot += p.rotSpeed;

                if (p.y > this.canvas.height) {
                    this.particles.splice(i, 1);
                    continue;
                }

                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.rot * Math.PI) / 180);
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                this.ctx.restore();
            }
        }

        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.loop());
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.animationId = null;
        }
    }
};

// Spinning Wheel Component Code
const SpinWheel = {
    canvas: null,
    ctx: null,
    slices: [],
    currentRotation: 0,
    isSpinning: false,

    init() {
        this.canvas = document.getElementById("wheel-canvas");
        this.ctx = this.canvas.getContext("2d");
    },

    setSlices(namesList) {
        this.slices = [...namesList];
        this.draw();
    },

    draw() {
        const size = this.canvas.width;
        const radius = size / 2;
        this.ctx.clearRect(0, 0, size, size);

        if (this.slices.length === 0) {
            // Draw Empty State Wheel
            this.ctx.fillStyle = "rgba(100,100,100,0.1)";
            this.ctx.beginPath();
            this.ctx.arc(radius, radius, radius - 10, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = GAME_STATE.isDarkTheme ? "#FFF" : "#1d3557";
            this.ctx.font = "bold 16px Fredoka";
            this.ctx.textAlign = "center";
            this.ctx.fillText("All players selected!", radius, radius);
            return;
        }

        const angleStep = (Math.PI * 2) / this.slices.length;
        const colors = ["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#8338EC", "#FF007F", "#3A86C8"];

        this.ctx.save();
        this.ctx.translate(radius, radius);
        this.ctx.rotate(this.currentRotation);

        for (let i = 0; i < this.slices.length; i++) {
            const startAngle = i * angleStep;
            const endAngle = startAngle + angleStep;

            // Draw pie slice segment
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, radius - 10, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = colors[i % colors.length];
            this.ctx.fill();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "#FFFFFF";
            this.ctx.stroke();

            // Draw slice text label
            this.ctx.save();
            this.ctx.rotate(startAngle + angleStep / 2);
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.font = "bold 14px Fredoka";
            this.ctx.textAlign = "right";
            this.ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
            this.ctx.shadowBlur = 4;
            this.ctx.fillText(this.slices[i], radius - 25, 5);
            this.ctx.restore();
        }

        // Draw center cap pin
        this.ctx.restore();
        this.ctx.beginPath();
        this.ctx.arc(radius, radius, 14, 0, Math.PI * 2);
        this.ctx.fillStyle = "#FFF";
        this.ctx.fill();
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = "#1d3557";
        this.ctx.stroke();
    },

    spin(onWinnerSelected) {
        if (this.isSpinning || this.slices.length === 0) return;
        this.isSpinning = true;
        SoundFX.playClick();

        let spinSpeed = Math.random() * 0.3 + 0.25; // Random starting rotational speed
        const deceleration = 0.985;                 // Smooth decay friction
        let totalSpinTicks = 0;

        const updateSpin = () => {
            this.currentRotation += spinSpeed;
            spinSpeed *= deceleration;
            totalSpinTicks++;

            // Tick noise as slots spin past
            if (totalSpinTicks % 4 === 0 && spinSpeed > 0.05) {
                const ratio = Math.min(totalSpinTicks / 200, 1);
                SoundFX.playSpinTone(ratio);
            }

            this.draw();

            if (spinSpeed > 0.002) {
                requestAnimationFrame(updateSpin);
            } else {
                this.isSpinning = false;
                
                // Calculate accurate index mathematically at top (pointer at 270 deg / 1.5 * PI)
                const angleStep = (Math.PI * 2) / this.slices.length;
                let normalizedRotation = (1.5 * Math.PI - this.currentRotation) % (Math.PI * 2);
                if (normalizedRotation < 0) normalizedRotation += Math.PI * 2;

                const selectedIdx = Math.floor(normalizedRotation / angleStep) % this.slices.length;
                const winnerName = this.slices[selectedIdx];
                
                onWinnerSelected(winnerName, selectedIdx);
            }
        };

        updateSpin();
    }
};

// Live Camera & Photo Snapshot Engine
const VideoBooth = {
    activeStream: null,
    targetPlayerObject: null,
    targetImgElement: null,

    openCamera(playerObj, targetImgEl) {
        this.targetPlayerObject = playerObj;
        this.targetImgElement = targetImgEl;

        const modal = document.getElementById("camera-modal");
        const video = document.getElementById("webcam-feed");
        modal.classList.remove("hidden");

        navigator.mediaDevices.getUserMedia({
            video: { width: 300, height: 300, facingMode: "user" },
            audio: false
        })
        .then(stream => {
            this.activeStream = stream;
            video.srcObject = stream;
        })
        .catch(err => {
            console.warn("Camera failed to load, fallback to default profile pictures", err);
            alert("No webcam detected! Setting a fun robot avatar instead.");
            this.setPlaceholderAvatar();
            this.close();
        });
    },

    capture() {
        if (!this.activeStream) return;
        
        const video = document.getElementById("webcam-feed");
        const canvas = document.getElementById("snapshot-canvas");
        const ctx = canvas.getContext("2d");

        // Take crop photo matching avatar size proportions
        ctx.save();
        ctx.scale(-1, 1); // Flip horizontally for natural mirrors
        ctx.drawImage(video, -320, 0, 320, 240);
        ctx.restore();

        const dataUrl = canvas.toDataURL("image/png");
        this.targetPlayerObject.photo = dataUrl;
        this.targetImgElement.src = dataUrl;
        
        SoundFX.playSpareSfx();
        this.close();
    },

    setPlaceholderAvatar() {
        // High quality programmatic cute robot SVG fallback
        const index = Math.floor(Math.random() * 100);
        const placeholderSvg = `https://api.dicebear.com/7.x/bottts/svg?seed=${this.targetPlayerObject.name}${index}`;
        this.targetPlayerObject.photo = placeholderSvg;
        this.targetImgElement.src = placeholderSvg;
    },

    close() {
        if (this.activeStream) {
            this.activeStream.getTracks().forEach(track => track.stop());
            this.activeStream = null;
        }
        document.getElementById("camera-modal").classList.add("hidden");
    }
};

// UI and Navigation Flow Controller
const AppController = {
    init() {
        this.bindEvents();
        FXEngine.init();
        SpinWheel.init();
        this.loadState();
        this.syncStepIndicator();
    },

    bindEvents() {
        // App header Controls
        document.getElementById("btn-theme").addEventListener("click", () => this.toggleTheme());
        document.getElementById("btn-sound").addEventListener("click", () => this.toggleSound());
        document.getElementById("btn-fullscreen").addEventListener("click", () => this.toggleFullscreen());
        document.getElementById("btn-reset").addEventListener("click", () => this.resetTournament());

        // Step 1 buttons
        document.getElementById("btn-start-tournament").addEventListener("click", () => {
            SoundFX.playClick();
            this.goToStep(1);
        });
        document.getElementById("btn-confirm-players").addEventListener("click", () => this.validateAndRegisterPlayers());

        // Step 2 wheel button
        document.getElementById("btn-spin-wheel").addEventListener("click", () => this.triggerWheelSpin());

        // Step 3 layout buttons
        document.getElementById("extra-player-select").addEventListener("change", (e) => {
            GAME_STATE.bonusPlayerName = e.target.value;
            this.renderPhotoSetupScreen(); // re-render to apply badge updates
            this.saveState();
        });
        document.getElementById("btn-proceed-match").addEventListener("click", () => this.prepAndLaunchMatchMode());

        // Step 4 score entry
        document.getElementById("btn-submit-score").addEventListener("click", () => this.processSubmittedScore());

        // Step 5 print and play again
        document.getElementById("btn-print-certificate").addEventListener("click", () => window.print());
        document.getElementById("btn-play-again").addEventListener("click", () => this.resetTournament());

        // Camera trigger hooks
        document.getElementById("btn-camera-snap").addEventListener("click", () => VideoBooth.capture());
        document.getElementById("btn-camera-close").addEventListener("click", () => VideoBooth.close());
    },

    toggleTheme() {
        GAME_STATE.isDarkTheme = !GAME_STATE.isDarkTheme;
        document.documentElement.setAttribute("data-theme", GAME_STATE.isDarkTheme ? "dark" : "light");
        SpinWheel.draw();
        SoundFX.playClick();
    },

    toggleSound() {
        GAME_STATE.audioEnabled = !GAME_STATE.audioEnabled;
        const icon = document.getElementById("sound-icon");
        icon.innerText = GAME_STATE.audioEnabled ? "🔊" : "🔇";
        if (GAME_STATE.audioEnabled) SoundFX.playClick();
    },

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen();
        }
        SoundFX.playClick();
    },

    goToStep(stepNumber) {
        GAME_STATE.currentStep = stepNumber;
        document.querySelectorAll(".screen-panel").forEach(panel => panel.classList.remove("active"));
        
        const panelMap = ["screen-intro", "screen-step1", "screen-step2", "screen-step3", "screen-step4", "screen-step5"];
        document.getElementById(panelMap[stepNumber]).classList.add("active");

        // Sync Leaderboard Visibility - active only in play and victory modes
        const lb = document.getElementById("live-leaderboard");
        if (stepNumber >= 3) {
            lb.classList.remove("hidden");
        } else {
            lb.classList.add("hidden");
        }

        this.syncStepIndicator();
        this.saveState();
    },

    syncStepIndicator() {
        const stepFillWidths = [0, 0, 25, 50, 75, 100];
        document.getElementById("progress-fill").style.width = `${stepFillWidths[GAME_STATE.currentStep]}%`;

        for (let i = 1; i <= 5; i++) {
            const node = document.getElementById(`step-node-${i}`);
            node.classList.remove("active", "completed");
            if (i === GAME_STATE.currentStep) {
                node.classList.add("active");
            } else if (i < GAME_STATE.currentStep) {
                node.classList.add("completed");
            }
        }
    },

    validateAndRegisterPlayers() {
        SoundFX.playClick();
        const rawPlayers = [];
        for (let i = 1; i <= 7; i++) {
            const val = document.getElementById(`p${i}`).value.trim();
            if (!val) {
                alert(`Please enter a name for Player ${i}!`);
                return;
            }
            rawPlayers.push(val);
        }

        GAME_STATE.players = rawPlayers;
        GAME_STATE.teams = { teamA: [], teamB: [] }; // reset teams allocations

        // Setup Spin Wheel parameters with copy list
        SpinWheel.setSlices(rawPlayers);
        
        // Setup initial clean display
        document.getElementById("team-a-list").innerHTML = `<div class="empty-placeholder">Spin wheel to assign players!</div>`;
        document.getElementById("team-b-list").innerHTML = `<div class="empty-placeholder">Spin wheel to assign players!</div>`;

        this.goToStep(2);
    },

    triggerWheelSpin() {
        if (SpinWheel.slices.length === 0) {
            this.goToStep(3);
            return;
        }

        document.getElementById("btn-spin-wheel").disabled = true;

        SpinWheel.spin((winnerName, winnerIndex) => {
            // Allocate winner into respective teams
            if (GAME_STATE.teams.teamA.length < 4) {
                GAME_STATE.teams.teamA.push({
                    name: winnerName,
                    photo: `https://api.dicebear.com/7.x/bottts/svg?seed=${winnerName}`,
                    attempt1: null,
                    attempt2: null,
                    total: 0
                });
            } else {
                GAME_STATE.teams.teamB.push({
                    name: winnerName,
                    photo: `https://api.dicebear.com/7.x/bottts/svg?seed=${winnerName}`,
                    attempt1: null,
                    attempt2: null,
                    total: 0
                });
            }

            // Remove player from wheel selection options
            SpinWheel.slices.splice(winnerIndex, 1);
            SpinWheel.draw();

            // Refresh UI components of allocations
            this.renderTeamAllocationLists();
            SoundFX.playCheer();
            FXEngine.spawnConfetti(1000);

            document.getElementById("btn-spin-wheel").disabled = false;

            // Trigger auto graduation to Photo Booth if pool empty
            if (SpinWheel.slices.length === 0) {
                setTimeout(() => {
                    alert("Tournament allocations finished! Team Alpha and Team Beta are ready!");
                    
                    // Setup default extra player as the first of Team B
                    GAME_STATE.bonusPlayerName = GAME_STATE.teams.teamB[0].name;

                    this.renderPhotoSetupScreen();
                    this.goToStep(3);
                }, 1000);
            }
        });
    },

    renderTeamAllocationLists() {
        const listA = document.getElementById("team-a-list");
        const listB = document.getElementById("team-b-list");

        listA.innerHTML = GAME_STATE.teams.teamA.map(p => `
            <div class="allocated-player">🔴 ${p.name}</div>
        `).join("") || `<div class="empty-placeholder">Awaiting players...</div>`;

        listB.innerHTML = GAME_STATE.teams.teamB.map(p => `
            <div class="allocated-player">🔵 ${p.name}</div>
        `).join("") || `<div class="empty-placeholder">Awaiting players...</div>`;
    },

    renderPhotoSetupScreen() {
        // Load the dropdown list selector for the Team B bonus frame
        const selectNode = document.getElementById("extra-player-select");
        selectNode.innerHTML = GAME_STATE.teams.teamB.map(p => `
            <option value="${p.name}" ${p.name === GAME_STATE.bonusPlayerName ? "selected" : ""}>${p.name}</option>
        `).join("");

        const buildCardHtml = (p, isTeamA) => {
            const isBonus = !isTeamA && p.name === GAME_STATE.bonusPlayerName;
            return `
                <div class="player-row-card ${isTeamA ? "team-a-card" : "team-b-card"}">
                    <div class="player-card-left">
                        <div class="p-avatar-wrapper">
                            <img src="${p.photo}" class="p-avatar-img" id="photo-img-${p.name.replace(/\s+/g, '')}" alt="Avatar">
                            <div class="player-robot-border"></div>
                        </div>
                        <div class="player-info-meta">
                            <span class="player-name-txt">${p.name}</span>
                            <span class="player-badge-status ${isBonus ? "bonus-player-badge" : ""}">
                                ${isBonus ? "⭐ Bonus Player" : "Ready to Play"}
                            </span>
                        </div>
                    </div>
                    <button class="camera-trigger-btn" onclick="AppController.launchCameraFeed('${p.name}', '${isTeamA ? "teamA" : "teamB"}')">
                        📷 Photo
                    </button>
                </div>
            `;
        };

        document.getElementById("team-a-photos").innerHTML = GAME_STATE.teams.teamA.map(p => buildCardHtml(p, true)).join("");
        document.getElementById("team-b-photos").innerHTML = GAME_STATE.teams.teamB.map(p => buildCardHtml(p, false)).join("");
    },

    launchCameraFeed(playerName, teamKey) {
        SoundFX.playClick();
        const pObj = GAME_STATE.teams[teamKey].find(item => item.name === playerName);
        const imgNode = document.getElementById(`photo-img-${playerName.replace(/\s+/g, '')}`);
        VideoBooth.openCamera(pObj, imgNode);
    },

    prepAndLaunchMatchMode() {
        SoundFX.playClick();
        
        // Prepare match play order: Alternate Team Alpha and Team Beta
        GAME_STATE.matchSequence = [];
        const maxLen = Math.max(GAME_STATE.teams.teamA.length, GAME_STATE.teams.teamB.length);

        for (let i = 0; i < maxLen; i++) {
            if (GAME_STATE.teams.teamA[i]) {
                GAME_STATE.matchSequence.push({ team: "teamA", index: i });
            }
            if (GAME_STATE.teams.teamB[i]) {
                GAME_STATE.matchSequence.push({ team: "teamB", index: i });
            }
        }

        // Check if Team B extra player needs to be appended
        if (GAME_STATE.bonusPlayerName) {
            const bonusIdx = GAME_STATE.teams.teamB.findIndex(p => p.name === GAME_STATE.bonusPlayerName);
            if (bonusIdx !== -1) {
                // Add duplicate bonus match turn
                GAME_STATE.matchSequence.push({ team: "teamB", index: bonusIdx, isExtraRound: true });
            }
        }

        GAME_STATE.currentMatchIndex = 0;
        this.updateLiveLeaderboards();
        this.goToStep(4);
        this.initiatePlayerTurn();
    },

    initiatePlayerTurn() {
        if (GAME_STATE.currentMatchIndex >= GAME_STATE.matchSequence.length) {
            this.completeTournamentMatch();
            return;
        }

        const currentTurn = GAME_STATE.matchSequence[GAME_STATE.currentMatchIndex];
        let pObj = GAME_STATE.teams[currentTurn.team][currentTurn.index];

        // Clean values in input forms
        document.getElementById("score-att-1").value = "";
        document.getElementById("score-att-2").value = "";
        document.getElementById("score-att-2").disabled = false;

        // Setup active HUD info indicators
        document.getElementById("arena-player-name").innerText = pObj.name + (currentTurn.isExtraRound ? " (Bonus Roll!)" : "");
        document.getElementById("arena-player-team").innerText = currentTurn.team === "teamA" ? "Team Alpha" : "Team Beta";
        document.getElementById("arena-photo").src = pObj.photo;

        // Turn indicators color adjustments
        const cardNode = document.getElementById("arena-player-card");
        if (currentTurn.team === "teamA") {
            cardNode.style.borderColor = "var(--accent-red)";
            cardNode.style.boxShadow = "0 0 35px var(--accent-red)";
        } else {
            cardNode.style.borderColor = "var(--accent-blue)";
            cardNode.style.boxShadow = "0 0 35px var(--accent-blue)";
        }

        // Set turn banner indicator state
        const bannerTxt = currentTurn.isExtraRound ? "⭐ BONUS TURN!" : "🎳 YOUR TURN!";
        document.querySelector(".arena-turn-indicator").innerText = bannerTxt;

        // Trigger Countdown animation (3.. 2.. 1.. GO!)
        const cntNode = document.getElementById("match-countdown");
        cntNode.classList.remove("hidden");
        
        let count = 3;
        cntNode.innerText = count;
        SoundFX.playTick();

        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                cntNode.innerText = count;
                SoundFX.playTick();
            } else if (count === 0) {
                cntNode.innerText = "GO!";
                SoundFX.play(900, 1800, 0.15, "triangle");
            } else {
                clearInterval(timer);
                cntNode.classList.add("hidden");
            }
        }, 500);

        this.renderMatchScoreTables();
    },

    processSubmittedScore() {
        const currentTurn = GAME_STATE.matchSequence[GAME_STATE.currentMatchIndex];
        let pObj = GAME_STATE.teams[currentTurn.team][currentTurn.index];

        const att1Val = parseInt(document.getElementById("score-att-1").value) || 0;
        const att2Val = parseInt(document.getElementById("score-att-2").value) || 0;

        // Validations of logical inputs
        if (att1Val < 0 || att1Val > 10 || att2Val < 0 || att2Val > 10) {
            alert("Each roll attempt must be a number between 0 and 10!");
            return;
        }

        if (att1Val + att2Val > 10) {
            alert("The total of both attempts cannot exceed 10 pins!");
            return;
        }

        // Apply scoring properties
        let frameScore = att1Val + att2Val;

        if (currentTurn.isExtraRound) {
            // Apply bonus frames separately so they accumulate directly to score
            pObj.total += frameScore;
        } else {
            pObj.attempt1 = att1Val;
            pObj.attempt2 = att2Val;
            pObj.total = frameScore;
        }

        this.updateLiveLeaderboards();

        // Trigger Animations
        if (att1Val === 10) {
            // Strike triggered!
            this.triggerExplosionAnimation("strike");
        } else if (att1Val + att2Val === 10) {
            // Spare triggered!
            this.triggerExplosionAnimation("spare");
        } else {
            // Normal shot
            SoundFX.playCheer();
            this.showMotivationalText();
            this.advanceMatchStep();
        }
    },

    triggerExplosionAnimation(type) {
        const overlay = document.getElementById(type === "strike" ? "overlay-strike" : "overlay-spare");
        overlay.classList.remove("hidden");

        if (type === "strike") {
            SoundFX.playStrikeSfx();
            FXEngine.spawnFireworks();
        } else {
            SoundFX.playSpareSfx();
            FXEngine.spawnConfetti(2000);
        }

        setTimeout(() => {
            overlay.classList.add("hidden");
            this.advanceMatchStep();
        }, 2200);
    },

    advanceMatchStep() {
        GAME_STATE.currentMatchIndex++;
        this.initiatePlayerTurn();
    },

    showMotivationalText() {
        const phrases = ["Amazing!", "Fantastic!", "Great Shot!", "Robot Power!", "Keep Going!", "Cool Rolling!"];
        const rnd = phrases[Math.floor(Math.random() * phrases.length)];
        const node = document.getElementById("motivational-message");
        node.innerText = rnd;
    },

    updateLiveLeaderboards() {
        let scoreA = 0;
        let scoreB = 0;

        GAME_STATE.teams.teamA.forEach(p => scoreA += p.total);
        GAME_STATE.teams.teamB.forEach(p => scoreB += p.total);

        // Update HUD Floating values
        document.getElementById("lbl-score-a").innerText = scoreA;
        document.getElementById("lbl-score-b").innerText = scoreB;

        // Apply visual glows to leading team
        const widgetA = document.getElementById("lbl-team-a");
        const widgetB = document.getElementById("lbl-team-b");
        
        widgetA.style.textShadow = "none";
        widgetB.style.textShadow = "none";

        if (scoreA > scoreB) {
            widgetA.style.textShadow = "0 0 10px rgba(255, 71, 87, 0.8)";
        } else if (scoreB > scoreA) {
            widgetB.style.textShadow = "0 0 10px rgba(0, 210, 255, 0.8)";
        }

        // Update Match Page HUD Energy tracks
        const maxScoreA = 4 * 10;
        const maxScoreB = 3 * 10 + 10; // includes 4th frame turn bonus

        const pctA = Math.min((scoreA / maxScoreA) * 100, 100);
        const pctB = Math.min((scoreB / maxScoreB) * 100, 100);

        document.getElementById("energy-bar-a").style.width = `${pctA}%`;
        document.getElementById("energy-bar-b").style.width = `${pctB}%`;
    },

    renderMatchScoreTables() {
        const buildTableRowsHtml = (teamKey) => {
            return GAME_STATE.teams[teamKey].map((p, idx) => {
                const currentTurn = GAME_STATE.matchSequence[GAME_STATE.currentMatchIndex];
                const isActive = currentTurn && currentTurn.team === teamKey && currentTurn.index === idx;
                
                return `
                    <tr class="${isActive ? "active-scorer-row" : ""}">
                        <td>${p.name}</td>
                        <td>${p.attempt1 !== null ? p.attempt1 : "-"}</td>
                        <td>${p.attempt2 !== null ? p.attempt2 : "-"}</td>
                        <td><strong>${p.total}</strong></td>
                    </tr>
                `;
            }).join("");
        };

        document.querySelector("#table-score-a tbody").innerHTML = buildTableRowsHtml("teamA");
        document.querySelector("#table-score-b tbody").innerHTML = buildTableRowsHtml("teamB");
    },

    completeTournamentMatch() {
        // Compile stats and show celebration stage
        this.renderCelebrationScreen();
        this.goToStep(5);

        // Fun fanfare trigger
        SoundFX.playFanfare();
        FXEngine.spawnFireworks();
        FXEngine.spawnConfetti(5000);
    },

    renderCelebrationScreen() {
        let scoreA = 0;
        let scoreB = 0;

        GAME_STATE.teams.teamA.forEach(p => scoreA += p.total);
        GAME_STATE.teams.teamB.forEach(p => scoreB += p.total);

        // 1. Declare winning team
        const bannerNode = document.getElementById("champion-team-announcement");
        let winnerName = "";
        
        if (scoreA > scoreB) {
            bannerNode.innerText = "TEAM ALPHA WINS! 🏆";
            bannerNode.style.background = "linear-gradient(135deg, var(--accent-red), var(--accent-gold))";
            bannerNode.style.webkitBackgroundClip = "text";
            winnerName = "TEAM ALPHA";
        } else if (scoreB > scoreA) {
            bannerNode.innerText = "TEAM BETA WINS! 🏆";
            bannerNode.style.background = "linear-gradient(135deg, var(--accent-blue), var(--accent-gold))";
            bannerNode.style.webkitBackgroundClip = "text";
            winnerName = "TEAM BETA";
        } else {
            bannerNode.innerText = "ITS A DRAW! 🤝";
            bannerNode.style.color = "var(--text-color)";
            winnerName = "TEAM ALPHA & TEAM BETA";
        }

        // 2. Populate Certificate details
        document.getElementById("cert-winner-team-name").innerText = winnerName;
        const now = new Date();
        document.getElementById("cert-current-date").innerText = now.toLocaleDateString("en-US", { month: 'long', year: 'numeric', day: 'numeric' });

        // 3. Compile individual leaderboards podium (top 3 players)
        const allPlayers = [];
        GAME_STATE.teams.teamA.forEach(p => allPlayers.push({ ...p, team: "Alpha" }));
        GAME_STATE.teams.teamB.forEach(p => allPlayers.push({ ...p, team: "Beta" }));

        // Sort desc
        allPlayers.sort((x, y) => y.total - x.total);

        const renderPodiumSpot = (spotNum, playerObj) => {
            if (playerObj) {
                document.getElementById(`podium-photo-${spotNum}`).innerHTML = `<img src="${playerObj.photo}" alt="Winner">`;
                document.getElementById(`podium-name-${spotNum}`).innerText = playerObj.name;
                document.getElementById(`podium-score-${spotNum}`).innerText = `${playerObj.total} pts`;
            } else {
                document.getElementById(`podium-photo-${spotNum}`).innerHTML = `👤`;
                document.getElementById(`podium-name-${spotNum}`).innerText = "-";
                document.getElementById(`podium-score-${spotNum}`).innerText = "0 pts";
            }
        };

        renderPodiumSpot(1, allPlayers[0]);
        renderPodiumSpot(2, allPlayers[1]);
        renderPodiumSpot(3, allPlayers[2]);

        // 4. Update Stats metrics
        const highestScore = allPlayers[0] ? allPlayers[0].total : 0;
        let totalPins = 0;
        allPlayers.forEach(p => totalPins += p.total);
        const avgScore = (totalPins / 7).toFixed(1);

        document.getElementById("stat-high-score").innerText = highestScore;
        document.getElementById("stat-total-pins").innerText = totalPins;
        document.getElementById("stat-avg-score").innerText = avgScore;
        
        // Dynamic cool photo snapshot thumbnail display
        if (allPlayers[0] && allPlayers[0].photo) {
            document.getElementById("stat-best-photo").innerHTML = `<img src="${allPlayers[0].photo}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        }
    },

    resetTournament() {
        if (confirm("Are you sure you want to reset the current tournament? All scores and camera photos will be lost!")) {
            localStorage.removeItem("FTA_BOWLING_TOURNAMENT_STATE");
            
            // reset structure
            GAME_STATE.players = [];
            GAME_STATE.teams = { teamA: [], teamB: [] };
            GAME_STATE.bonusPlayerName = "";
            GAME_STATE.matchSequence = [];
            GAME_STATE.currentStep = 1;
            GAME_STATE.currentMatchIndex = 0;

            // Reset Input forms
            for (let i = 1; i <= 7; i++) {
                document.getElementById(`p${i}`).value = "";
            }

            this.goToStep(0); // Return back to Welcome screen!
        }
    },

    saveState() {
        try {
            localStorage.setItem("FTA_BOWLING_TOURNAMENT_STATE", JSON.stringify(GAME_STATE));
        } catch (e) {
            console.error("Local Storage write blocked", e);
        }
    },

    loadState() {
        try {
            const raw = localStorage.getItem("FTA_BOWLING_TOURNAMENT_STATE");
            if (raw) {
                const parsed = JSON.parse(raw);
                Object.assign(GAME_STATE, parsed);

                // Restore Input fields values
                if (GAME_STATE.players && GAME_STATE.players.length === 7) {
                    for (let i = 1; i <= 7; i++) {
                        document.getElementById(`p${i}`).value = GAME_STATE.players[i-1];
                    }
                }

                // If midway through, render and sync components state
                if (GAME_STATE.currentStep === 2) {
                    SpinWheel.setSlices(GAME_STATE.players);
                    this.renderTeamAllocationLists();
                } else if (GAME_STATE.currentStep === 3) {
                    this.renderPhotoSetupScreen();
                } else if (GAME_STATE.currentStep === 4) {
                    this.updateLiveLeaderboards();
                    this.initiatePlayerTurn();
                } else if (GAME_STATE.currentStep === 5) {
                    this.renderCelebrationScreen();
                }

                this.goToStep(GAME_STATE.currentStep);
            }
        } catch (e) {
            console.error("Local Storage read blocked", e);
        }
    }
};

// Start initialization once DOM resources ready
window.addEventListener("DOMContentLoaded", () => AppController.init());