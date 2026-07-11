/* ===================== LOADER — glitch flash ===================== */
window.addEventListener('load', () => {
    const loaderName = document.querySelector('.loader-name');
    let glitchCount = 0;
    const glitchInterval = setInterval(() => {
        if (!loaderName) { clearInterval(glitchInterval); return; }
        loaderName.classList.add('glitch');
        setTimeout(() => loaderName?.classList.remove('glitch'), 80);
        glitchCount++;
        if (glitchCount >= 3) clearInterval(glitchInterval);
    }, 300);

    setTimeout(() => {
        document.getElementById('loader')?.classList.add('done');
    }, 1600);
});

/* ===================== NAVBAR SCROLL ===================== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ===================== MAGNETIC BUTTONS ===================== */
document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) * 0.28;
        const dy = (e.clientY - cy) * 0.28;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = '';
    });
});

/* ===================== PARALLAX ===================== */
let targetScrollY = 0, tScrollY = 0;
function lerp(a, b, t) { return a + (b - a) * t; }
window.addEventListener('scroll', () => { targetScrollY = window.scrollY; }, { passive: true });

const heroBgImg   = document.querySelector('.hero-bg-img');
const heroContent = document.querySelector('.hero-content');
const heroTicker  = document.querySelector('.hero-ticker');
const scrollInd   = document.querySelector('.scroll-indicator');

const isMobile = () => window.innerWidth <= 700;

function parallaxLoop() {
    tScrollY = lerp(tScrollY, targetScrollY, 0.08);
    const s = tScrollY;
    if (!isMobile()) {
        if (heroBgImg)   heroBgImg.style.transform   = `scale(1.12) translateY(${s * 0.25}px)`;
        if (heroContent) heroContent.style.transform  = `translateY(${s * 0.18}px)`;
        if (heroTicker)  heroTicker.style.transform   = `translateY(${s * -0.06}px)`;
        if (scrollInd)   scrollInd.style.opacity      = Math.max(0, 1 - s / 300);
    }
    requestAnimationFrame(parallaxLoop);
}
parallaxLoop();

/* ===================== CHAR SPLIT REVEAL ===================== */
function splitChars(el) {
    if (!el || el.dataset.split) return;
    el.dataset.split = 'true';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = el.innerHTML;
    const counter = { i: 0 };

    function wrapTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const chars = node.textContent.split('');
            const frag = document.createDocumentFragment();
            chars.forEach(ch => {
                const span = document.createElement('span');
                span.className = 'char';
                span.style.setProperty('--ci', counter.i++);
                span.textContent = ch === ' ' ? '\u00A0' : ch;
                frag.appendChild(span);
            });
            node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'EM' || node.tagName === 'MARK' || node.tagName === 'STRONG') {
                // Wrap the whole inline element as one char unit to preserve styling
                node.style.setProperty('--ci', counter.i++);
                node.classList.add('char');
            } else {
                [...node.childNodes].forEach(child => wrapTextNodes(child));
            }
        }
    }

    [...tempDiv.childNodes].forEach(child => wrapTextNodes(child));
    el.innerHTML = '';
    el.appendChild(tempDiv);
}

const splitTitles = document.querySelectorAll('.section-title');
splitTitles.forEach(el => splitChars(el));

/* ===================== STAGGER REVEAL ===================== */
const reveals = document.querySelectorAll('.stagger-reveal');
const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            entry.target.style.transitionDelay = (i % 4) * 0.12 + 's';
            entry.target.classList.add('visible');
            revealObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
reveals.forEach(el => revealObs.observe(el));

/* ===================== CHAR REVEAL ===================== */
const titleObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('chars-visible');
            titleObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });
splitTitles.forEach(el => titleObs.observe(el));

/* Project items already use .stagger-reveal — no extra delay override needed */

/* ===================== GSAP HORIZONTAL PROJECT SCROLL =====================
   Project section pins in place while vertical scroll drives the card track
   horizontally — so you scroll down like normal, but the projects themselves
   move sideways. Falls back to a normal vertical stack on mobile (see CSS). */
gsap.registerPlugin(ScrollTrigger);

