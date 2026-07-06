/* =====================================================
   LANYARD BADGE — 2D swinging ID badge
   Pure CSS transform + vanilla rAF damped-pendulum physics.
   No three.js / react-three-fiber / rapier / wasm.

   Implements SPEC sections 4 (physics/drag), 5 (performance),
   and the error/edge-case checklist (section 7).
   ===================================================== */
(function () {
    'use strict';

    const pivot = document.getElementById('lanyardPivot');
    const swing = document.getElementById('lanyardSwing');
    const card  = document.getElementById('lanyardCard');
    if (!pivot || !swing || !card) return;

    /* ---------- config ---------- */
    const GRAVITY        = 900;      // px/s^2 equivalent, tuned for feel
    const LENGTH          = 220;     // px, pendulum "length" for the model (matches string length)
    const DAMPING_PER_SEC = 0.55;    // fraction of velocity lost per second (time-corrected)
    const MAX_ANGLE_DEG   = 35;      // clamp range, error-checklist #2
    const SLEEP_ANGLE_EPS = 0.15;    // deg
    const SLEEP_VEL_EPS   = 0.6;     // deg/s
    const SLEEP_FRAMES    = 60;      // ~1s at 60fps, but measured in time below
    const SLEEP_TIME_MS   = 1000;
    const IDLE_SWING_MIN_MS = 8000;
    const IDLE_SWING_MAX_MS = 15000;
    const IDLE_IMPULSE_DEG  = 12;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- state ---------- */
    let angle = 0;          // degrees
    let angularVel = 0;     // degrees / second
    let dragging = false;
    let lastPointerAngle = 0;
    let lastPointerTime = 0;
    let rafId = null;
    let running = false;
    let restTimerStart = null;
    let idleTimeoutId = null;
    let isInViewport = true;
    let isTabVisible = document.visibilityState !== 'hidden';
    let activePointerId = null;

    /* ---------- helpers ---------- */
    function clampAngle(a) {
        return Math.max(-MAX_ANGLE_DEG, Math.min(MAX_ANGLE_DEG, a));
    }

    function render() {
        swing.style.transform = `rotate(${angle}deg)`;
    }

    function setWillChange(on) {
        card.style.willChange = on ? 'transform' : 'auto';
        swing.style.willChange = on ? 'transform' : 'auto';
    }

    /* ---------- physics loop (damped pendulum, section 4.1) ---------- */
    let lastFrameTime = null;

    function step(timestamp) {
        if (!running) return;

        if (lastFrameTime === null) lastFrameTime = timestamp;
        let dt = (timestamp - lastFrameTime) / 1000; // seconds, real measured deltaTime
        lastFrameTime = timestamp;
        // guard against huge dt spikes (tab was backgrounded briefly, etc.)
        if (dt > 0.05) dt = 0.05;

        if (!dragging) {
            const angleRad = (angle * Math.PI) / 180;
            const angularAccelRad = -(GRAVITY / LENGTH) * Math.sin(angleRad);
            const angularAccelDeg = (angularAccelRad * 180) / Math.PI;

            angularVel += angularAccelDeg * dt;

            // time-corrected damping: fraction retained per second, applied per dt
            const dampingFactor = Math.pow(1 - DAMPING_PER_SEC, dt);
            angularVel *= dampingFactor;

            angle += angularVel * dt;
            angle = clampAngle(angle);

            render();

            // sleep detection (section 4.3)
            if (Math.abs(angularVel) < SLEEP_VEL_EPS && Math.abs(angle) < SLEEP_ANGLE_EPS) {
                if (restTimerStart === null) restTimerStart = timestamp;
                if (timestamp - restTimerStart >= SLEEP_TIME_MS) {
                    angle = 0;
                    angularVel = 0;
                    render();
                    stopLoop();
                    scheduleIdleSwing();
                    return;
                }
            } else {
                restTimerStart = null;
            }
        }

        rafId = requestAnimationFrame(step);
    }

    function startLoop() {
        if (running) return;
        if (!isInViewport || !isTabVisible) return; // section 5
        running = true;
        lastFrameTime = null;
        setWillChange(true);
        rafId = requestAnimationFrame(step);
    }

    function stopLoop() {
        running = false;
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        setWillChange(false);
    }

    /* ---------- idle auto-swing: cheap timer, not a running loop ---------- */
    function scheduleIdleSwing() {
        if (prefersReducedMotion) return; // section 5 / 12
        clearTimeout(idleTimeoutId);
        const delay = IDLE_SWING_MIN_MS + Math.random() * (IDLE_SWING_MAX_MS - IDLE_SWING_MIN_MS);
        idleTimeoutId = setTimeout(() => {
            if (!dragging && isInViewport && isTabVisible) {
                angularVel += IDLE_IMPULSE_DEG * (Math.random() < 0.5 ? -1 : 1);
                startLoop();
            }
            scheduleIdleSwing();
        }, delay);
    }

    /* ---------- drag handling (section 4.2) ---------- */
    function pivotCenterX() {
        const rect = pivot.getBoundingClientRect();
        return rect.left + rect.width / 2;
    }
    function pivotCenterY() {
        const rect = pivot.getBoundingClientRect();
        return rect.top;
    }

    function angleFromPointer(clientX, clientY) {
        const dx = clientX - pivotCenterX();
        const dy = clientY - pivotCenterY();
        // angle measured from vertical (downward) axis
        const rad = Math.atan2(dx, dy);
        return (rad * 180) / Math.PI;
    }

    function onPointerDown(e) {
        // ignore multi-touch (error-checklist #6)
        if (activePointerId !== null) return;
        if (e.pointerType === 'touch' && e.isPrimary === false) return;

        activePointerId = e.pointerId;
        dragging = true;
        clearTimeout(idleTimeoutId);
        card.classList.add('is-dragging');
        card.setPointerCapture && card.setPointerCapture(e.pointerId);

        lastPointerAngle = clampAngle(angleFromPointer(e.clientX, e.clientY));
        lastPointerTime = performance.now();
        angle = lastPointerAngle;
        render();
        startLoop();

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);
        document.addEventListener('pointerleave', onPointerUp);
    }

    function onPointerMove(e) {
        if (!dragging || e.pointerId !== activePointerId) return;
        const now = performance.now();
        const newAngle = clampAngle(angleFromPointer(e.clientX, e.clientY));
        const dt = Math.max((now - lastPointerTime) / 1000, 1 / 240);

        angularVel = (newAngle - lastPointerAngle) / dt; // deg/s, for release momentum
        angle = newAngle;
        lastPointerAngle = newAngle;
        lastPointerTime = now;
        render();
    }

    function onPointerUp(e) {
        if (e && e.pointerId !== undefined && e.pointerId !== activePointerId) return;
        dragging = false;
        activePointerId = null;
        card.classList.remove('is-dragging');
        restTimerStart = null;

        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);
        document.removeEventListener('pointerleave', onPointerUp);

        if (prefersReducedMotion) {
            angularVel = 0;
            angle = 0;
            render();
            stopLoop();
            return;
        }
        startLoop(); // hand off to physics sim with current angularVel
    }

    card.addEventListener('pointerdown', onPointerDown);

    /* ---------- visibility / viewport pause (section 5) ---------- */
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            isInViewport = entry.isIntersecting;
            if (isInViewport && isTabVisible) {
                if (Math.abs(angularVel) > SLEEP_VEL_EPS || Math.abs(angle) > SLEEP_ANGLE_EPS) {
                    startLoop();
                }
            } else {
                stopLoop();
            }
        });
    }, { threshold: 0 });
    io.observe(pivot);

    function onVisibilityChange() {
        isTabVisible = document.visibilityState !== 'hidden';
        if (isTabVisible && isInViewport) {
            if (Math.abs(angularVel) > SLEEP_VEL_EPS || Math.abs(angle) > SLEEP_ANGLE_EPS) {
                startLoop();
            }
        } else {
            stopLoop();
        }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    /* ---------- reduced motion: static, no idle swing / momentum ---------- */
    if (prefersReducedMotion) {
        angle = 0;
        render();
    } else {
        // brief idle swing on load to signal interactivity, then settle
        angularVel = 6;
        startLoop();
        scheduleIdleSwing();
    }

    /* ---------- cleanup hook (in case this page is ever embedded in an SPA) ---------- */
    window.__lanyardBadgeDestroy = function () {
        stopLoop();
        clearTimeout(idleTimeoutId);
        io.disconnect();
        document.removeEventListener('visibilitychange', onVisibilityChange);
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);
        document.removeEventListener('pointerleave', onPointerUp);
        card.removeEventListener('pointerdown', onPointerDown);
    };
})();
