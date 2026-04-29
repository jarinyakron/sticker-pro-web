/* ================================================
   main.js — ฉบับสมบูรณ์ (cleaned)
   ================================================ */

/* ------------------------------------------------
   PARALLAX — ภาพปกเลื่อนตาม scroll (จำกัดขอบ)
   ------------------------------------------------ */
window.addEventListener("scroll", () => {
  const cover = document.querySelector(".cover");
  if (!cover) return;
  // เลื่อนได้สูงสุด 15% ของความกว้าง (= ส่วนที่ขยายไว้)
  const maxShift = cover.offsetWidth * 0.15;
  const shift = Math.min(window.scrollY * 0.15, maxShift);
  cover.style.transform = `translateX(-${shift}px)`;
});

/* ------------------------------------------------
   SCROLL ANIMATION — info-box, info-text, info-image
   ------------------------------------------------ */
window.addEventListener("scroll", () => {
  const windowHeight = window.innerHeight;

  // info-box zoom in
  const box = document.querySelector(".info-box");
  if (box && box.getBoundingClientRect().top < windowHeight - 2) {
    box.classList.add("show");
  }

  // info-text + info-image slide up
  const text  = document.querySelector(".info-text");
  const image = document.querySelector(".info-image");
  if (text && text.getBoundingClientRect().top < windowHeight - 15) {
    text.classList.add("show");
    if (image) setTimeout(() => image.classList.add("show"), 7);
  }

  // sticker-card slide in ทีละใบ
  document.querySelectorAll(".sticker-card").forEach((card, i) => {
    if (card.getBoundingClientRect().top < windowHeight - 1) {
      setTimeout(() => card.classList.add("show"), i * 1);
    }
  });
});

// trigger scroll ตอนโหลดหน้า (กรณีเนื้อหาอยู่ใน viewport เลย)
window.dispatchEvent(new Event("scroll"));

/* ------------------------------------------------
   LOAD ANIMATION — info-image + person-image
   ------------------------------------------------ */
window.addEventListener("load", () => {
  const infoImg   = document.querySelector(".info-image");
  const personImg = document.querySelector(".person-image");

  if (infoImg) infoImg.classList.add("show");

  if (personImg) {
    setTimeout(() => {
      personImg.classList.add("show");
      setTimeout(() => personImg.classList.add("bounce"), 1000);
    }, 2000);
  }
});

/* ------------------------------------------------
   UTILITY FUNCTIONS
   ------------------------------------------------ */
function goPage(page) {
  window.location.href = page;
}

function addLine() {
  window.open("https://line.me/", "_blank");
}

function toggleStickers() {
  const box = document.getElementById("stickers");
  if (box) box.classList.toggle("hidden");
}

