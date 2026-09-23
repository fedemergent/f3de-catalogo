(function(){
  "use strict";

  var CLIENTS = (window.FOOD_TRUCKS_DATA && window.FOOD_TRUCKS_DATA.clients) || [];
  var BASE = "img/food-trucks/";

  var SERVICES = [
    {
      id: "food-trucks", icon: "🚚", title: "Food Trucks",
      desc: "Diseño y rotulado de carros de comida para distintos clientes.",
      active: true, tag: "Catálogo"
    },
    {
      id: "productos", icon: "📦", title: "Diseño de Productos y Servicios",
      desc: "Desarrollo integral de productos, de la idea a la producción.",
      active: false, tag: "Próximamente"
    },
    {
      id: "concept", icon: "✏️", title: "Concept Design",
      desc: "Exploración conceptual y definición visual de nuevas ideas.",
      active: false, tag: "Próximamente"
    },
    {
      id: "modelado3d", icon: "🧊", title: "Modelado 3D",
      desc: "Modelado digital de productos y superficies de clase A.",
      active: false, tag: "Próximamente"
    },
    {
      id: "animacion3d", icon: "🎬", title: "Animación / Simulación 3D",
      desc: "Renders animados y simulaciones para presentar tus proyectos.",
      active: false, tag: "Próximamente"
    },
    {
      id: "prototipado", icon: "🖨️", title: "Prototipado / Impresión 3D",
      desc: "Prototipos funcionales y modelos impresos en 3D.",
      active: false, tag: "Próximamente"
    },
    {
      id: "consultoria", icon: "🎓", title: "Consultorías / Capacitación",
      desc: "Asesoría y formación en diseño y desarrollo de producto.",
      active: false, tag: "Próximamente"
    }
  ];

  function slugify_find(slug){
    for(var i=0;i<CLIENTS.length;i++){ if(CLIENTS[i].slug===slug) return CLIENTS[i]; }
    return null;
  }

  function imgFull(slug, file){ return BASE + slug + "/full/" + file; }
  function imgThumb(slug, file){ return BASE + slug + "/thumb/" + file; }

  // ---------------- Router ----------------
  function currentRoute(){
    var hash = window.location.hash.replace(/^#\/?/, "");
    var parts = hash.split("/").filter(Boolean);
    return parts; // [] -> home, ["food-trucks"] -> ft home, ["food-trucks","slug"] -> client
  }

  function navTo(hash){ window.location.hash = hash; }

  window.addEventListener("hashchange", render);
  window.addEventListener("DOMContentLoaded", render);

  function render(){
    var parts = currentRoute();
    var app = document.getElementById("app");
    var topnav = document.getElementById("topnav");
    destroyActiveCarousel();
    destroyHeroMesh();

    if(parts.length === 0){
      topnav.innerHTML = "";
      app.innerHTML = renderHome();
      initHeroMesh();
      bindHomeEvents();
    } else if(parts[0] === "food-trucks" && !parts[1]){
      topnav.innerHTML = '<a href="#/">Inicio</a><span class="crumb-sep">/</span><span>Food Trucks</span>';
      app.innerHTML = renderFoodTrucksHome();
      initCarousel(document.getElementById("mainCarousel"), buildFtSlides());
      bindClientCardEvents();
    } else if(parts[0] === "food-trucks" && parts[1]){
      var client = slugify_find(parts[1]);
      if(!client){ navTo("/food-trucks"); return; }
      topnav.innerHTML = '<a href="#/">Inicio</a><span class="crumb-sep">/</span><a href="#/food-trucks">Food Trucks</a><span class="crumb-sep">/</span><span>' + client.name + '</span>';
      app.innerHTML = renderClientDetail(client);
      initCarousel(document.getElementById("mainCarousel"), buildClientSlides(client));
      bindGalleryEvents(client);
    } else {
      navTo("/");
    }
    window.scrollTo(0,0);
  }

  // ---------------- Views ----------------
  function renderHome(){
    var cards = SERVICES.map(function(s){
      var cls = "service-card" + (s.active ? " active" : " soon");
      var attr = s.active ? ' data-goto="#/'+s.id+'"' : "";
      return '<div class="'+cls+'"'+attr+'>'+
        '<span class="tag">'+s.tag+'</span>'+
        '<span class="icon">'+s.icon+'</span>'+
        '<h3>'+s.title+'</h3>'+
        '<p>'+s.desc+'</p>'+
      '</div>';
    }).join("");

    return '' +
    '<section class="hero view">' +
      '<canvas class="hero-mesh" id="heroMesh"></canvas>' +
      '<div class="hero-overlay"></div>' +
      '<div class="hero-content">' +
        '<img src="img/logo.png" class="hero-logo" alt="F3DE DESIGN">' +
        '<h1 class="hero-title">F3DE <b>DESIGN</b></h1>' +
        '<p class="hero-tagline">Estudio de Diseño Industrial — de la idea al producto: concept design, modelado y prototipado 3D.</p>' +
        '<div class="services-grid">'+cards+'</div>' +
      '</div>' +
    '</section>';
  }

  function renderFoodTrucksHome(){
    var cards = CLIENTS.map(function(c){
      return '<div class="client-card" data-slug="'+c.slug+'">' +
        '<div class="client-thumb"><img src="'+imgThumb(c.slug, c.cover)+'" alt="'+c.name+'" loading="lazy"></div>' +
        '<div class="client-info"><h4>'+c.name+'</h4><span>'+c.count+' fotos</span></div>' +
      '</div>';
    }).join("");

    return '' +
    '<div class="page-head view">' +
      '<a href="#/" class="back-link">&#8592; Inicio</a>' +
      '<h1 class="page-title">Food Trucks</h1>' +
      '<p class="page-sub">Diseño y rotulado de carros de comida — recorré el carrusel o elegí un cliente.</p>' +
    '</div>' +
    '<section class="section" style="padding-top:0">' +
      '<div class="carousel" id="mainCarousel"></div>' +
      '<h2 class="section-title" style="margin-top:44px">Clientes</h2>' +
      '<p class="section-sub">'+CLIENTS.length+' proyectos realizados</p>' +
      '<div class="client-grid">'+cards+'</div>' +
    '</section>';
  }

  function renderClientDetail(client){
    var thumbs = client.images.map(function(file, i){
      return '<div class="gallery-item" data-index="'+i+'">' +
        '<img src="'+imgThumb(client.slug, file)+'" alt="'+client.name+' foto '+(i+1)+'" loading="lazy">' +
      '</div>';
    }).join("");

    return '' +
    '<div class="page-head view">' +
      '<a href="#/food-trucks" class="back-link">&#8592; Volver a Food Trucks</a>' +
      '<h1 class="page-title">'+client.name+'</h1>' +
      '<p class="page-sub">'+client.count+' fotos</p>' +
    '</div>' +
    '<section class="section" style="padding-top:0">' +
      '<div class="carousel" id="mainCarousel"></div>' +
      '<h2 class="section-title" style="margin-top:44px">Todas las fotos</h2>' +
      '<p class="section-sub">Tocá una miniatura para ampliar</p>' +
      '<div class="gallery-grid" id="galleryGrid">'+thumbs+'</div>' +
    '</section>';
  }

  // ---------------- Home behaviors ----------------
  var meshState = null;

  function destroyHeroMesh(){
    if(!meshState) return;
    if(meshState.rafId) cancelAnimationFrame(meshState.rafId);
    window.removeEventListener("resize", meshState.onResize);
    meshState.hero.removeEventListener("mousemove", meshState.onMouseMove);
    meshState.hero.removeEventListener("mouseleave", meshState.onMouseLeave);
    meshState.hero.removeEventListener("touchmove", meshState.onTouchMove);
    meshState.hero.removeEventListener("touchend", meshState.onMouseLeave);
    meshState = null;
  }

  function initHeroMesh(){
    var canvas = document.getElementById("heroMesh");
    var hero = document.querySelector(".hero");
    if(!canvas || !hero) return;

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    var mouse = { x: 0, y: 0, active: false };
    var grid = { cols: 0, rows: 0, pointsPerRow: 0, points: [] };
    var w = 0, h = 0;
    var influenceR = 170;
    var pushStrength = 22;

    function buildGrid(){
      var targetCount = w < 640 ? 46 : 96;
      var spacing = Math.max(50, Math.sqrt((w * h) / targetCount));
      var cols = Math.max(3, Math.ceil(w / spacing));
      var rows = Math.max(3, Math.ceil(h / spacing));
      var stepX = w / cols, stepY = h / rows;
      var points = [];
      for(var j = 0; j <= rows; j++){
        for(var i = 0; i <= cols; i++){
          points.push({
            baseX: i * stepX, baseY: j * stepY,
            ampX: stepX * 0.16, ampY: stepY * 0.16,
            phase: Math.random() * Math.PI * 2,
            speed: 0.25 + Math.random() * 0.25,
            x: i * stepX, y: j * stepY
          });
        }
      }
      grid = { cols: cols, rows: rows, pointsPerRow: cols + 1, points: points };
    }

    function resize(){
      var rect = hero.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    function strokeEdge(p1, p2){
      var f = Math.max(p1.f, p2.f);
      ctx.strokeStyle = "rgba(232," + Math.round(57 + f*90) + "," + Math.round(27 + f*80) + "," + (0.08 + f*0.55).toFixed(3) + ")";
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    function fillTri(p1, p2, p3, f){
      ctx.fillStyle = "rgba(232,90,60," + (f*0.14).toFixed(3) + ")";
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();
    }

    function draw(t){
      ctx.clearRect(0, 0, w, h);
      var pts = grid.points;
      var n = pts.length;
      var disp = new Array(n);

      for(var k = 0; k < n; k++){
        var p = pts[k];
        if(!reduceMotion){
          p.x = p.baseX + Math.sin(t * 0.001 * p.speed + p.phase) * p.ampX;
          p.y = p.baseY + Math.cos(t * 0.0011 * p.speed + p.phase) * p.ampY;
        }
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var dist = mouse.active ? Math.sqrt(dx*dx + dy*dy) : Infinity;
        if(dist < influenceR){
          var f = 1 - dist / influenceR;
          var push = f * f * pushStrength;
          var safeDist = dist || 0.001;
          disp[k] = { x: p.x + (dx/safeDist)*push, y: p.y + (dy/safeDist)*push, f: f };
        } else {
          disp[k] = { x: p.x, y: p.y, f: 0 };
        }
      }

      ctx.lineWidth = 1;
      var cols = grid.cols, rows = grid.rows, ppr = grid.pointsPerRow;
      for(var j = 0; j <= rows; j++){
        for(var i = 0; i <= cols; i++){
          var a = disp[j*ppr + i];
          if(i < cols) strokeEdge(a, disp[j*ppr + i + 1]);
          if(j < rows) strokeEdge(a, disp[(j+1)*ppr + i]);
          if(i < cols && j < rows){
            var b = disp[j*ppr + i + 1];
            var c = disp[(j+1)*ppr + i];
            var d = disp[(j+1)*ppr + i + 1];
            strokeEdge(a, d);
            var maxF = Math.max(a.f, b.f, c.f, d.f);
            if(maxF > 0.04){
              fillTri(a, b, d, maxF);
              fillTri(a, d, c, maxF);
            }
          }
        }
      }

      if(!reduceMotion){
        meshState.rafId = requestAnimationFrame(draw);
      }
    }

    function onMouseMove(e){
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
      if(reduceMotion) draw(0);
    }
    function onMouseLeave(){
      mouse.active = false;
      if(reduceMotion) draw(0);
    }
    function onTouchMove(e){
      if(!e.touches || !e.touches.length) return;
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
      mouse.active = true;
      if(reduceMotion) draw(0);
    }
    function onResize(){ resize(); if(reduceMotion) draw(0); }

    resize();
    hero.addEventListener("mousemove", onMouseMove);
    hero.addEventListener("mouseleave", onMouseLeave);
    hero.addEventListener("touchmove", onTouchMove, { passive: true });
    hero.addEventListener("touchend", onMouseLeave);
    window.addEventListener("resize", onResize);

    meshState = { hero: hero, onResize: onResize, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave, onTouchMove: onTouchMove, rafId: null };

    if(reduceMotion){ draw(0); } else { meshState.rafId = requestAnimationFrame(draw); }
  }

  function bindHomeEvents(){
    document.querySelectorAll("[data-goto]").forEach(function(el){
      el.addEventListener("click", function(){ navTo(el.getAttribute("data-goto")); });
    });
  }

  function bindClientCardEvents(){
    document.querySelectorAll(".client-card").forEach(function(el){
      el.addEventListener("click", function(){
        navTo("/food-trucks/" + el.getAttribute("data-slug"));
      });
    });
  }

  function bindGalleryEvents(client){
    var items = document.querySelectorAll(".gallery-item");
    var fullSrcs = client.images.map(function(f){ return imgFull(client.slug, f); });
    items.forEach(function(el){
      el.addEventListener("click", function(){
        openLightbox(fullSrcs, parseInt(el.getAttribute("data-index"), 10));
      });
    });
  }

  // ---------------- Carousel slide builders ----------------
  function buildFtSlides(){
    return CLIENTS.map(function(c){
      return { src: imgFull(c.slug, c.cover), caption: c.name, sub: c.count + " fotos", goto: "/food-trucks/"+c.slug };
    });
  }
  function buildClientSlides(client){
    return client.images.map(function(file, i){
      return { src: imgFull(client.slug, file), caption: client.name, sub: (i+1)+" / "+client.images.length, lightboxIndex: i };
    });
  }

  // ---------------- Generic Carousel ----------------
  var activeCarousel = null;
  function destroyActiveCarousel(){
    if(activeCarousel && activeCarousel.timer){ clearInterval(activeCarousel.timer); }
    activeCarousel = null;
  }

  function initCarousel(container, slides){
    if(!container || !slides.length) return;
    var idx = 0;
    var track = document.createElement("div");
    track.className = "carousel-track";

    slides.forEach(function(s, i){
      var slide = document.createElement("div");
      slide.className = "carousel-slide" + (i===0 ? " active" : "");
      slide.innerHTML = '<img src="'+s.src+'" alt="'+s.caption+'" loading="'+(i===0?'eager':'lazy')+'">' +
        '<div class="carousel-caption">'+s.caption+'<span>'+s.sub+'</span></div>';
      if(s.goto){
        slide.addEventListener("click", function(){ navTo(s.goto); });
      } else if(typeof s.lightboxIndex === "number"){
        slide.addEventListener("click", function(){
          var fulls = slides.map(function(x){ return x.src; });
          openLightbox(fulls, s.lightboxIndex);
        });
      }
      track.appendChild(slide);
    });

    var prevBtn = document.createElement("button");
    prevBtn.className = "carousel-arrow prev"; prevBtn.innerHTML = "&#10094;"; prevBtn.setAttribute("aria-label","Anterior");
    var nextBtn = document.createElement("button");
    nextBtn.className = "carousel-arrow next"; nextBtn.innerHTML = "&#10095;"; nextBtn.setAttribute("aria-label","Siguiente");

    var dots = document.createElement("div");
    dots.className = "carousel-dots";
    var dotEls = slides.map(function(_, i){
      var b = document.createElement("button");
      if(i===0) b.className = "active";
      b.addEventListener("click", function(e){ e.stopPropagation(); goTo(i); restartTimer(); });
      dots.appendChild(b);
      return b;
    });

    container.innerHTML = "";
    container.appendChild(track);
    container.appendChild(prevBtn);
    container.appendChild(nextBtn);
    if(slides.length > 1) container.appendChild(dots);

    var slideEls = track.querySelectorAll(".carousel-slide");

    function goTo(newIdx){
      slideEls[idx].classList.remove("active");
      dotEls[idx].classList.remove("active");
      idx = (newIdx + slides.length) % slides.length;
      slideEls[idx].classList.add("active");
      dotEls[idx].classList.add("active");
    }

    function next(){ goTo(idx+1); }
    function prev(){ goTo(idx-1); }

    prevBtn.addEventListener("click", function(e){ e.stopPropagation(); prev(); restartTimer(); });
    nextBtn.addEventListener("click", function(e){ e.stopPropagation(); next(); restartTimer(); });

    var timer = null;
    function startTimer(){ if(slides.length>1) timer = setInterval(next, 3000); }
    function restartTimer(){ if(timer) clearInterval(timer); startTimer(); }
    startTimer();

    // basic touch swipe
    var touchX = null;
    container.addEventListener("touchstart", function(e){ touchX = e.touches[0].clientX; }, {passive:true});
    container.addEventListener("touchend", function(e){
      if(touchX===null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if(Math.abs(dx) > 40){ dx < 0 ? next() : prev(); restartTimer(); }
      touchX = null;
    });

    activeCarousel = { timer: timer };
  }

  // ---------------- Lightbox ----------------
  var lbImages = [], lbIndex = 0;
  var lightboxEl = document.getElementById("lightbox");
  var lbImageEl = document.getElementById("lbImage");
  var lbCounterEl = document.getElementById("lbCounter");

  function openLightbox(images, index){
    lbImages = images; lbIndex = index;
    updateLightbox();
    lightboxEl.hidden = false;
  }
  function closeLightbox(){ lightboxEl.hidden = true; }
  function updateLightbox(){
    lbImageEl.src = lbImages[lbIndex];
    lbCounterEl.textContent = (lbIndex+1) + " / " + lbImages.length;
  }
  function lbNext(){ lbIndex = (lbIndex+1) % lbImages.length; updateLightbox(); }
  function lbPrev(){ lbIndex = (lbIndex-1+lbImages.length) % lbImages.length; updateLightbox(); }

  document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("lbClose").addEventListener("click", closeLightbox);
    document.getElementById("lbNext").addEventListener("click", lbNext);
    document.getElementById("lbPrev").addEventListener("click", lbPrev);
    lightboxEl.addEventListener("click", function(e){ if(e.target === lightboxEl) closeLightbox(); });
    document.addEventListener("keydown", function(e){
      if(lightboxEl.hidden) return;
      if(e.key === "Escape") closeLightbox();
      if(e.key === "ArrowRight") lbNext();
      if(e.key === "ArrowLeft") lbPrev();
    });
  });

  // ---------------- Visit counter ----------------
  document.addEventListener("DOMContentLoaded", function(){
    var box = document.getElementById("visitCount");
    if(!box) return;
    fetch("https://abacus.jasoncameron.dev/hit/f3de-design-catalogo/home-visits")
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(data && typeof data.value === "number"){
          box.textContent = String(data.value).padStart(6, "0");
        } else {
          box.closest(".visit-counter").style.display = "none";
        }
      })
      .catch(function(){
        box.closest(".visit-counter").style.display = "none";
      });
  });

})();
