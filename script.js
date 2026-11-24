
const audio = document.getElementById("audio");

let tracks = [
  { title: "Amor de Fim de Noite", artist: "Orochi", genre: "trap", color: "#743e9b" },
  { title: "Celebridade", artist: "Orochi", genre: "trap", color: "#a13e35" },
  { title: "Mainstreet", artist: "Orochi", genre: "trap", color: "#543b83" },
  { title: "Good Vibe", artist: "Filipe Ret", genre: "trap", color: "#bd813c" },
  { title: "A meu favor", artist: "Filipe Ret", genre: "trap", color: "#416b9b" },
  { title: "Só pra voce lembrar", artist: "Filipe Ret", genre: "rap", color: "#963f49" },
  { title: "Novo Balanço", artist: "Veigh", genre: "trap", color: "#5c8b77" },
  { title: "Engana Dizendo Que Ama", artist: "Veigh", genre: "trap", color: "#8061a6" },
  { title: "Clickbait", artist: "Veigh", genre: "trap", color: "#b05d45" },
  { title: "Evidências", artist: "Chitãozinho & Xororó", genre: "Modão", color: "#9a7545" },
  { title: "Infiel", artist: "Marília Mendonça", genre: "sertanejo", color: "#ad5369" },
  { title: "champagne", artist: "Orochi", genre: "sertanejo", color: "#a66b42" },
  { title: "Pós", artist: "Felipe e Rodrigo", genre: "sertanejo", color: "#548c5d" },
  { title: "Dois gumes", artist: "Felipe e Rodrigo", genre: "sertanejo", color: "#bd7841" },
  { title: "fetiche", artist: "Orochi", genre: "trap", color: "#a52e37" }
  { title: "F F M" , artist: "Felipe Ret" , genre: "trap", color:" #f1f1f1"}
  { title: "Deixa chapar" , artist: "Orochi" , genre: "trap" , color:"#C0C0C0"}
  { title: "MItsubishi" , artist: "Orochi" , genre: "trap" , color: "#FF0000"}
  { title: "Van Cleef" , artist: "Orochi" , genre: "trap" , color: "#FFFF00"}
  { title: "Vermelho ferrari" , artist: "Orochi" , genre: "trap" , color: "#008000"}
];

let currentIndex = -1;
let favorites = new Set();
let currentFilter = "todos";
let currentPage = "inicio";
let shuffle = false;
let repeat = false;

const musicList = document.getElementById("musicList");
const searchInput = document.getElementById("searchInput");
const progress = document.getElementById("progress");
const playBtn = document.getElementById("playBtn");
const toast = document.getElementById("toast");

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function getVisibleTracks() {
  let result = tracks.map((track, index) => ({ ...track, index }));

  if (currentFilter !== "todos") {
    result = result.filter(t => t.genre === currentFilter);
  }

  if (currentPage === "favoritas") {
    result = result.filter(t => favorites.has(t.index));
  }

  if (currentPage === "rap") {
    result = result.filter(t => t.genre === "rap" || t.genre === "trap");
  }

  if (currentPage === "sertanejo") {
    result = result.filter(t => t.genre === "sertanejo");
  }

  if (currentPage === "playlist") {
    result = result.filter(t => t.custom);
  }

  if (currentPage === "biblioteca") {
    result = result.filter(t => t.custom);
  }

  const query = searchInput.value.toLowerCase().trim();

  if (query) {
    result = result.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query) ||
      t.genre.toLowerCase().includes(query)
    );
  }

  return result;
}

function renderTracks() {
  const visible = getVisibleTracks();

  musicList.innerHTML = "";

  document.getElementById("musicCount").textContent =
    `${visible.length} músicas`;

  visible.forEach((track, position) => {
    const row = document.createElement("div");

    row.className = "music-row";

    if (currentIndex === track.index) {
      row.classList.add("selected");
    }

    const liked = favorites.has(track.index);

    row.innerHTML = `
      <span class="song-number">${position + 1}</span>

      <div class="song-column">
        <div class="song-name"></div>
        <div class="song-sub"></div>
      </div>

      <span class="artist-column"></span>
      <span class="genre-column"></span>

      <button class="like-btn ${liked ? "liked" : ""}">
        ${liked ? "♥" : "♡"}
      </button>
    `;

    row.querySelector(".song-name").textContent = track.title;
    row.querySelector(".song-sub").textContent = track.custom
      ? "Sua biblioteca"
      : "VIBE MUSIC";

    row.querySelector(".artist-column").textContent = track.artist;
    row.querySelector(".genre-column").textContent = track.genre;

    row.addEventListener("click", () => {
      playTrack(track.index);
    });

    row.querySelector(".like-btn").addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFavorite(track.index);
    });

    musicList.appendChild(row);
  });
}

function playTrack(index) {
  const track = tracks[index];

  if (!track) return;

  currentIndex = index;

  document.getElementById("currentTitle").textContent = track.title;
  document.getElementById("currentArtist").textContent = track.artist;
  document.getElementById("currentCover").textContent = "♫";
  document.getElementById("currentCover").style.background =
    `linear-gradient(135deg, ${track.color}, #161616)`;

  renderTracks();
  updateHeart();

  if (!track.src) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    playBtn.textContent = "▶";
    document.getElementById("currentTime").textContent = "0:00";
    document.getElementById("duration").textContent = "0:00";
    progress.value = 0;

    notify("Adicione o arquivo de áudio desta música para reproduzir.");
    return;
  }

  audio.src = track.src;

  audio.play().then(() => {
    playBtn.textContent = "Ⅱ";
  }).catch(() => {
    notify("Não foi possível reproduzir este arquivo.");
  });
}

