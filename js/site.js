(function () {
  // --- Sticky Nav, Scroll Highlights, Smooth Scroll ---
  var nav = document.getElementById('site-nav');
  var toggle = nav.querySelector('.nav-toggle');
  var menu = nav.querySelector('.nav-links');
  var links = nav.querySelectorAll('.nav-links a');
  var sections = [];

  links.forEach(function (link) {
    var id = link.getAttribute('href').substring(1);
    var el = document.getElementById(id);
    if (el) sections.push({ id: id, el: el, link: link });
  });

  var heroHeight = document.getElementById('fh5co-header').offsetHeight;
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
    links.forEach(function (l) { l.classList.remove('active'); });
    if (current) {
      var active = nav.querySelector('a[href="#' + current + '"]');
      if (active) active.classList.add('active');
    }
  });

  links.forEach(function (link) {
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

    var interactives = document.querySelectorAll('a, button, .work-card, .expertise-card, .skills-col, .nav-logo, .theme-toggle, input, textarea');
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
})();
