// Google Flow Studio & Video Lab - Application Logic

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initCopyButtons();
  initPromptGenerator();
  initSearch();
});

// 1. Theme Management
function initTheme() {
  const themeBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('flow_studio_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('flow_studio_theme', next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// 2. Tab Navigation
function initNavigation() {
  const topPills = document.querySelectorAll('.nav-pill');
  const bottomItems = document.querySelectorAll('.bnav-item');
  const tabs = document.querySelectorAll('.tab-content');

  function switchTab(tabId) {
    tabs.forEach(t => t.classList.remove('active'));
    topPills.forEach(p => p.classList.remove('active'));
    bottomItems.forEach(b => b.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');

    const activeTop = document.querySelector(`.nav-pill[data-tab="${tabId}"]`);
    if (activeTop) activeTop.classList.add('active');

    const activeBottom = document.querySelector(`.bnav-item[data-tab="${tabId}"]`);
    if (activeBottom) activeBottom.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  topPills.forEach(pill => {
    pill.addEventListener('click', () => switchTab(pill.dataset.tab));
  });

  bottomItems.forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });
}

// 3. Copy to Clipboard
function initCopyButtons() {
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-copy');
    if (!btn) return;

    const targetSelector = btn.dataset.target;
    let textToCopy = '';

    if (targetSelector) {
      const el = document.getElementById(targetSelector) || document.querySelector(targetSelector) || document.getElementById(targetSelector.replace(/^#/, ''));
      if (el) textToCopy = el.innerText || el.textContent;
    } else {
      const pre = btn.closest('.code-wrapper')?.querySelector('pre, code');
      if (pre) textToCopy = pre.innerText || pre.textContent;
    }

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy.trim()).then(() => {
        const origHtml = btn.innerHTML;
        btn.innerHTML = '✓ Скопировано';
        btn.style.background = 'var(--sage)';
        btn.style.color = '#fff';
        setTimeout(() => {
          btn.innerHTML = origHtml;
          btn.style.background = '';
          btn.style.color = '';
        }, 2000);
      });
    }
  });
}