function initHorizontalProjects() {
    const wrap = document.querySelector('.project-scroll-wrap');
    const track = document.querySelector('.project-list');
    if (!wrap || !track || window.innerWidth <= 700) return;

    const getScrollDistance = () => track.scrollWidth - wrap.clientWidth;

    gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
            trigger: '#project',
            start: 'top top',
            end: () => `+=${getScrollDistance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1
        }
    });
}
initHorizontalProjects();

/* ===================== SCROLL-LINKED LINE REVEAL (GSAP scrub, "Chinaski" style) =====================
   Splits target text (marked with .scroll-lines) into per-line spans by <br>,
   then scrubs each line's opacity/translateY directly to scroll progress via
   GSAP's ScrollTrigger `scrub`, matching the reference site's pinned text reveal. */
function initScrollLineReveal() {
    const targets = document.querySelectorAll('.scroll-lines');
    targets.forEach(target => {
        if (target.dataset.linesplit) return;
        target.dataset.linesplit = 'true';
        const rawLines = target.innerHTML.split(/<br\s*\/?>/i);
        target.innerHTML = rawLines
            .map(line => `<span class="scroll-line-inner"><span class="scroll-line-content">${line.trim()}</span></span>`)
            .join('');

        const lines = target.querySelectorAll('.scroll-line-content');
        gsap.timeline({
            scrollTrigger: {
                trigger: target,
                start: 'top 90%',
                end: 'top 35%',
                scrub: 0.4
            }
        }).to(lines, {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            ease: 'none'
        });
    });
}
initScrollLineReveal();

/* ===================== ABOUT — POLISHED COMPONENT REVEALS ===================== */
function initAboutReveal() {
    const wrap  = document.querySelector('.about-img-wrap');
    const frame = document.querySelector('.about-img-frame');
    const img   = frame ? frame.querySelector('img') : null;
    const deco  = document.querySelector('.about-img-deco');

    if (frame) {
        // Curtain-wipe reveal — plays once as the photo scrolls into view
        gsap.to(frame, {
            clipPath: 'inset(0% 0 0% 0)',
            duration: 1.1,
            ease: 'power3.inOut',
            scrollTrigger: { trigger: wrap || frame, start: 'top 85%', toggleActions: 'play none none none' }
        });
    }
    if (img) {
        // Subtle parallax on the photo itself as you scroll through About
        gsap.fromTo(img,
            { yPercent: -8 },
            { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: true } }
        );
    }
    if (deco) {
        // Deco frame drifts the opposite way for a light layered-depth feel
        gsap.fromTo(deco,
            { xPercent: 5, yPercent: -5 },
            { xPercent: 0, yPercent: 0, ease: 'none', scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: true } }
        );
    }

    // Tab lists: stagger their items in the first time About comes into view
    document.querySelectorAll('.tab-contents li').forEach((li, i) => {
        gsap.fromTo(li,
            { opacity: 0, x: -16 },
            {
                opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', delay: i * 0.06,
                scrollTrigger: { trigger: '.about-text', start: 'top 75%', toggleActions: 'play none none none' }
            }
        );
    });
}
initAboutReveal();

/* ===================== SECTION NUMBER COUNT-UP ===================== */
document.querySelectorAll('.section-number').forEach(el => {
    const target = parseInt(el.textContent, 10);
    el.textContent = '00';
    const numObs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        numObs.disconnect();
        let current = 0;
        const step = () => {
            current++;
            el.textContent = String(current).padStart(2, '0');
            if (current < target) setTimeout(step, 120);
        };
        step();
    }, { threshold: 0.5 });
    numObs.observe(el);
});

/* ===================== ACTIVE NAV ===================== */
const sections  = document.querySelectorAll('#header, #about, #project, #contact');
const navLinks  = document.querySelectorAll('nav ul li a');
const navObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(a => a.classList.remove('active-nav'));
            const id = entry.target.id || 'header';
            const active = document.querySelector(`nav ul li a[href="#${id}"]`);
            if (active) active.classList.add('active-nav');
        }
    });
}, { threshold: 0.4 });
sections.forEach(s => navObs.observe(s));

/* ===================== TABS ===================== */
var tablinks    = document.getElementsByClassName('tab-links');
var tabcontents = document.getElementsByClassName('tab-contents');
function opentab(tabname, e) {
    for (let t of tablinks)    t.classList.remove('active-link');
    (e?.currentTarget || event?.currentTarget)?.classList.add('active-link');

    const nextTab = document.getElementById(tabname);
    if (!nextTab || nextTab.classList.contains('active-tab')) return;

    for (let t of tabcontents) t.classList.remove('active-tab');
    nextTab.classList.add('active-tab');

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(nextTab.querySelectorAll('li'),
            { opacity: 0, x: -12 },
            { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', stagger: 0.05 }
        );
    }
}

/* ===================== MOBILE MENU ===================== */
var sidemenu = document.getElementById('sidemenu');

var menuBackdrop = document.createElement('div');
menuBackdrop.className = 'menu-backdrop';
document.body.appendChild(menuBackdrop);
menuBackdrop.addEventListener('click', closemenu);

// Prevent background scroll on iOS without moving the page
function preventScroll(e) { e.preventDefault(); }

function openmenu() {
    sidemenu.style.right = '0';
    menuBackdrop.classList.add('visible');
    document.body.addEventListener('touchmove', preventScroll, { passive: false });
}

function closemenu() {
    sidemenu.style.right = '-280px';
    menuBackdrop.classList.remove('visible');
    document.body.removeEventListener('touchmove', preventScroll);
}

/* ===================== TYPING EFFECT ===================== */
const typingEl  = document.getElementById('typing-target');
const texts     = ['Rapeepat', 'Web Dev', 'IoT Eng'];
let ti = 0, ci = 0, deleting = false;
function typeLoop() {
    const cur = texts[ti];
    typingEl.textContent = deleting
        ? cur.substring(0, ci - 1)
        : cur.substring(0, ci + 1);
    deleting ? ci-- : ci++;
    if (!deleting && ci === cur.length) { deleting = true; setTimeout(typeLoop, 2200); return; }
    if (deleting && ci === 0)  { deleting = false; ti = (ti + 1) % texts.length; setTimeout(typeLoop, 400); return; }
    setTimeout(typeLoop, deleting ? 60 : 140);
}
setTimeout(typeLoop, 2800);

/* ===================== VIDEO OBSERVERS ===================== */
document.querySelectorAll('.project-video-wrap video').forEach(v => {
    const obs = new IntersectionObserver(entries => {
        entries[0].isIntersecting ? v.play() : v.pause();
    }, { threshold: 0.3 });
    obs.observe(v);
    v.closest('.project-item').addEventListener('mouseenter', () => { v.playbackRate = 0.65; });
    v.closest('.project-item').addEventListener('mouseleave', () => { v.playbackRate = 1; });
});

/* ===================== SCROLL TO TOP ===================== */
const topBtn = document.createElement('button');
topBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
topBtn.className = 'scroll-to-top btn-main';
topBtn.style.cssText = 'position:fixed;bottom:32px;right:32px;width:48px;height:48px;border-radius:4px;padding:0;justify-content:center;display:none;z-index:900;';
document.body.appendChild(topBtn);
window.addEventListener('scroll', () => { topBtn.style.display = window.scrollY > 400 ? 'flex' : 'none'; });
topBtn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

/* ===================== SMOOTH ANCHOR ===================== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.innerWidth <= 700) closemenu();
    });
});

/* ===================== CONTACT FORM ===================== */
const scriptURL = 'https://script.google.com/macros/s/AKfycbxF-G5xxYav-BECV897Q3qAEpG7oPI8qrEgxj7719G20Vy-o0wCOkfx2m30hlD32hlgCg/exec';
const form = document.forms['submit-to-google-sheet'];
const msg  = document.getElementById('msg');

if (form) {
    const emailInput = form.elements['Email'];
    const nameInput  = form.elements['Name'];

    emailInput?.addEventListener('input', () => {
        const val = emailInput.value;
        const hints = document.querySelectorAll('.email-hint');
        const checks = [
            { el: hints[0], ok: val.includes('@') },
            { el: hints[1], ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) },
        ];
        checks.forEach(({ el, ok }) => {
            if (!el) return;
            el.style.color = ok ? 'rgba(74,222,128,0.85)' : 'var(--clr-muted)';
            el.querySelector('i').className = ok
                ? 'fa-solid fa-circle-check'
                : 'fa-regular fa-circle';
        });
        emailInput.style.borderColor = checks[1].ok
            ? 'rgba(74,222,128,0.5)'
            : val.length > 0 ? 'rgba(239,68,68,0.4)' : '';
    });
    nameInput?.addEventListener('blur', () => {
        nameInput.style.borderColor = nameInput.value.length >= 2 ? 'rgba(74,222,128,0.5)' : 'rgba(239,68,68,0.5)';
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        msg.innerHTML = 'Sending\u2026'; msg.style.color = '#a79930';
        fetch(scriptURL, { method:'POST', body: new FormData(form) })
            .then(() => {
                msg.innerHTML = '\u2713 Message sent!'; msg.style.color = '#4ade80';
                form.reset();
                [emailInput, nameInput].forEach(el => { if(el) el.style.borderColor = ''; });
                setTimeout(() => { msg.innerHTML = ''; }, 5000);
            })
            .catch(() => { msg.innerHTML = '\u2717 Error \u2014 please try again.'; msg.style.color = '#f87171'; });
    });
}

/* ===================== VIDEO MODAL ===================== */
const modal       = document.getElementById('video-modal');
const modalVideo  = document.getElementById('modal-video');
const modalSrc    = document.getElementById('modal-video-src');
const modalIndex  = document.getElementById('modal-index');
const modalTitle  = document.getElementById('modal-title');
const modalDesc   = document.getElementById('modal-desc');
const modalTags   = document.getElementById('modal-tags');
const modalProg   = document.getElementById('modal-progress');
const modalClose  = document.getElementById('modal-close');
const modalBack   = document.getElementById('modal-backdrop');

function openModal(data) {
    modalSrc.src      = data.src;
    modalIndex.textContent = data.index;
    modalTitle.textContent = data.title;
    modalDesc.textContent  = data.desc;
    modalTags.innerHTML = data.tags.map(t => `<span>${t}</span>`).join('');
    modalVideo.load();
    modalVideo.play();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('open');
    modalVideo.pause();
    modalVideo.currentTime = 0;
    modalProg.style.width = '0%';
    document.body.style.overflow = '';
}

modalVideo.addEventListener('timeupdate', () => {
    if (!modalVideo.duration) return;
    modalProg.style.width = (modalVideo.currentTime / modalVideo.duration * 100) + '%';
});

modalClose.addEventListener('click', closeModal);
modalBack.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

document.querySelectorAll('.project-item').forEach(item => {
    const link = item.querySelector('.project-link');
    if (!link) return;
    link.addEventListener('click', e => {
        e.preventDefault();
        const videoEl  = item.querySelector('video source');
        const tags     = [...item.querySelectorAll('.project-tags span')].map(s => s.textContent);
        openModal({
            src:   videoEl?.src || '',
            index: item.querySelector('.project-index')?.textContent || '',
            title: item.querySelector('.project-title')?.textContent || '',
            desc:  item.querySelector('.project-desc')?.textContent  || '',
            tags,
        });
    });
});

/* ===================== SKILLS MARQUEE on About ===================== */
function initSkillsMarquee() {
    const skills = ['HTML / CSS', 'JavaScript', 'IoT Systems', 'UI / UX', 'React', 'Node.js', 'Python', 'Arduino', 'Figma', 'Git'];
    const marqueeEl = document.createElement('div');
    marqueeEl.className = 'skills-marquee';
    const track = document.createElement('div');
    track.className = 'skills-marquee-track';
    [...skills, ...skills].forEach(s => {
        const span = document.createElement('span');
        span.textContent = s;
        const sep = document.createElement('span');
        sep.className = 'sep';
        sep.textContent = '\u25C6';
        track.appendChild(span);
        track.appendChild(sep);
    });
    marqueeEl.appendChild(track);
    const aboutSection = document.getElementById('about');
    if (aboutSection) aboutSection.appendChild(marqueeEl);
}
initSkillsMarquee();

/* ===================== 3D TILT on Project cards (desktop only) ===================== */
if (window.innerWidth > 700) {
    document.querySelectorAll('.project-item').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width  - 0.5;
            const y = (e.clientY - rect.top)  / rect.height - 0.5;
            card.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 3}deg) scale(1.01)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

/* ===================== SCROLL PROGRESS LINE ===================== */
const progressLine = document.createElement('div');
progressLine.className = 'scroll-progress-line';
document.body.appendChild(progressLine);
window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    const pct   = (window.scrollY / total) * 100;
    progressLine.style.width = pct + '%';
}, { passive: true });

/* ===================== ANIMATED NOISE CANVAS (desktop only) ===================== */
function initNoiseCanvas() {
    if (window.innerWidth <= 700) return; // skip on mobile
    const canvas = document.createElement('canvas');
    canvas.className = 'noise-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let frame = 0;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function drawNoise() {
        const w = canvas.width, h = canvas.height;
        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const v = Math.random() * 18;
            data[i] = data[i+1] = data[i+2] = v;
            data[i+3] = 10;
        }
        ctx.putImageData(imageData, 0, 0);
        frame++;
        setTimeout(() => requestAnimationFrame(drawNoise), 50); // ~20fps noise
    }
    drawNoise();
}
initNoiseCanvas();

console.log('\uD83D\uDD25 Portfolio \u2014 cinematic mode active.');