const profilepicInput = document.querySelector("#profile-picture input");
const profilepicPreview = document.querySelector("#profile-picture img");
const profilepicValidationMsg = document.querySelector("#profilepic-validation");
let profilepicValid = true;

profilepicInput.addEventListener("change", event => {
  const file = event.target.files[0];

  console.log("processing file");

  if(!validFileType(file)) {
    profilepicValid = false;
    profilepicValidationMsg.textContent = "Invalid file type";
    profilepicPreview.src = "";
    return;
  }

  profilepicValid = true;

  console.log(URL.createObjectURL(file));

  profilepicPreview.src = URL.createObjectURL(file);
  profilepicPreview.alt = "profile-picture";
});

const validFileType = file => {
  const validTypes = [
    "image/jpeg",
    "image/png"
  ];

  return validTypes.includes(file.type);
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