// 4. Interactive Prompt Generator
const PROMPT_DATABASE = {
  'm1': {
    title: 'm1 · SMAS-лифтинг «Контур при свете»',
    startFrame: 'm1-start-1080x1920.png',
    character: '@Heroine_A (Славянская внешность, 30-33, собранные волосы)',
    ingredients: ['m1-start.jpg', 'm1-room.jpg (Москва)', 'm1-device-ultraformer.jpg'],
    veoPrompt: `Using the provided start frame — Close beauty portrait, the woman placed in the right half of the frame.
Camera remains locked on tripod with an almost imperceptible slow push-in.
She holds her gaze into the lens, takes one calm breath, then slowly turns her chin a few degrees toward the warm key light.
The cheekbone and jawline catch the light naturally without hand contact.
A subtle closed-lip smile arrives and softens.
The left half of the frame remains a completely still, clean milky ivory wall for all 8 seconds.
Quiet clinic room tone, no music.`,
    omniPrompt: `Animate the start frame as an 8-second vertical video. Keep the woman, her clothing, and the room exactly as pictured.
She breathes calmly, slowly turns her chin slightly toward the key light so the jaw contour catches the light, offers a subtle calm smile, and holds her gaze into the lens.
Hands never touch the face. Camera locked. The left milky wall stays completely calm and empty.
Soft clinic room tone, no music.`,
    notes: 'В Veo Quality используем только Start Frame (Frames to Video). Текст описывает исключительно кинематику и свет!'
  },
  'm2': {
    title: 'm2 · Сторис «Тело / Без спешки»',
    startFrame: 'm2-start-1080x1920.png',
    character: '@Heroine_B (Каштановые волосы, айвори-купальник)',
    ingredients: ['m2-start.jpg', 'm2-room.jpg (Краснодар)', 'm2-device-coccon.jpg'],
    veoPrompt: `Using the provided start frame — Full-length vertical editorial shot, the woman standing half-turned in the upper two thirds of the frame.
Camera locked on tripod, zero shake.
She slowly shifts her weight to the other leg with calm poise; her hair gently moves over her shoulder.
She looks back over her shoulder into the lens with an unhurried, natural arriving smile, then settles.
The white device and graphite accent wall remain softly out of focus and completely stationary.
The lower third of the frame remains empty floor and calm negative space.
Quiet room tone, soft rustle of movement, no music.`,
    omniPrompt: `Animate the start frame for 8 seconds. The woman, ivory swimsuit, graphite wall, and background device stay exactly as pictured.
She shifts her body weight with slow grace, turns her head to look back into the camera with a subtle warm smile, and relaxes into stillness.
Camera locked. Lower third stays empty. Quiet room atmosphere, no music.`,
    notes: 'Формат сторис 9:16 родной. Никаких резких движений; темп замедленный, медитативный.'
  },
  'm3': {
    title: 'm3 · Постер «Лазерная эпиляция / Гладко»',
    startFrame: 'm3-start-C5-1080x1920.png',
    character: '@Heroine_C (Айвори топ и шорты, клиентка)',
    ingredients: ['m3-start-C5.jpg', 'm3-room-laser.jpg (Краснодар)'],
    veoPrompt: `Using the provided start frame — Vertical three-quarter shot, the client seated on the treatment couch at the right of the frame.
Camera locked-off on tripod.
Her hand moves slowly and smoothly down her shin toward the ankle as the skin catches the warm light.
She lifts her face toward the lens with a calm, serene smile, then rests her hand behind her head opening the inner arm to the light.
The left half of the frame remains a still, continuous milky pastel gradient.
Ambient room tone only, no dialogue, no music.`,
    omniPrompt: `Animate this image for 8 seconds. Keep the client, her clothing, and room exactly as shown.
Her hand glides slowly down her shin, she lifts her eyes to the camera with a gentle smile, and brings her hand behind her head.
Smooth relaxed motion, camera still. Left half of frame remains an empty milky wall.
Quiet ambient sound, no music.`,
    notes: 'Модель — клиентка, никакой медицинской одежды. Пустая левая зона растворяется в фоне.'
  },
  'm4': {
    title: 'm4 · Карточка каталога «Пигментация / Ровный тон»',
    startFrame: 'm4-start-1080x1920.png',
    character: '@Heroine_D (Полупрофиль, открытые глаза)',
    ingredients: ['m4-start.jpg', 'm4-room.jpg (Москва)', 'm4-device-bbl.jpg'],
    veoPrompt: `Using the provided start frame — Half-profile beauty portrait positioned in the lower-right area.
Camera locked on tripod with an almost imperceptible macro push-in.
Her eyes slowly lift and her face turns slightly toward the grazing warm side light, revealing natural skin texture.
A tranquil closed-lip smile arrives; she blinks once calmly and settles into stillness.
The upper-left area of the frame stays a completely still, clean milky wall.
Quiet room tone, no music.`,
    omniPrompt: `Animate the start frame as an 8-second clip. Keep the subject, lighting, and framing exactly as pictured.
Minimal movement: her eyes lift calmly, face turns a fraction toward the light, a soft smile forms, one slow blink.
Camera static. The upper-left caption area remains completely still.
Soft ambient room tone, no music.`,
    notes: 'Кадр утверждён с открытыми глазами. Движение минимальное, акцент на скользящем свете по скуле.'
  },
  'm5': {
    title: 'm5 · Консультация «Сначала — разговор»',
    startFrame: 'm5-start-1920x1080.png',
    character: '@Dr_Baranchikova (Врач) & @Patient (Пациентка)',
    ingredients: ['m5-start.jpg', 'm5-doctor.jpg (Татьяна Баранчикова)', 'm4-room.jpg'],
    veoPrompt: `Using the provided start frame — Horizontal two-shot, doctor and patient seated at the consultation desk in the right half of the frame.
Camera locked on tripod.
The doctor makes a calm, explanatory hand gesture toward the tablet on the desk; the patient nods with understanding.
Both share an easy, genuine smile. The doctor gently turns the tablet toward the patient and settles.
The left third of the frame remains calm, empty room air.
Audio: quiet clinic ambience and soft indistinct conversational murmur, no music.`,
    omniPrompt: `Animate the start frame for 8 seconds. Maintain the doctor's exact identity from image 2.
The doctor explains calmly with a light hand motion over the tablet, the patient nods, both exchange an easy natural smile, and the doctor slides the tablet closer.
Natural conversational flow, camera locked. Empty space on left stays motionless.
Soft conversational murmur, no music.`,
    notes: 'Единственный ролик с 2 людьми и реальным врачом. Сначала черновик в Omni, финал от стартового кадра в Veo.'
  },
  'm6': {
    title: 'm6 · Широкий баннер сайта «Шестнадцать лет при свете»',
    startFrame: 'm6-start-placeholder-1920x1080.png',
    character: '@Cosmetologist (Врач в шалфейной форме) & Asclepion Laser',
    ingredients: ['m6-start-placeholder.jpg', 'm6-room-laser.jpg (Краснодар)'],
    veoPrompt: `Using the provided start frame — Wide horizontal shot, the cosmetologist and the laser device in the left third of the frame.
Camera locked on tripod.
Her hand rests on the device panel whose light breathes softly; she looks at the device, then turns to the lens with a calm smile.
Half a step toward the camera, and she settles; the right two thirds of the frame remain a quiet, motionless room.
Audio: quiet room tone and a faint electronic hum from the device, no music.`,
    omniPrompt: `Animate the start frame for 8 seconds. Keep the doctor and laser device exactly as shown.
Her hand rests calmly on the panel, she turns her gaze to the camera with an assured smile, and takes half a step forward.
Camera locked. Right two thirds stay still and empty. Quiet room tone with faint device hum, no music.`,
    notes: 'Широкий формат 16:9 под кроп 2:1. Правые 2/3 кадра остаются чистой зоной для крупной типографики.'
  },
  'erica_k': {
    title: 'Эрика (K) · Рисованный аватар (изолинии)',
    startFrame: 'erica-K-drawn-1080x1920.png',
    character: '@Erica_K (Графитовый карандаш, папиллярные линии, шалфейный лён)',
    ingredients: ['erica-K-drawn-1080x1920.png', 'erica_voice_anchor.wav'],
    veoPrompt: `Using the provided hand-drawn start frame — Medium close-up of Erica centered on textured milky paper.
Camera locked, no zoom.
The drawing remains strictly a graphite and wash line illustration for the entire clip; never convert to 3D or photo.
Erica tilts her head slightly, blinks calmly, and speaks with natural lip movement:
"Я Эрика, из Skinerica. Мы смотрим на кожу при свете — и показываем её как есть. Настоящее к лицу."
A warm, gentle smile arrives during speech and settles at the end.
Audio: warm, unhurried female voice in Russian, delicate paper acoustic tone, no music.`,
    omniPrompt: `Animate the first image as Erica, preserving the hand-drawn line style throughout.
Apply the attached voice reference (warm, calm Russian female voice).
She speaks with precise lip sync:
"Я Эрика, из Skinerica. Мы смотрим на кожу при свете — и показываем её как есть. Настоящее к лицу."
Slight head tilt, warm natural smile, camera locked. Paper room tone, no music.`,
    notes: 'Речь и синхрон губ лучше всего работают в Gemini Omni Flash с подключенным Voice Reference!'
  },
  'erica_e': {
    title: 'Эрика (E) · Андроид-аватар (линии + швы)',
    startFrame: 'erica-E-droid-1080x1920.png',
    character: '@Erica_E (Изолинии-дроид, швы на лице, папиллярный знак)',
    ingredients: ['erica-E-droid-1080x1920.png', 'erica_voice_anchor.wav'],
    veoPrompt: `Using the provided hand-drawn start frame — Medium close-up, Erica facing camera.
Camera locked, no zoom.
Maintains fine graphite line art style. The face shows delicate android seam lines and the brow whorl mark.
On saying the slogan, the forehead mark and seams catch a subtle warm light for a moment and fade.
She speaks: "Мы не обещаем — показываем. Один свет, один ракурс, до и после. Результат не на словах, а на теле."
Audio: warm, calm female voice, unhurried, quiet room tone, no music.`,
    omniPrompt: `Animate the start image as Erica with android line aesthetics.
Use the attached voice reference. She speaks with synchronized lip movements:
"Мы не обещаем — показываем. Один свет, один ракурс, до и после. Результат не на словах, а на теле."
Brow mark glows softly on the slogan. Camera locked. Quiet paper tone, no music.`,
    notes: 'Свечение швов и знака терракотой происходит строго синхронно со слоганом в конце фразы.'
  }
};

