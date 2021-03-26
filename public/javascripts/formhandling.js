const coverInput = document.querySelector("#cover");
const coverPreview = document.querySelector("#cover-image .image-preview");
const coverValidationMsg = document.querySelector("#cover-image .validation-result p");

let coverValid;

if(coverPreview.src) {
  coverValid = true;
  coverValidationMsg.textContent = "";
} else {
  coverValid = false;
  coverValidationMsg.textContent = "Click the box to chose a cover image";
}

coverPreview.style.opacity = 1;

coverInput.addEventListener("change", event => {
  coverPreview.style.opacity = 0;

  if(validFileType(event.target.files[0])) {
    coverPreview.src = URL.createObjectURL(event.target.files[0]);
    coverPreview.style.opacity = 1;

    coverValid = true;
    coverValidationMsg.textContent = "";
  } else {
    coverValid = false;
    coverValidationMsg.textContent = "Invalid file type, use only jpg or png";
  }
});

const screenshotInput = document.querySelector("#screenshots-image #screenshots");
const screenshotPreview = document.querySelector("#screenshots-preview #screenshots-container");
const screenshotItems = screenshotPreview.querySelectorAll(".screenshot");
const ssValidationMsg = document.querySelector("#screenshots-image .validation-result p");

let ssValid;

if(screenshotItems.length <= 0) {
  ssValid = false;
  ssValidationMsg.textContent = "Pick at least one screenshot";
} else {
  ssValid = true;
  ssValidationMsg.textContent = "";
}

screenshotInput.addEventListener("change", event => {
  
  for(let ss of screenshotItems) {
    ss.remove();
  }

  const files = event.target.files;

  for(let file of files) {
   if(!validFileType(file)) {
    ssValid = false;
    ssValidationMsg.textContent = "Invalid file type, use only jpg or png";
    return;
   }
  }

  ssValid = true;
  ssValidationMsg.textContent = "";

  if(files.length > 10) {
    ssValidationMsg.textContent = "Warning!, only 10 files will be uploaded to the server";
  }

  for(let file of files) {
    const screenshot = document.createElement("div");
    screenshot.setAttribute("class", "screenshot");

    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.alt = "game screenshot";

    screenshot.appendChild(image);
    screenshotPreview.appendChild(screenshot);
  }  
});

const price = document.querySelector("#price");
let priceValid = price.value && !/\D/.test(price.value) ? true : false;
const priceValidationMsg = document.querySelector("#game-price .validation-result p");

price.addEventListener("input", event => {
  if(/\D/.test(event.target.value)) {
    priceValid = false;
    priceValidationMsg.textContent = "Must be an integer, min: 0";
  } else {
    priceValid = true;
    priceValidationMsg.textContent = "";
  }
});

const gameForm = document.querySelector("#game-form");

gameForm.addEventListener("submit", event => {
  if(!coverValid || !ssValid || !priceValid) {
    event.preventDefault();
    return;
  }

  if(!/\D/.test(event.target.value)) {
    event.target.value = parseInt(event.target.value, 10);
  }  
})

const validFileType = (file) => {
  const fileTypes = [
    "image/jpeg",
    "image/png"
  ];

  return fileTypes.includes(file.type);
}

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