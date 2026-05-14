const API_KEY = 'f22b8df492bf289db1c9aae5f5e3cc24';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

// Global State
window.currentImdbId = "";
window.currentTitle = "";

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchMovies(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
});

async function fetchMovies(url) {
    const res = await fetch(url);
    const data = await res.json();
    renderMovies(data.results);
}

function renderMovies(movies) {
    const grid = document.getElementById('movie-grid');
    grid.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="initiateStream('${movie.id}', '${movie.title.replace(/'/g, "\\'")}')">
            <img src="${IMG_PATH + movie.poster_path}" alt="${movie.title}">
        </div>
    `).join('');
}

async function initiateStream(tmdbId, title) {
    const res = await fetch(`${BASE_URL}/movie/${tmdbId}/external_ids?api_key=${API_KEY}`);
    const data = await res.json();
    
    if (data.imdb_id) {
        window.currentImdbId = data.imdb_id;
        window.currentTitle = title;
        loadServer(1);
        document.getElementById('player-wrapper').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        alert("Streaming source not found.");
    }
}

function loadServer(num) {
    const player = document.getElementById('video-player');
    const titleDisp = document.getElementById('playing-title');
    
    const sources = {
        1: `https://vidsrc.to/embed/movie/${window.currentImdbId}`,
        2: `https://vidsrc.me/embed/movie?imdb=${window.currentImdbId}`
    };

    player.src = sources[num];
    titleDisp.innerText = `${window.currentTitle} - Server ${num}`;
}
