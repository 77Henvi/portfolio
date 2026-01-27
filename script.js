
window.addEventListener('scroll', () => {
    const reveals = document.querySelectorAll('.about-col-1, .about-col-2, .work, .contact-left, .contact-right');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const revealTop = element.getBoundingClientRect().top;
        const revealPoint = 150;
        
        if (revealTop < windowHeight - revealPoint) {
            element.classList.add('active');
        }
    });
});

// =====  TYPING EFFECT สำหรับชื่อ =====
const typingText = document.querySelector('.header-text h1 span');
const textArray = ['Rapeepat Nitakorn', 'Web Developer', 'IoT Engineer'];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    const currentText = textArray[textIndex];
    
    if (isDeleting) {
        typingText.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingText.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }
    
    if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        setTimeout(typeEffect, 2000);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % textArray.length;
        setTimeout(typeEffect, 500);
    } else {
        setTimeout(typeEffect, isDeleting ? 50 : 150);
    }
}

// เริ่ม typing effect
setTimeout(typeEffect, 1000);

// ===== SCROLL TO TOP BUTTON =====

const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
scrollTopBtn.className = 'scroll-to-top';
scrollTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: #9d3b23;
    color: #fff;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: none;
    z-index: 1000;
    transition: all 0.3s;
    font-size: 20px;
`;
document.body.appendChild(scrollTopBtn);

// แสดง/ซ่อนปุ่ม
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.style.display = 'block';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

// Scroll to top เมื่อคลิก
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===ACTIVE NAVIGATION HIGHLIGHT ===

const sections = document.querySelectorAll('div[id]');
const navLinks = document.querySelectorAll('nav ul li a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active-nav');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active-nav');
        }
    });
});

// ===== VIDEO CONTROLS =====
const videos = document.querySelectorAll('.work video');

videos.forEach(video => {
    // Pause เมื่อออกจากหน้าจอ
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                video.play();
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(video);
    
    // Hover effects
    video.parentElement.addEventListener('mouseenter', () => {
        video.playbackRate = 0.5; // เล่นช้าลง
    });
    
    video.parentElement.addEventListener('mouseleave', () => {
        video.playbackRate = 1; // กลับเป็นปกติ
    });
});

// ===== FORM VALIDATION ENHANCEMENT =====
const form = document.forms['submit-to-google-sheet'];
const nameInput = form.elements['Name'];
const emailInput = form.elements['Email'];
const messageInput = form.elements['Message'];

// Real-time validation
emailInput.addEventListener('blur', () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value)) {
        emailInput.style.border = '2px solid red';
        showError('กรุณากรอกอีเมลที่ถูกต้อง');
    } else {
        emailInput.style.border = '2px solid green';
    }
});

nameInput.addEventListener('blur', () => {
    if (nameInput.value.length < 2) {
        nameInput.style.border = '2px solid red';
        showError('ชื่อต้องมีอย่างน้อย 2 ตัวอักษร');
    } else {
        nameInput.style.border = '2px solid green';
    }
});

function showError(message) {
    const msg = document.getElementById('msg');
    msg.innerHTML = message;
    msg.style.color = '#ff6b6b';
    setTimeout(() => {
        msg.innerHTML = '';
    }, 3000);
}

// ===== LOADING ANIMATION =====
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// ===== SMOOTH SCROLL ENHANCEMENT =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // ปิด mobile menu เมื่อคลิกลิงก์
            if (window.innerWidth <= 600) {
                closemenu();
            }
        }
    });
});

// ===== COUNTER ANIMATION =====
function animateCounter(element, target, duration) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        element.textContent = Math.floor(start);
        
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, 16);
}

// =====  COPY CODE FUNCTIONS =====
var tablinks = document.getElementsByClassName("tab-links");
var tabcontents = document.getElementsByClassName("tab-contents");

function opentab(tabname) {
    for (tablink of tablinks) {
        tablink.classList.remove("active-link");
    }
    for (tabcontent of tabcontents) {
        tabcontent.classList.remove("active-tab");
    }
    event.currentTarget.classList.add("active-link");
    document.getElementById(tabname).classList.add("active-tab");
}

var sidemenu = document.getElementById("sidemenu");

function openmenu() {
    sidemenu.style.right = "0";
}

function closemenu() {
    sidemenu.style.right = "-200px";
}

// Form submission
const scriptURL = 'https://script.google.com/macros/s/AKfycbxF-G5xxYav-BECV897Q3qAEpG7oPI8qrEgxj7719G20Vy-o0wCOkfx2m30hlD32hlgCg/exec';
const msg = document.getElementById("msg");

form.addEventListener('submit', e => {
    e.preventDefault();
    
    // แสดง loading
    msg.innerHTML = "กำลังส่ง...";
    msg.style.color = "#a79930";
    
    fetch(scriptURL, { method: 'POST', body: new FormData(form) })
        .then(response => {
            msg.innerHTML = "✓ ส่งข้อความสำเร็จ!";
            msg.style.color = "#4caf50";
            setTimeout(function() {
                msg.innerHTML = "";
            }, 5000);
            form.reset();
            
            // รีเซ็ต border
            emailInput.style.border = 'none';
            nameInput.style.border = 'none';
        })
        .catch(error => {
            msg.innerHTML = "❌ เกิดข้อผิดพลาด กรุณาลองใหม่";
            msg.style.color = "#ff6b6b";
            console.error('Error!', error.message);
        });
});

console.log('🚀 Portfolio Website Loaded Successfully!');
