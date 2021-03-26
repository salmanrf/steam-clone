const previewTabsAside = (() => {
  const gameTabItems = document.querySelectorAll(".tab-game");
  const gameAsides = document.querySelectorAll(".game-aside");
  
  let active = 0;

  gameAsides[0].style.opacity = 1;

  for(let i = 0; i < gameTabItems.length; i++) {
    gameTabItems[i].addEventListener("mouseover", () => {
      if(i !== active) {
        gameAsides[i].style.opacity = 1;
        gameAsides[active].style.opacity = 0;
        active = i;
      }
    });

    gameTabItems[i].addEventListener("mouseleave", () => {
      gameAsides[i].style.opacity = 0;
      gameAsides[active].style.opacity = 1;
    });
  }
})();

const previewFeatured = (() => {
  const featuredGames = document.querySelectorAll(".featured-game");

  for(let fg of featuredGames) {
    const mainDisplay = fg.querySelector(".featured-main-display");
    const mdOverlay = mainDisplay.querySelector(".preview-overlay");
    const mdOverlayImg = mdOverlay.querySelector(".preview-overlay img");
    
    const fgScreenshots = fg.querySelectorAll(".ftr-game-ss img");
    
    for(let ss of fgScreenshots) {
      ss.addEventListener("mouseover", () => {
        // mdOverlay.style.display = "block";
        mdOverlay.style.opacity = 1;
        mdOverlayImg.src = ss.src;
      });

      ss.addEventListener("mouseleave", () => {        
        mdOverlay.style.opacity = 0;
      });
    }
  }
})();

const featuredCarousel = (() => {
  const featuredDisplay = document.querySelector("#featured-displayed");
  
  const slides = document.querySelectorAll(".featured-game");
  const slideCount = slides.length;
  let slide = 1;
  let position = 0;
  
  window.addEventListener("resize" , () => {
    featuredDisplay.style.left = 0 + "px";
    slide = 1;
    position = 0;
  });

  const next = () => {
    const elementWidth = document.querySelector(".featured-game").offsetWidth + 25;

    if(slide < slideCount) {
      featuredDisplay.style.left = (position - elementWidth) + 'px';
      position -= elementWidth;
      slide += 1;
    }
  }
  
  const prev = () => {
    const elementWidth = document.querySelector(".featured-game").offsetWidth + 25;

    if(slide > 1) {
      featuredDisplay.style.left = (position + elementWidth) + 'px';
      position += elementWidth;
      slide -= 1;
    }
  }
  
  const prevFtr = document.querySelector("#prev-ftr");
  prevFtr.addEventListener("click", prev);
  
  const nextFtr = document.querySelector("#next-ftr");
  nextFtr.addEventListener("click", next);
})();

const specialsCarousel = (() => {
  const specialsCarousel = document.querySelector("#specials-carousel"); 
  const specialsDisplay = document.querySelector("#specials-displayed");
  
  const slideCount = (document.querySelectorAll(".special-game").length / 2);
  let slide = 1;
  let position = 0;

  window.addEventListener("resize" , () => {
    specialsDisplay.style.left = 0 + "px";
    slide = 1;
    position = 0;
  });
  
  const next = () => {
    if(slide < slideCount) {
      specialsDisplay.style.left = (position - 325) + 'px';
      position -= 325;
      slide += 1;
    }
  }
  
  const prev = () => {
    if(slide > 1) {
      specialsDisplay.style.left = (position + 325) + 'px';
      position += 325;
      slide -= 1;
    }
  }
 
  const prevSp = document.querySelector("#prev-sp");
  prevSp.addEventListener("click", prev);

  const nextSp = document.querySelector("#next-sp");
  nextSp.addEventListener("click", next);
})();

const hamburgerMenuSlider = (() => {
  const slidingMenu = document.querySelector("#main-header");
  const overlay = document.querySelector(".sliding-menu-overlay");
  // false === inactive, true === active
  let state = false;

  document.querySelector("header .hamburger-menu").addEventListener("click", () => {
    if(!state) {
      openMenu();
    }
  });
  
  const openMenu = () => {
    slidingMenu.style.left = 0;
    overlay.style.display = "block";
    overlay.addEventListener("click", closeMenu);
    state = true;
  }

  const closeMenu = () => {
    slidingMenu.style.left = "-100%";
    overlay.style.display = "none";
    overlay.removeEventListener("click", closeMenu);
    state = false;
  }
})();

const slideDownMenu = (() => {
  const navItems = document.querySelectorAll(".store-nav-item");

  for(let item of navItems) {
    const slidingMenu = item.querySelector(".slidedown-menu");
    
    if(slidingMenu) {
      const collapsedItems = slidingMenu.querySelectorAll(".slidedown-menu-item");

      let state = false;
      
      item.addEventListener("click", () => {
        if(!state) {
          slidingMenu.style.height = ((collapsedItems.length * 38) + 17) + "px";
          state = true;
          item.classList.add("store-nav-item-active");
        } else {
          slidingMenu.style.height = 0;
          state = false;
          item.classList.remove("store-nav-item-active");
        }
      });
    }
  }
})();