function togglePlay() {
  if (currentIndex === -1) {
    const visible = getVisibleTracks();

    if (visible.length) {
      playTrack(visible[0].index);
    } else {
      notify("Sua lista está vazia.");
    }
    return;
  }

  if (!tracks[currentIndex].src) {
    notify("Importe um arquivo de áudio para ouvir esta faixa.");
    return;
  }

  if (audio.paused) {
    audio.play().then(() => {
      playBtn.textContent = "Ⅱ";
    }).catch(() => notify("Não foi possível reproduzir."));
  } else {
    audio.pause();
    playBtn.textContent = "▶";
  }
}

function nextTrack() {
  if (!tracks.length) return;

  const visible = getVisibleTracks();

  if (!visible.length) return;

  let next;

  if (shuffle && visible.length > 1) {
    do {
      next = visible[Math.floor(Math.random() * visible.length)].index;
    } while (next === currentIndex);
  } else {
    const position = visible.findIndex(t => t.index === currentIndex);
    next = visible[(position + 1 + visible.length) % visible.length].index;
  }

  playTrack(next);
}

function previousTrack() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  const visible = getVisibleTracks();
  if (!visible.length) return;

  const position = visible.findIndex(t => t.index === currentIndex);
  const previous = visible[
    (position - 1 + visible.length) % visible.length
  ].index;

  playTrack(previous);
}

function toggleFavorite(index) {
  if (favorites.has(index)) {
    favorites.delete(index);
    notify("Removida das favoritas.");
  } else {
    favorites.add(index);
    notify("Adicionada às favoritas ♥");
  }

  renderTracks();
  updateHeart();
}

function updateHeart() {
  const button = document.getElementById("likeCurrent");

  button.textContent = favorites.has(currentIndex) ? "♥" : "♡";
  button.classList.toggle("liked", favorites.has(currentIndex));
}

// Controles do player

playBtn.addEventListener("click", togglePlay);

document.getElementById("nextBtn").addEventListener("click", nextTrack);

document.getElementById("prevBtn").addEventListener("click", previousTrack);

document.getElementById("likeCurrent").addEventListener("click", () => {
  if (currentIndex !== -1) toggleFavorite(currentIndex);
});

document.getElementById("shuffleBtn").addEventListener("click", function() {
  shuffle = !shuffle;
  this.classList.toggle("active", shuffle);
  notify(shuffle ? "Modo aleatório ativado." : "Modo aleatório desativado.");
});

document.getElementById("repeatBtn").addEventListener("click", function() {
  repeat = !repeat;
  audio.loop = repeat;
  this.classList.toggle("active", repeat);
  notify(repeat ? "Repetição ativada." : "Repetição desativada.");
});

// Cronômetro e barra de progresso

audio.addEventListener("timeupdate", () => {
  if (!Number.isFinite(audio.duration)) return;

  progress.value = (audio.currentTime / audio.duration) * 100;

  document.getElementById("currentTime").textContent =
    formatTime(audio.currentTime);

  document.getElementById("duration").textContent =
    formatTime(audio.duration);
});

audio.addEventListener("loadedmetadata", () => {
  document.getElementById("duration").textContent =
    formatTime(audio.duration);
});

audio.addEventListener("ended", () => {
  if (!repeat) nextTrack();
});

progress.addEventListener("input", () => {
  if (Number.isFinite(audio.duration)) {
    audio.currentTime = (progress.value / 100) * audio.duration;
  }
});

// Volume

document.getElementById("volume").addEventListener("input", event => {
  audio.volume = Number(event.target.value);
});

audio.volume = 0.7;

// Pesquisa

searchInput.addEventListener("input", renderTracks);

// Filtros por gênero

document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    document.querySelectorAll(".category").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    renderTracks();
  });
});

// Navegação

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => {
    currentPage = button.dataset.page;

    document.querySelectorAll(".nav-btn").forEach(item => {
      item.classList.remove("active");
    });

    if (button.classList.contains("nav-btn")) {
      button.classList.add("active");
    }

    currentFilter = "todos";
    searchInput.value = "";

    document.querySelectorAll(".category").forEach(item => {
      item.classList.toggle("active", item.dataset.filter === "todos");
    });

    const titles = {
      inicio: "Músicas para você",
      buscar: "Explore músicas",
      biblioteca: "Sua biblioteca",
      favoritas: "Suas músicas curtidas",
      playlist: "Minha playlist",
      rap: "Rap e Trap",
      sertanejo: "Sertanejo"
    };

    document.getElementById("musicTitle").textContent =
      titles[currentPage] || "Músicas para você";

    renderTracks();
  });
});

// Cards de gêneros

document.querySelectorAll("[data-filter-card]").forEach(card => {
  card.addEventListener("click", () => {
    currentPage = "inicio";
    currentFilter = card.dataset.filterCard;

    document.querySelectorAll(".category").forEach(item => {
      item.classList.toggle(
        "active",
        item.dataset.filter === currentFilter
      );
    });

    document.getElementById("musicTitle").textContent =
      card.querySelector("h3").textContent;

    renderTracks();
  });
});

// Importar arquivos do computador ou celular

document.getElementById("uploadMusic").addEventListener("change", event => {
  const files = Array.from(event.target.files);

  files.forEach(file => {
    if (!file.type.startsWith("audio/")) return;

    const title = file.name.replace(/\.[^/.]+$/, "");

    tracks.push({
      title,
      artist: "Sua biblioteca",
      genre: "importada",
      color: "#1ed760",
      src: URL.createObjectURL(file),
      custom: true
    });
  });

  currentPage = "biblioteca";
  searchInput.value = "";

  document.getElementById("musicTitle").textContent = "Sua biblioteca";

  renderTracks();

  notify(`${files.length} arquivo(s) importado(s)!`);

  event.target.value = "";
});

// Inicialização

renderTracks();