/* ------------------------------------------------
   SLIDER — 3 การ์ดมุมโค้ง มีช่องว่าง
   auto เลื่อนทุก 3 วิ, ปุ่ม ‹ ›, dots
   ------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {

  const track = document.getElementById("slideTrack");
  if (!track) return;

  const sliderEl = track.closest(".slider");
  if (!sliderEl) return;

  const GAP     = 14;    // px — ตรงกับ gap ใน CSS
  const VISIBLE = 3;
  const PAUSE   = 3000;  // ms หยุด
  const SPEED   = 650;   // ms เลื่อน

  /* เก็บ card จริง แล้ว clone เพื่อ loop */
  const originals = Array.from(track.querySelectorAll(".card"));
  const total     = originals.length;

  originals.forEach(c => {
    const clone = c.cloneNode(true);
    clone.classList.add("clone");
    track.appendChild(clone);
  });

  let current     = 0;
  let isAnimating = false;
  let timer       = null;

  /* ความกว้าง 1 step (card + gap) */
  function stepWidth() {
    const w = sliderEl.offsetWidth - 32; // ลบ padding 16px สองข้าง
    return (w + GAP) / VISIBLE;
  }

  /* เลื่อนไปที่ index */
  function slideTo(idx, animate) {
    const offset = idx * stepWidth();
    track.style.transition = animate
      ? `transform ${SPEED}ms cubic-bezier(0.4,0,0.2,1)`
      : "none";
    track.style.transform = `translateX(-${offset}px)`;
  }

  /* อัปเดต dots */
  function updateDots() {
    dotsWrap.querySelectorAll(".dot")
      .forEach((d, i) => d.classList.toggle("active", i === current % total));
  }

  /* ไปยัง index */
  function goTo(idx) {
    if (isAnimating) return;
    isAnimating = true;
    current = idx;
    updateDots();

    if (current >= total) {
      // เลื่อนไปที่ clone แล้ว snap กลับ
      slideTo(current, true);
      setTimeout(() => {
        current = 0;
        slideTo(current, false);
        updateDots();
        isAnimating = false;
      }, SPEED + 60);
    } else {
      slideTo(current, true);
      setTimeout(() => { isAnimating = false; }, SPEED + 30);
    }
  }

  function next() { goTo(current + 1); }

  function prev() {
    if (current <= 0) {
      // snap ไปท้าย clone แล้วถอย
      isAnimating = true;
      current = total;
      slideTo(current, false);
      setTimeout(() => {
        current = total - 1;
        slideTo(current, true);
        updateDots();
        setTimeout(() => { isAnimating = false; }, SPEED + 30);
      }, 30);
    } else {
      goTo(current - 1);
    }
  }

  /* ปุ่ม ‹ › */
  const prevBtn = document.createElement("button");
  const nextBtn = document.createElement("button");
  prevBtn.className = "slider-btn prev";
  nextBtn.className = "slider-btn next";
  prevBtn.innerHTML = "&#8249;";
  nextBtn.innerHTML = "&#8250;";
  sliderEl.appendChild(prevBtn);
  sliderEl.appendChild(nextBtn);

  /* dots */
  const dotsWrap = document.createElement("div");
  dotsWrap.className = "slider-dots";
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("span");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => { goTo(i); resetAuto(); });
    dotsWrap.appendChild(dot);
  }
  sliderEl.insertAdjacentElement("afterend", dotsWrap);

  /* auto play */
  function startAuto() {
    clearInterval(timer);
    timer = setInterval(next, PAUSE + SPEED);
  }
  function resetAuto() { startAuto(); }

  prevBtn.addEventListener("click", () => { prev(); resetAuto(); });
  nextBtn.addEventListener("click", () => { next(); resetAuto(); });
  window.addEventListener("resize", () => slideTo(current, false));

  /* เริ่ม */
  slideTo(0, false);
  startAuto();
});
window.addEventListener("scroll", () => {
  const windowHeight = window.innerHeight;

  // info-box zoom in
  const box = document.querySelector(".info-box");
  if (box && box.getBoundingClientRect().top < windowHeight - 2) {
    box.classList.add("show");
  }

  // info-text + info-image
  const text  = document.querySelector(".info-text");
  const image = document.querySelector(".info-image");
  if (text && text.getBoundingClientRect().top < windowHeight - 15) {
    text.classList.add("show");
    if (image) setTimeout(() => image.classList.add("show"), 7);
  }

  // sticker-card
  document.querySelectorAll(".sticker-card").forEach((card, i) => {
    if (card.getBoundingClientRect().top < windowHeight - 1) {
      setTimeout(() => card.classList.add("show"), i * 120);
    }
  });

  // ✅ เพิ่มตรงนี้
  const cat = document.querySelector(".line-cat");
  if (cat && cat.getBoundingClientRect().top < windowHeight - 50) {
    cat.classList.add("show");
  }
});
window.addEventListener("scroll", () => {
  const cover = document.querySelector(".cover");
  if (!cover) return;
  // extra = ส่วนที่รูปกว้างเกินหน้าจอ (140% - 100% = 40%)
  const extra = cover.offsetWidth - window.innerWidth;
  // เริ่มต้น = ชิดขวา (extra px) แล้วเลื่อนซ้ายตาม scroll
  const start = extra;
  const shift = Math.min(window.scrollY * 0.3, extra);
  cover.style.transform = `translateX(-${start - shift}px)`;
});
window.addEventListener("scroll", () => {
  const cover = document.querySelector(".cover");
  if (!cover) return;
  const extra = cover.offsetWidth - window.innerWidth;
  const start = extra;
  const shift = Math.min(window.scrollY * 0.3, extra);
  cover.style.transform = `translateX(-${start + shift}px)`; // 👈 เปลี่ยน - เป็น +
});
const slides = document.querySelector('.slides');
const cards = document.querySelectorAll('.card');
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');

