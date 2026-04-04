/* ===================== CURSOR ===================== */
const dot  = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

function animateCursor() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    if (dot)  dot.style.cssText  += `left:${mx}px;top:${my}px;`;
    if (ring) ring.style.cssText += `left:${rx}px;top:${ry}px;`;
    requestAnimationFrame(animateCursor);
}
animateCursor();

/* ===================== LOADER ===================== */
window.addEventListener('load', () => {
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

/* ===================== STAGGER REVEAL (IntersectionObserver) ===================== */
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
function opentab(tabname) {
    for (let t of tablinks)    t.classList.remove('active-link');
    for (let t of tabcontents) t.classList.remove('active-tab');
    event.currentTarget.classList.add('active-link');
    document.getElementById(tabname).classList.add('active-tab');
}

/* ===================== MOBILE MENU ===================== */
var sidemenu = document.getElementById('sidemenu');
function openmenu()  { sidemenu.style.right = '0'; }
function closemenu() { sidemenu.style.right = '-280px'; }

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
        msg.innerHTML = 'Sending…'; msg.style.color = '#a79930';
        fetch(scriptURL, { method:'POST', body: new FormData(form) })
            .then(() => {
                msg.innerHTML = '✓ Message sent!'; msg.style.color = '#4ade80';
                form.reset();
                [emailInput, nameInput].forEach(el => { if(el) el.style.borderColor = ''; });
                setTimeout(() => { msg.innerHTML = ''; }, 5000);
            })
            .catch(() => { msg.innerHTML = '✗ Error — please try again.'; msg.style.color = '#f87171'; });
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
    // inject content
    modalSrc.src      = data.src;
    modalIndex.textContent = data.index;
    modalTitle.textContent = data.title;
    modalDesc.textContent  = data.desc;
    modalTags.innerHTML = data.tags.map(t => `<span>${t}</span>`).join('');

    // load & play
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

// Progress bar sync
modalVideo.addEventListener('timeupdate', () => {
    if (!modalVideo.duration) return;
    modalProg.style.width = (modalVideo.currentTime / modalVideo.duration * 100) + '%';
});

// Close triggers
modalClose.addEventListener('click', closeModal);
modalBack.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Hook every project-link to open modal
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

console.log('🔥 Portfolio ready.');
