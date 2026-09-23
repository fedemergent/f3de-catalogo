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
      id: "branding", icon: "🎨", title: "Branding & Identidad",
      desc: "Marca, logotipo y lineamientos visuales.",
      active: false, tag: "Próximamente"
    },
    {
      id: "grafico", icon: "🖌️", title: "Diseño Gráfico",
      desc: "Piezas gráficas, menús, señalética y más.",
      active: false, tag: "Próximamente"
    },
    {
      id: "otros", icon: "✨", title: "Otros Proyectos",
      desc: "Más trabajos e ilustración próximamente.",
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

    if(parts.length === 0){
      topnav.innerHTML = "";
      app.innerHTML = renderHome();
      initHeroSlideshow();
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
    var bgPool = [];
    CLIENTS.forEach(function(c){ bgPool.push(imgFull(c.slug, c.cover)); });
    // shuffle-ish sample
    var picks = bgPool.filter(function(_, i){ return i % Math.max(1, Math.floor(bgPool.length/8)) === 0; }).slice(0,8);

    var bgImgs = picks.map(function(src,i){
      return '<img src="'+src+'" alt="" class="'+(i===0?'active':'')+'">';
    }).join("");

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
      '<div class="hero-bg" id="heroBg">'+bgImgs+'</div>' +
      '<div class="hero-overlay"></div>' +
      '<div class="hero-content">' +
        '<img src="img/logo.png" class="hero-logo" alt="F3DE DESIGN">' +
        '<h1 class="hero-title">F3DE <b>DESIGN</b></h1>' +
        '<p class="hero-tagline">Catálogo digital de servicios — diseño, rotulado e identidad visual para proyectos gastronómicos y más.</p>' +
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
  var heroTimer = null;
  function initHeroSlideshow(){
    var wrap = document.getElementById("heroBg");
    if(!wrap) return;
    var imgs = wrap.querySelectorAll("img");
    if(imgs.length < 2) return;
    var idx = 0;
    heroTimer = setInterval(function(){
      imgs[idx].classList.remove("active");
      idx = (idx + 1) % imgs.length;
      imgs[idx].classList.add("active");
    }, 4000);
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

})();