function initPromptGenerator() {
  const scenarioSelect = document.getElementById('gen-scenario');
  const modelSelect = document.getElementById('gen-model');
  const outputBox = document.getElementById('gen-output');
  const metaBox = document.getElementById('gen-meta');

  if (!scenarioSelect || !outputBox) return;

  function update() {
    const key = scenarioSelect.value;
    const model = modelSelect.value;
    const data = PROMPT_DATABASE[key];
    if (!data) return;

    const promptText = model === 'veo' ? data.veoPrompt : data.omniPrompt;
    outputBox.textContent = promptText;

    if (metaBox) {
      metaBox.innerHTML = `
        <div style="font-size: 13px; line-height: 1.6;">
          <p><b>Кадр:</b> <code>${data.startFrame}</code></p>
          <p><b>Персонаж:</b> <code>${data.character}</code></p>
          <p><b>Ингредиенты:</b> <code>${data.ingredients.join(' + ')}</code></p>
          <p style="color: var(--terra-ink); margin-top: 6px;">💡 <b>Правило:</b> ${data.notes}</p>
        </div>
      `;
    }
  }

  scenarioSelect.addEventListener('change', update);
  modelSelect.addEventListener('change', update);
  update();
}

// 5. Quick Search / Filter
function initSearch() {
  const input = document.getElementById('quick-search');
  if (!input) return;

  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.tab-content.active .card, .tab-content.active .rule');

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (!query || text.includes(query)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
