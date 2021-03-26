const searchForm = document.querySelector("#searchbar form");
const searchInput = document.querySelector("#searchbar form input");

searchForm.addEventListener("submit", event => {
  event.preventDefault();
})

searchInput.addEventListener("input", async event => {
  if(event.target.value) {
    try {
      const httpResponse = await fetch(`/api/game/?keyword=${event.target.value}`);
      const result = await httpResponse.json();
  
      console.log(result);
    } catch(err) {
        console.log(err);
    }
  }
});

// (async () => {
//   try {
//     const httpResponse = await fetch(`/api/game/?keyword=a`);
//     const result = await httpResponse.json();

//     console.log(result);
//   } catch(err) {
//       console.log(err);
//   }
// })();