
(function(){
  var root = document.documentElement;
  root.classList.add('js');

  /* ---------- language ---------- */
  function apply(lang){
    var ar = lang === 'ar';
    root.lang = lang;
    root.dir  = ar ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en]').forEach(function(el){
      var v = el.getAttribute(ar ? 'data-ar' : 'data-en');
      if (v !== null) el.textContent = v;
    });
    document.querySelectorAll('img[data-alt-en]').forEach(function(im){
      im.alt = im.getAttribute(ar ? 'data-alt-ar' : 'data-alt-en') || '';
    });
    var b = document.getElementById('lang');
    if (b) b.textContent = ar ? 'English' : 'العربية';
    document.title = ar
      ? 'إن في سي للهندسة والمقاولات — مقاولات عامة، الخرطوم'
      : 'NVC Engineering & Contracting — General Contractors, Khartoum';
    try { localStorage.setItem('nvc-lang', lang); } catch(e){}
  }
  var saved = 'en';
  try { saved = localStorage.getItem('nvc-lang') || (navigator.language||'').indexOf('ar')===0 ? 'ar' : 'en'; } catch(e){}
  try { saved = localStorage.getItem('nvc-lang') || saved; } catch(e){}
  if (saved === 'ar') apply('ar');
  var lb0 = document.getElementById('lang');
  if (lb0) lb0.addEventListener('click', function(){
    apply(root.dir === 'rtl' ? 'en' : 'ar');
  });

  /* ---------- theme ---------- */
  try {
    var th = localStorage.getItem('nvc-theme');
    if (th) root.setAttribute('data-theme', th);
  } catch(e){}
  var tb = document.getElementById('theme');
  if (tb) tb.addEventListener('click', function(){
    var cur = root.getAttribute('data-theme');
    var dark = cur ? cur === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('nvc-theme', next); } catch(e){}
  });

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger'), nav = document.getElementById('nav');
  if (burger && nav){
    burger.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.textContent = open ? '×' : '≡';
    });
    nav.addEventListener('click', function(e){
      if (e.target.tagName === 'A'){
        nav.classList.remove('open'); burger.textContent = '≡';
        burger.setAttribute('aria-expanded','false');
      }
    });
  }

  /* ---------- reveal on scroll ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.rv, .eyebrow');
  if (reduce || !('IntersectionObserver' in window)){
    targets.forEach(function(t){ t.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function(t){ io.observe(t); });
  }

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lb'), lbImg = document.getElementById('lbImg'),
      lbCap = document.getElementById('lbCap'), lbIdx = document.getElementById('lbIdx'),
      lbTtl = document.getElementById('lbTtl');
  var shots = [], at = 0, opener = null;

  function paint(){
    var s = shots[at]; if (!s) return;
    lbImg.src = s.src;
    var ar = root.dir === 'rtl';
    lbImg.alt = ar ? s.ar : s.en;
    lbCap.textContent = ar ? s.ar : s.en;
    lbIdx.textContent = (at + 1) + ' / ' + shots.length;
  }
  function open(el){
    try { shots = JSON.parse(el.getAttribute('data-gallery')); } catch(e){ return; }
    if (!shots.length) return;
    opener = el; at = 0;
    var ar = root.dir === 'rtl';
    lbTtl.textContent = el.getAttribute(ar ? 'data-title-ar' : 'data-title-en') || '';
    lb.classList.add('on');
    document.body.style.overflow = 'hidden';
    paint();
    lb.querySelector('.close').focus();
  }
  function close(){
    lb.classList.remove('on');
    document.body.style.overflow = '';
    if (opener) opener.focus();
  }
  function step(d){ at = (at + d + shots.length) % shots.length; paint(); }

  document.querySelectorAll('[data-gallery]').forEach(function(el){
    el.addEventListener('click', function(){ open(el); });
    el.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(el); }
    });
  });
  if (lb){
    lb.querySelector('.close').addEventListener('click', close);
    lb.querySelector('.prev').addEventListener('click', function(){ step(-1); });
    lb.querySelector('.next').addEventListener('click', function(){ step(1); });
    lb.addEventListener('click', function(e){ if (e.target === lb) close(); });
    document.addEventListener('keydown', function(e){
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(root.dir === 'rtl' ? -1 : 1);
      if (e.key === 'ArrowLeft')  step(root.dir === 'rtl' ? 1 : -1);
    });
  }

  /* ---------- quote form: WhatsApp or email, same message ---------- */
  var form = document.getElementById('quote');
  function quoteText(){
    var f = new FormData(form), ar = root.dir === 'rtl';
    var L = ar
      ? { h:'طلب عرض سعر — من موقع NVC', name:'الاسم', org:'الجهة', type:'نوع العمل', loc:'الموقع', msg:'التفاصيل' }
      : { h:'Quotation request — from the NVC website', name:'Name', org:'Organisation', type:'Type of work', loc:'Location', msg:'Details' };
    var lines = [L.h, ''];
    [['name',L.name],['org',L.org],['type',L.type],['loc',L.loc],['msg',L.msg]].forEach(function(p){
      var v = (f.get(p[0]) || '').toString().trim();
      if (v) lines.push(p[1] + ': ' + v);
    });
    return { subject: L.h, body: lines.join('\n') };
  }
  if (form) form.addEventListener('submit', function(e){
    e.preventDefault();
    window.open('https://wa.me/249123037190?text=' + encodeURIComponent(quoteText().body), '_blank', 'noopener');
  });
  var mb = document.getElementById('sendMail');
  if (mb && form) mb.addEventListener('click', function(){
    if (!form.reportValidity()) return;
    var q = quoteText();
    window.location.href = 'mailto:tenders@nvcsudan.com?subject=' +
      encodeURIComponent(q.subject) + '&body=' + encodeURIComponent(q.body);
  });

  /* ---------- scroll progress ---------- */
  var bar = document.getElementById('progBar');
  var ticking = false;
  function onScroll(){
    if (bar){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }
    /* nav spy */
    var y = window.scrollY + 140, cur = null;
    secs.forEach(function(s){ if (s.el.offsetTop <= y) cur = s; });
    links.forEach(function(a){ a.classList.toggle('here', !!cur && a.getAttribute('href') === '#' + cur.id); });
    /* project photo parallax */
    if (!reduce) shotsEls.forEach(function(im){
      var r = im.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      im.style.transform = 'scale(1.08) translateY(' + (p * -14).toFixed(2) + 'px)';
    });
    ticking = false;
  }
  var links = [].slice.call(document.querySelectorAll('nav a[href^="#"]'));
  var secs = links.map(function(a){
    var id = a.getAttribute('href').slice(1), el = document.getElementById(id);
    return el ? { id: id, el: el } : null;
  }).filter(Boolean);
  var shotsEls = [].slice.call(document.querySelectorAll('.pshot img'));
  window.addEventListener('scroll', function(){
    if (!ticking){ ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- number counters ---------- */
  function runCount(el){
    var raw = el.getAttribute('data-count') || el.textContent;
    var m = raw.match(/^([\d.,]+)(.*)$/);
    if (!m || reduce){ el.textContent = raw; return; }
    var target = parseFloat(m[1].replace(/,/g, '')), suffix = m[2] || '';
    var dec = (m[1].split('.')[1] || '').length;
    var grouped = m[1].indexOf(',') > -1;
    var t0 = null, dur = 1100;
    function fmt(v){
      var out = dec ? v.toFixed(dec) : String(Math.round(v));
      if (grouped) out = out.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return out + suffix;
    }
    function frame(t){
      if (t0 === null) t0 = t;
      var k = Math.min((t - t0) / dur, 1);
      k = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(target * k);
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduce){
    var cio = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function(c){ cio.observe(c); });
  } else {
    counters.forEach(function(c){ c.textContent = c.getAttribute('data-count'); });
  }

  /* ---------- staggered rows ---------- */
  var rows = document.querySelectorAll('.svc-list li, .clients div, tbody tr');
  if ('IntersectionObserver' in window && !reduce){
    var rio = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting) return;
        var sibs = [].slice.call(e.target.parentElement.children);
        e.target.style.transitionDelay = Math.min(sibs.indexOf(e.target), 12) * 45 + 'ms';
        e.target.classList.add('in');
        rio.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    [].forEach.call(rows, function(r){ rio.observe(r); });
  } else {
    [].forEach.call(rows, function(r){ r.classList.add('in'); });
  }

  /* ---------- before / after ---------- */
  var stage = document.getElementById('ba'), clip = document.getElementById('baClip'),
      handle = document.getElementById('baHandle');
  if (stage && clip && handle){
    var pct = 50, dragging = false;
    function sizeInner(){
      clip.style.setProperty('--stageW', stage.clientWidth + 'px');
      var im = clip.querySelector('img');
      if (im) im.style.width = stage.clientWidth + 'px';
    }
    function set(p){
      pct = Math.max(0, Math.min(100, p));
      clip.style.width = pct + '%';
      handle.style.insetInlineStart = pct + '%';
      stage.setAttribute('aria-valuenow', Math.round(pct));
    }
    function fromEvent(e){
      var r = stage.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      var p = (x / r.width) * 100;
      set(document.documentElement.dir === 'rtl' ? 100 - p : p);
    }
    stage.addEventListener('pointerdown', function(e){
      dragging = true; fromEvent(e); e.preventDefault();
    });
    window.addEventListener('pointermove', function(e){ if (dragging) fromEvent(e); });
    window.addEventListener('pointerup',   function(){ dragging = false; });
    window.addEventListener('pointercancel', function(){ dragging = false; });
    stage.addEventListener('mousemove', function(e){ if (e.buttons === 1) fromEvent(e); });
    stage.addEventListener('keydown', function(e){
      var d = document.documentElement.dir === 'rtl' ? -1 : 1;
      if (e.key === 'ArrowRight'){ set(pct + 4 * d); e.preventDefault(); }
      if (e.key === 'ArrowLeft'){  set(pct - 4 * d); e.preventDefault(); }
      if (e.key === 'Home'){ set(0); } if (e.key === 'End'){ set(100); }
    });
    window.addEventListener('resize', sizeInner);
    sizeInner(); set(50);
    /* nudge once on first view so people see it is draggable */
    if ('IntersectionObserver' in window && !reduce){
      var bio = new IntersectionObserver(function(es){
        es.forEach(function(e){
          if (!e.isIntersecting) return;
          bio.unobserve(e.target);
          var t = 0, id = setInterval(function(){
            t += 1; set(50 + Math.sin(t / 3) * (14 - t));
            if (t > 13){ clearInterval(id); set(50); }
          }, 45);
        });
      }, { threshold: 0.4 });
      bio.observe(stage);
    }
  }

  /* ---------- lightbox: swipe ---------- */
  if (lb){
    var sx = 0;
    lb.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function(e){
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

})();
