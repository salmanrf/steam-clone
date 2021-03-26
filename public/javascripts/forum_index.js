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

const postContentInput = document.querySelector("#post_content");

const autoResizeTextarea = (() => {

  let maxchar = Math.floor((postContentInput.offsetWidth / 14) * (postContentInput.offsetHeight / 14));

  window.addEventListener("resize", () => {
    maxchar = Math.floor((postContentInput.offsetWidth / 14) * (postContentInput.offsetHeight / 14) - 36);

    if(postContentInput.value.length >= maxchar) {
      do {
        postContentInput.rows = parseInt(postContentInput.rows) + 1;
        maxchar = Math.floor((postContentInput.offsetWidth / 14) * (postContentInput.offsetHeight / 14) - 36);
      } while(postContentInput.value.length >= maxchar);
    }
  });

  postContentInput.addEventListener("input", event => {  
    if(event.target.value.length >= maxchar) {
      do {
        postContentInput.rows = parseInt(postContentInput.rows) + 1;
        maxchar = Math.floor((postContentInput.offsetWidth / 14) * (postContentInput.offsetHeight / 14) - 36);
      } while(event.target.value.length >= maxchar);
    }  
  });
})();

let postTitleInput = document.querySelector("#post_title");
let postTitleValid = false;

const validationMsg = document.querySelector(".create-post-validation");

postContentInput.addEventListener("change", event => {
  if(event.target.value) {
    postContentValid = true;
    validationMsg.textContent = " ";
  } else {
      postContentValid = false;
      validationMsg.textContent = "Insert a title !";
  }
});

let postContentValid = false;

postContentInput.addEventListener("change", event => {
  if(event.target.value) {
    postContentValid = true;
    validationMsg.textContent = " ";
  } else {
    postContentValid = false;
    validationMsg.textContent = "Say something !";
  }
});

const newpostForm = document.querySelector("#create-post-form ");

newpostForm.addEventListener("submit", event => {
  if(!(postTitleInput && postContentValid)) {
    validationMsg.textContent = "Fill all required fields !";
    event.preventDefault();
  } else {
    validationMsg.textContent = " ";
  }
});

const togglePostForm = (() => {
  const createPostBtn = document.querySelector("#new-post-btn");
  const createPostContainer = document.querySelector("#create-post-container");

  createPostBtn.addEventListener("click", () => {
    createPostContainer.style["min-height"] = "285px";
    createPostContainer.style["margin-bottom"] = "5px";
  });
})();