let counter = 3; // เริ่มต้นที่ตัวแรกที่ไม่ใช่ตัว Clone (สมมติแสดงทีละ 3)
const size = cards[0].clientWidth + 14; // ขนาดการ์ด + gap

// 1. คัดลอกภาพเพื่อทำ Loop (Clone First 3 and Last 3)
// ในที่นี้สมมติว่าคุณมีจำนวนการ์ดเยอะพอสมควร
const firstClones = [];
const lastClones = [];

for(let i=0; i<3; i++) {
    firstClones.push(cards[i].cloneNode(true));
    lastClones.push(cards[cards.length - 1 - i].cloneNode(true));
}

// วางตัวเลียนแบบต่อท้ายและเอาตัวท้ายมาไว้ข้างหน้า
firstClones.forEach(clone => slides.appendChild(clone));
lastClones.reverse().forEach(clone => slides.insertBefore(clone, slides.firstChild));

// เซ็ตตำแหน่งเริ่มต้นให้อยู่ที่รูปจริงรูปแรก
slides.style.transform = `translateX(${-size * counter}px)`;

// 2. ฟังก์ชันเลื่อน
const moveSlider = () => {
    slides.style.transition = "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)";
    slides.style.transform = `translateX(${-size * counter}px)`;
};

nextBtn.addEventListener('click', () => {
    if (counter >= cards.length + 3) return; // ป้องกันการกดย้ำเกินไป
    counter++;
    moveSlider();
});

prevBtn.addEventListener('click', () => {
    if (counter <= 0) return;
    counter--;
    moveSlider();
});

// 3. จุดสำคัญ: ดักฟังเมื่อ Transition จบลง (เพื่อแอบวาร์ปกลับ)
slides.addEventListener('transitionend', () => {
    // ถ้าเลื่อนไปจนสุดตัว Clone ท้าย ให้วาร์ปกลับมาตัวจริงหน้าสุด
    if (cards[counter - 3]?.classList.contains('card') === false || counter >= cards.length + 3) {
        slides.style.transition = "none";
        counter = 3; 
        slides.style.transform = `translateX(${-size * counter}px)`;
    }
    // ถ้าเลื่อนถอยหลังจนสุดตัว Clone หน้า ให้วาร์ปไปตัวจริงท้ายสุด
    if (counter <= 0) {
        slides.style.transition = "none";
        counter = cards.length;
        slides.style.transform = `translateX(${-size * counter}px)`;
    }
});

  window.addEventListener("load", () => {
    document.querySelector(".ig-cat").classList.add("show");
  });

    tailwind.config = {
      corePlugins: { preflight: false },
      theme: {
        extend: {
          fontFamily: { sans: ['Prompt', 'sans-serif'] },
          colors: { fb: { 400: '#1877F2', 500: '#166FE5', 600: '#0E52B5' } },
          animation: {
            'float': 'float 6s ease-in-out infinite',
            'float-delayed': 'float 6s ease-in-out 3s infinite',
            'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          },
          keyframes: {
            float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
            'pulse-glow': { '0%, 100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: .8, transform: 'scale(1.05)' } }
          }
        }
      }
    }
function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("active");
}
