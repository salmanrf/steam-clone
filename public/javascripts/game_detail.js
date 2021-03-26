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

const gameScreenshotsSlider = (() => {
  const highlight = document.querySelector("#game-ss-display img");
  const screenshots = document.querySelectorAll(".game-ss img");

  let active = 0;
  screenshots[0].classList.add("game-ss-active");
  highlight.src = screenshots[0].src;

  for(let i = 0; i < screenshots.length; i++) {
    screenshots[i].addEventListener("click", () => {
      if(i !== active) {
        screenshots[i].classList.add("game-ss-active");
        highlight.src = screenshots[i].src;

        screenshots[active].classList.remove("game-ss-active");
        active = i;
      }
    });
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