(function () {
  // --- Sticky Nav, Scroll Highlights, Smooth Scroll ---
  var nav = document.getElementById('site-nav');
  if (!nav) return;
  var toggle = nav.querySelector('.nav-toggle');
  var menu = nav.querySelector('.nav-links');
  var links = nav.querySelectorAll('.nav-links a');
  var sections = [];
  var isBlogPage = nav.classList.contains('blog-nav');

  links.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href.charAt(0) !== '#') return;
    var id = href.substring(1);
    var el = document.getElementById(id);
    if (el) sections.push({ id: id, el: el, link: link });
  });

  var heroEl = document.getElementById('fh5co-header');
  var heroHeight = heroEl ? heroEl.offsetHeight : 0;

  if (!isBlogPage) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > heroHeight * 0.5) {
        nav.classList.add('visible');
      } else {
        nav.classList.remove('visible');
        menu.classList.remove('open');
      }

      var scrollPos = window.scrollY + 80;
      var current = '';
      sections.forEach(function (s) {
        if (s.el.offsetTop <= scrollPos) current = s.id;
      });
      links.forEach(function (l) {
        if (l.getAttribute('href').charAt(0) === '#') l.classList.remove('active');
      });
      if (current) {
        var active = nav.querySelector('a[href="#' + current + '"]');
        if (active) active.classList.add('active');
      }
    });
  }

  links.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href.charAt(0) !== '#') return;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var id = this.getAttribute('href').substring(1);
      var target = document.getElementById(id);
      if (target) {
        var offset = id === 'fh5co-header' ? 0 : target.offsetTop - 56;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
      menu.classList.remove('open');
    });
  });

  toggle.addEventListener('click', function () {
    menu.classList.toggle('open');
  });

  var scrollBtn = document.querySelector('.hero-scroll-down');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var about = document.getElementById('fh5co-about');
      if (about) window.scrollTo({ top: about.offsetTop - 56, behavior: 'smooth' });
    });
  }

  // --- Timeline line: start at first badge, end at last badge ---
  function fitTimelineLine() {
    var tl = document.querySelector('ul.timeline');
    if (!tl) return;
    var badges = tl.querySelectorAll('.timeline-badge');
    if (badges.length < 2) return;
    var first = badges[0];
    var last = badges[badges.length - 1];
    var tlRect = tl.getBoundingClientRect();
    var firstCenter = first.getBoundingClientRect().top + first.offsetHeight / 2 - tlRect.top;
    var lastCenter = last.getBoundingClientRect().top + last.offsetHeight / 2 - tlRect.top;
    tl.style.setProperty('--tl-top', firstCenter + 'px');
    tl.style.setProperty('--tl-height', (lastCenter - firstCenter) + 'px');
  }
  fitTimelineLine();
  window.addEventListener('resize', fitTimelineLine);
  window.addEventListener('load', fitTimelineLine);

  // --- Theme Toggle ---
  var themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      var next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  // --- AI Neural Cursor ---
  var dot = document.getElementById('cursor-dot');
  var cvs = document.getElementById('cursor-canvas');
  if (dot && cvs && window.matchMedia('(pointer: fine)').matches) {
    var ctx = cvs.getContext('2d');
    var dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
      cvs.width = window.innerWidth * dpr;
      cvs.height = window.innerHeight * dpr;
      cvs.style.width = window.innerWidth + 'px';
      cvs.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    var mx = -200, my = -200;
    var prevMx = -200, prevMy = -200;
    var cursorVx = 0, cursorVy = 0, cursorSpeed = 0;
    var hovering = false, visible = true;
    var TWO_PI = Math.PI * 2;

    var nodes = [];
    for (var n = 0; n < 8; n++) {
      var startAngle = TWO_PI * n / 8;
      var dist = 18 + Math.random() * 8;
      nodes.push({
        x: mx + Math.cos(startAngle) * dist,
        y: my + Math.sin(startAngle) * dist,
        angle: startAngle,
        size: 1.8 + Math.random() * 1.2,
        pulse: Math.random() * TWO_PI,
        restR: dist,
        tangentBias: (Math.random() > 0.5 ? 1 : -1) * (0.15 + Math.random() * 0.2)
      });
    }

    var sparks = [];
    var ripples = [];
    var trail = [];
    var TRAIL_MAX = 50;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';

      cursorVx = mx - prevMx;
      cursorVy = my - prevMy;
      cursorSpeed = Math.sqrt(cursorVx * cursorVx + cursorVy * cursorVy);
      prevMx = mx; prevMy = my;

      var count = Math.min(Math.ceil(cursorSpeed / 6), 5);
      for (var t = 0; t < count; t++) {
        var frac = t / count;
        trail.push({
          x: mx - cursorVx * frac + (Math.random() - 0.5) * 4,
          y: my - cursorVy * frac + (Math.random() - 0.5) * 4,
          life: 1,
          size: 1.4 + Math.random() * 1.8,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4
        });
      }
      if (trail.length > TRAIL_MAX) trail.splice(0, trail.length - TRAIL_MAX);
    });

    document.addEventListener('mousedown', function () {
      dot.classList.add('cursor-click');
      for (var s = 0; s < 10; s++) {
        var a = TWO_PI * Math.random();
        var v = 1.5 + Math.random() * 3;
        sparks.push({ x: mx, y: my, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, size: 1 + Math.random() * 2 });
      }
      ripples.push({ x: mx, y: my, r: 5, maxR: 40, life: 1 });
    });
    document.addEventListener('mouseup', function () { dot.classList.remove('cursor-click'); });

    var interactives = document.querySelectorAll('a, button, .work-card, .expertise-card, .skills-col, .nav-logo, .theme-toggle, .blog-dimension-card, .blog-preview-card, .blog-cta-btn, input, textarea');
    interactives.forEach(function (el) {
      el.addEventListener('mouseenter', function () { hovering = true; dot.classList.add('cursor-hover'); });
      el.addEventListener('mouseleave', function () { hovering = false; dot.classList.remove('cursor-hover'); });
    });

    document.addEventListener('mouseleave', function () { visible = false; dot.style.opacity = '0'; cvs.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { visible = true; dot.style.opacity = '1'; cvs.style.opacity = '1'; });

    var frame = 0;
    (function loop() {
      frame++;
      cursorSpeed *= 0.85;
      ctx.clearRect(0, 0, cvs.width / dpr, cvs.height / dpr);
      if (!visible) { requestAnimationFrame(loop); return; }

      var agitation = Math.min(cursorSpeed / 12, 1);
      var clr = '255,144,0';
      var clrWarm = '255,180,60';

      // Update node positions
      var nodePositions = [];
      for (var i = 0; i < nodes.length; i++) {
        var nd = nodes[i];
        nd.pulse += 0.04;

        var orbitR = nd.restR + Math.sin(nd.pulse) * 3;
        var targetX = mx + Math.cos(nd.angle) * orbitR;
        var targetY = my + Math.sin(nd.angle) * orbitR;

        var lerpSpeed = 0.18 + (1 - agitation) * 0.15;
        nd.x += (targetX - nd.x) * lerpSpeed;
        nd.y += (targetY - nd.y) * lerpSpeed;

        nd.angle += nd.tangentBias * (0.02 + agitation * 0.04);

        if (agitation > 0.15) {
          nd.x += (Math.random() - 0.5) * agitation * 6;
          nd.y += (Math.random() - 0.5) * agitation * 6;
        }

        nodePositions.push({ x: nd.x, y: nd.y, size: nd.size, pulse: nd.pulse });
      }

      // Draw inter-node connections
      for (var i = 0; i < nodePositions.length; i++) {
        for (var j = i + 1; j < nodePositions.length; j++) {
          var a = nodePositions[i], b = nodePositions[j];
          var d = Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
          if (d < 50) {
            var alpha = (1 - d / 50) * (hovering ? 0.35 : 0.15);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba(' + clr + ',' + alpha + ')';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw center-to-node connections
      for (var i = 0; i < nodePositions.length; i++) {
        var np = nodePositions[i];
        var lineAlpha = ((hovering ? 0.2 : 0.1) + Math.sin(np.pulse) * 0.05) * (1 - agitation * 0.6);
        if (lineAlpha > 0.02) {
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(np.x, np.y);
          ctx.strokeStyle = 'rgba(' + clr + ',' + lineAlpha + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // Draw nodes
      for (var i = 0; i < nodePositions.length; i++) {
        var np = nodePositions[i];
        var glow = hovering ? 0.8 : 0.5 + Math.sin(np.pulse) * 0.2;
        ctx.beginPath();
        ctx.arc(np.x, np.y, np.size * (hovering ? 1.4 : 1), 0, TWO_PI);
        ctx.fillStyle = 'rgba(' + clr + ',' + glow + ')';
        ctx.fill();
        if (hovering) {
          ctx.beginPath();
          ctx.arc(np.x, np.y, np.size * 3, 0, TWO_PI);
          ctx.fillStyle = 'rgba(' + clr + ',0.08)';
          ctx.fill();
        }
      }

      // Draw trail particles
      for (var ti = trail.length - 1; ti >= 0; ti--) {
        var tp = trail[ti];
        tp.x += tp.vx;
        tp.y += tp.vy;
        tp.life -= 0.035;
        if (tp.life <= 0) { trail.splice(ti, 1); continue; }
        var tAlpha = tp.life * tp.life * 0.6;
        var tSize = tp.size * tp.life;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, tSize, 0, TWO_PI);
        var grad = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, tSize);
        grad.addColorStop(0, 'rgba(' + clrWarm + ',' + tAlpha + ')');
        grad.addColorStop(1, 'rgba(' + clr + ',0)');
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Hover synapse sparks
      if (frame % 3 === 0 && hovering) {
        var si = Math.floor(Math.random() * nodePositions.length);
        var ei = (si + 1 + Math.floor(Math.random() * (nodePositions.length - 1))) % nodePositions.length;
        sparks.push({
          x: nodePositions[si].x, y: nodePositions[si].y,
          vx: (nodePositions[ei].x - nodePositions[si].x) * 0.06,
          vy: (nodePositions[ei].y - nodePositions[si].y) * 0.06,
          life: 1, size: 1.5
        });
      }

      // Draw sparks
      for (var i = sparks.length - 1; i >= 0; i--) {
        var sp = sparks[i];
        sp.x += sp.vx; sp.y += sp.vy;
        sp.vx *= 0.96; sp.vy *= 0.96;
        sp.life -= 0.03;
        if (sp.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, TWO_PI);
        ctx.fillStyle = 'rgba(' + clrWarm + ',' + sp.life * 0.7 + ')';
        ctx.fill();
      }

      // Draw ripples
      for (var i = ripples.length - 1; i >= 0; i--) {
        var rp = ripples[i];
        rp.r += (rp.maxR - rp.r) * 0.08;
        rp.life -= 0.03;
        if (rp.life <= 0) { ripples.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, TWO_PI);
        ctx.strokeStyle = 'rgba(' + clr + ',' + rp.life * 0.4 + ')';
        ctx.lineWidth = 1.5 * rp.life;
        ctx.stroke();
      }

      // Ambient pulse ring
      var pulseAlpha = (hovering ? 0.18 : 0.08) * (1 - agitation * 0.7);
      if (pulseAlpha > 0.01) {
        var pulseR = (hovering ? 30 : 20) + Math.sin(frame * 0.03) * 2;
        ctx.beginPath();
        ctx.arc(mx, my, pulseR, 0, TWO_PI);
        ctx.strokeStyle = 'rgba(' + clr + ',' + pulseAlpha + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      requestAnimationFrame(loop);
    })();
  }

  // --- Hero Profile Particles ---
  var hCvs = document.getElementById('hero-particles');
  var hWrap = document.querySelector('.hero-profile-wrap');
  if (hCvs && hWrap) {
    var hCtx = hCvs.getContext('2d');
    var hDpr = window.devicePixelRatio || 1;
    var W, H, centerX, centerY;

    function sizeHero() {
      W = hCvs.offsetWidth;
      H = hCvs.offsetHeight;
      hCvs.width = W * hDpr;
      hCvs.height = H * hDpr;
      hCtx.setTransform(hDpr, 0, 0, hDpr, 0, 0);
      centerX = W / 2;
      centerY = H / 2;
    }
    sizeHero();
    window.addEventListener('resize', sizeHero);

    var NUM = 200;
    var hParts = [];
    var PI2 = Math.PI * 2;
    for (var p = 0; p < NUM; p++) {
      var ang = Math.random() * PI2;
      var rad = 60 + Math.random() * 160;
      var isFollower = p < 24;
      hParts.push({
        x: centerX + Math.cos(ang) * rad,
        y: centerY + Math.sin(ang) * rad,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        homeAngle: ang,
        homeR: rad,
        size: isFollower ? (0.8 + Math.random() * 1.8) : (1 + Math.random() * 2.5),
        alpha: isFollower ? (0.3 + Math.random() * 0.5) : (0.2 + Math.random() * 0.5),
        pulse: Math.random() * PI2,
        pulseSpeed: 0.015 + Math.random() * 0.025,
        orbitSpeed: (0.003 + Math.random() * 0.006) * (Math.random() > 0.5 ? 1 : -1),
        driftPhase: Math.random() * PI2,
        driftFreq: 0.005 + Math.random() * 0.015,
        driftAmp: 0.3 + Math.random() * 0.8,
        cursorSensitivity: 0.4 + Math.random() * 1.2,
        wanderTimer: Math.random() * 300,
        wanderAngle: Math.random() * PI2,
        follower: isFollower
      });
    }

    var hMouseX = centerX, hMouseY = centerY;
    var hActive = false;
    var heroSection = heroEl;
    var edgeProximity = 0;
    var hFrame = 0;

    document.addEventListener('mousemove', function (e) {
      if (!heroSection) return;
      var heroRect = heroSection.getBoundingClientRect();
      hActive = e.clientY >= heroRect.top && e.clientY <= heroRect.bottom &&
                e.clientX >= heroRect.left && e.clientX <= heroRect.right;
      if (hActive) {
        var cvsRect = hCvs.getBoundingClientRect();
        hMouseX = e.clientX - cvsRect.left;
        hMouseY = e.clientY - cvsRect.top;

        var distTop = e.clientY - heroRect.top;
        var distBot = heroRect.bottom - e.clientY;
        var distLeft = e.clientX - heroRect.left;
        var distRight = heroRect.right - e.clientX;
        var minEdgeDist = Math.min(distTop, distBot, distLeft, distRight);
        var FADE_ZONE = 200;
        edgeProximity = minEdgeDist >= FADE_ZONE ? 1 : minEdgeDist / FADE_ZONE;
      } else {
        edgeProximity = 0;
      }
    });

    (function heroLoop() {
      hFrame++;
      hCtx.clearRect(0, 0, W, H);

      var influence = hActive ? edgeProximity : 0;
      var maxR = Math.min(W, H) * 0.45;

      var positions = [];

      for (var i = 0; i < hParts.length; i++) {
        var hp = hParts[i];
        hp.pulse += hp.pulseSpeed;
        hp.homeAngle += hp.orbitSpeed;
        hp.driftPhase += hp.driftFreq;

        hp.wanderTimer--;
        if (hp.wanderTimer <= 0) {
          hp.wanderAngle += (Math.random() - 0.5) * 2.5;
          hp.wanderTimer = 30 + Math.random() * 120;
        }

        var breathe = Math.sin(hp.pulse) * 8 + Math.sin(hp.driftPhase * 1.7) * 4;
        var homeX = centerX + Math.cos(hp.homeAngle) * (hp.homeR + breathe);
        var homeY = centerY + Math.sin(hp.homeAngle) * (hp.homeR + breathe);

        var pullX = (homeX - hp.x) * 0.02;
        var pullY = (homeY - hp.y) * 0.02;

        var driftX = Math.cos(hp.wanderAngle) * hp.driftAmp;
        var driftY = Math.sin(hp.wanderAngle) * hp.driftAmp;

        var noiseX = Math.sin(hFrame * 0.013 + i * 1.7) * 0.4;
        var noiseY = Math.cos(hFrame * 0.017 + i * 2.3) * 0.4;

        var cursorFx = 0, cursorFy = 0;
        if (influence > 0.01) {
          var cdx = hMouseX - hp.x;
          var cdy = hMouseY - hp.y;
          var cDist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (hp.follower) {
            var fLerp = 0.12 + (1 - Math.min(cDist / 80, 1)) * 0.15;
            cursorFx = cdx * fLerp * influence;
            cursorFy = cdy * fLerp * influence;
            hp.vx *= 0.75;
            hp.vy *= 0.75;
            pullX *= (1 - influence);
            pullY *= (1 - influence);
            driftX *= (1 - influence);
            driftY *= (1 - influence);
            noiseX *= (1 - influence);
            noiseY *= (1 - influence);
          } else {
            var attract = Math.max(0, 1 - cDist / 250) * influence * hp.cursorSensitivity;
            cursorFx = cdx * attract * 0.03;
            cursorFy = cdy * attract * 0.03;

            var repelR = 40;
            if (cDist < repelR && cDist > 0) {
              var repel = (1 - cDist / repelR) * influence * 2;
              cursorFx -= (cdx / cDist) * repel;
              cursorFy -= (cdy / cDist) * repel;
            }
          }
        }

        hp.vx += pullX + driftX + noiseX + cursorFx;
        hp.vy += pullY + driftY + noiseY + cursorFy;

        hp.vx *= 0.92;
        hp.vy *= 0.92;

        hp.x += hp.vx;
        hp.y += hp.vy;

        var flickerAlpha = hp.alpha * (0.5 + Math.sin(hp.pulse * 1.5) * 0.3 + Math.sin(hp.driftPhase * 2.1) * 0.2);
        if (influence > 0.01) flickerAlpha *= (0.8 + influence * 0.6);

        var edgeDx = hp.x - centerX, edgeDy = hp.y - centerY;
        var edgeDist = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);
        var edgeFade = edgeDist < maxR ? 1 : Math.max(0, 1 - (edgeDist - maxR) / (maxR * 0.3));
        flickerAlpha *= edgeFade;

        var sz = hp.size * (0.8 + Math.sin(hp.pulse * 0.8) * 0.3);

        positions.push({ x: hp.x, y: hp.y, alpha: flickerAlpha, size: sz });

        if (flickerAlpha > 0.01) {
          hCtx.beginPath();
          hCtx.arc(hp.x, hp.y, sz, 0, PI2);
          hCtx.fillStyle = 'rgba(255,144,0,' + flickerAlpha + ')';
          hCtx.fill();

          if (sz > 1.8) {
            hCtx.beginPath();
            hCtx.arc(hp.x, hp.y, sz * 2.5, 0, PI2);
            hCtx.fillStyle = 'rgba(255,144,0,' + (flickerAlpha * 0.12) + ')';
            hCtx.fill();
          }
        }
      }

      for (var i = 0; i < positions.length; i++) {
        var a = positions[i];
        if (a.alpha < 0.01) continue;
        for (var j = i + 1; j < positions.length; j++) {
          var b = positions[j];
          if (b.alpha < 0.01) continue;
          var dx = a.x - b.x, dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            var lineA = (1 - dist / 80) * 0.07 * Math.min(a.alpha, b.alpha) * (influence > 0.01 ? 1.5 : 1);
            var midDx = ((a.x + b.x) / 2) - centerX, midDy = ((a.y + b.y) / 2) - centerY;
            var midDist = Math.sqrt(midDx * midDx + midDy * midDy);
            var lineFade = midDist < maxR ? 1 : Math.max(0, 1 - (midDist - maxR) / (maxR * 0.3));
            lineA *= lineFade;
            if (lineA > 0.004) {
              hCtx.beginPath();
              hCtx.moveTo(a.x, a.y);
              hCtx.lineTo(b.x, b.y);
              hCtx.strokeStyle = 'rgba(255,144,0,' + lineA + ')';
              hCtx.lineWidth = 0.5;
              hCtx.stroke();
            }
          }
        }
      }

      requestAnimationFrame(heroLoop);
    })();
  }
})();
