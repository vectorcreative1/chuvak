// Mark JS as available so the download block can stay hidden until "Купити" is clicked.
document.documentElement.classList.add('js');

// Honor-system delivery: "Купити" opens the monobank jar in a new tab and shows
// the "Я заплатив!" button; that button reveals the files and instructions.
(function () {
  const pay = document.getElementById('pay');
  const paid = document.getElementById('paid');
  const paidBtn = document.getElementById('paid-btn');
  const box = document.getElementById('download');
  if (!pay || !paid || !paidBtn || !box) return;
  pay.addEventListener('click', () => {
    setTimeout(() => {
      paid.classList.add('open');
      paid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 800);
  });
  paidBtn.addEventListener('click', () => {
    paid.classList.remove('open');
    box.classList.add('open');
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

// Copy buttons: each [data-copy] copies the text of the element with that id.
document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const value = document.getElementById(btn.dataset.copy).textContent;
    try {
      await navigator.clipboard.writeText(value);
    } catch (e) {
      // Fallback for older browsers / file:// pages
      const ta = document.createElement('textarea');
      ta.value = value; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    btn.textContent = 'Скопійовано ✓';
    btn.classList.add('done');
    setTimeout(() => { btn.textContent = 'Скопіювати'; btn.classList.remove('done'); }, 2500);
  });
});

// Animated chats: every [data-chat] plays its bubbles when scrolled into view.
// "me" bubbles are typed letter by letter, "ai" bubbles appear after typing dots.
// Without JS (or with reduced motion) all bubbles are simply visible.
(function () {
  const chats = document.querySelectorAll('[data-chat]');
  if (!chats.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  async function typeInto(el, text) {
    const chars = Array.from(text); // keeps emoji intact
    el.textContent = '';
    el.hidden = false;
    el.classList.add('typing');
    for (let i = 1; i <= chars.length; i++) {
      el.textContent = chars.slice(0, i).join('');
      await wait(30 + Math.random() * 40);
    }
    el.classList.remove('typing');
  }

  async function showWithDots(chat, el) {
    const dots = document.createElement('div');
    dots.className = 'bubble ai dots';
    dots.innerHTML = '<span></span><span></span><span></span>';
    chat.insertBefore(dots, el);
    await wait(900 + Math.random() * 500);
    dots.remove();
    el.hidden = false;
  }

  async function play(chat) {
    const bubbles = chat._bubbles;
    await wait(300);
    for (const b of bubbles) {
      if (b.classList.contains('me')) {
        await typeInto(b, b._text);
        await wait(400);
      } else {
        await showWithDots(chat, b);
        await wait(700);
      }
    }
    chat.style.minHeight = '';
  }

  // Prepare: reserve final height so the layout does not jump, then hide bubbles.
  chats.forEach((chat) => {
    chat.style.minHeight = chat.offsetHeight + 'px';
    chat._bubbles = Array.from(chat.querySelectorAll('.bubble'));
    chat._bubbles.forEach((b) => {
      b._text = b.textContent;
      b.hidden = true;
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      play(e.target);
    });
  }, { threshold: 0.4 });

  chats.forEach((chat) => io.observe(chat));
})();
