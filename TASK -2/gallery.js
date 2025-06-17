const galleryContainer = document.getElementById("galleryContainer");
const favoritesContainer = document.getElementById("favoritesContainer");
const deletedContainer = document.getElementById("deletedContainer");
const imageURL = document.getElementById("imageURL");
const toggleModeBtn = document.getElementById("toggleMode");
const themeBtn = document.getElementById("cycleTheme");
const clearBtn = document.getElementById("clearAll");
const searchBox = document.getElementById("searchBox");

const themes = [
  ["#ff9a9e", "#fad0c4"],
  ["#a1c4fd", "#c2e9fb"],
  ["#fbc2eb", "#a6c1ee"]
];

let currentThemeIndex = 0;

function updateBackgroundGradient() {
  const [start, end] = themes[currentThemeIndex];
  document.body.style.background = `linear-gradient(135deg, ${start}, ${end})`;
}

themeBtn.addEventListener("click", () => {
  if (!document.body.classList.contains("dark-mode")) {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    updateBackgroundGradient();
  }
});

toggleModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

clearBtn.addEventListener("click", () => {
  const allImages = JSON.parse(localStorage.getItem("imageGallery")) || [];
  saveToStorage("deletedGallery", ...allImages);
  localStorage.removeItem("imageGallery");
  galleryContainer.innerHTML = "";
  loadImagesFromStorage("deletedGallery", deletedContainer, false, true);
});

window.onload = () => {
  loadImagesFromStorage("imageGallery", galleryContainer, true);
  loadImagesFromStorage("favoritesGallery", favoritesContainer, false);
  loadImagesFromStorage("deletedGallery", deletedContainer, false, true);
  updateBackgroundGradient();
};

function addImageByURL() {
  const url = imageURL.value.trim();
  if (!url) return;

  createImageBox(url, galleryContainer, true);
  saveToStorage("imageGallery", url);
  imageURL.value = "";
}

function createImageBox(url, container, allowFavorite = false, isDeleted = false) {
  const imgBox = document.createElement("div");
  imgBox.className = "gallery-item";

  const img = document.createElement("img");
  img.src = url;
  img.onclick = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.innerHTML = "✖";
  removeBtn.onclick = () => {
    container.removeChild(imgBox);
    const key = container === galleryContainer ? "imageGallery" :
                container === favoritesContainer ? "favoritesGallery" : "";
    if (key) removeFromStorage(key, url);
    if (container !== deletedContainer) {
      createImageBox(url, deletedContainer, false, true);
      saveToStorage("deletedGallery", url);
    }
  };

  imgBox.appendChild(img);
  imgBox.appendChild(removeBtn);

  if (allowFavorite) {
    const favBtn = document.createElement("button");
    favBtn.className = "favorite-btn";
    favBtn.innerText = "⭐";
    favBtn.onclick = () => {
      createImageBox(url, favoritesContainer);
      saveToStorage("favoritesGallery", url);
    };
    imgBox.appendChild(favBtn);
  }

  if (isDeleted) {
    const restoreBtn = document.createElement("button");
    restoreBtn.className = "restore-btn";
    restoreBtn.innerText = "Restore";
    restoreBtn.onclick = () => {
      deletedContainer.removeChild(imgBox);
      removeFromStorage("deletedGallery", url);
      createImageBox(url, galleryContainer, true);
      saveToStorage("imageGallery", url);
    };
    imgBox.appendChild(restoreBtn);
  }

  container.appendChild(imgBox);
}

function saveToStorage(key, ...urls) {
  const data = JSON.parse(localStorage.getItem(key)) || [];
  urls.forEach(url => {
    if (!data.includes(url)) data.push(url);
  });
  localStorage.setItem(key, JSON.stringify(data));
}

function removeFromStorage(key, url) {
  let data = JSON.parse(localStorage.getItem(key)) || [];
  data = data.filter((item) => item !== url);
  localStorage.setItem(key, JSON.stringify(data));
}

function loadImagesFromStorage(key, container, allowFavorite, isDeleted = false) {
  const saved = JSON.parse(localStorage.getItem(key)) || [];
  saved.forEach((url) => createImageBox(url, container, allowFavorite, isDeleted));
}

function showTab(tab) {
  document.getElementById("galleryContainer").style.display = tab === "all" ? "grid" : "none";
  document.getElementById("favoritesContainer").style.display = tab === "favorites" ? "grid" : "none";
  document.getElementById("deletedContainer").style.display = tab === "deleted" ? "grid" : "none";

  document.getElementById("allTab").classList.toggle("active-tab", tab === "all");
  document.getElementById("favoritesTab").classList.toggle("active-tab", tab === "favorites");
  document.getElementById("deletedTab").classList.toggle("active-tab", tab === "deleted");
}

function filterImages() {
  const query = searchBox.value.toLowerCase();
  document.querySelectorAll("#galleryContainer .gallery-item").forEach((item) => {
    const img = item.querySelector("img");
    item.style.display = img.src.toLowerCase().includes(query) ? "block" : "none";
  });
}
