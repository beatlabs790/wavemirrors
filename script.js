const API_KEY = 'f22b8df492bf289db1c9aae5f5e3cc24';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_PATH = 'https://image.tmdb.org/t/p/original';

window.currentImdbId = ""; window.currentTmdbId = ""; window.currentTitle = "";

// Loader
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').style.opacity = '0';
        setTimeout(() => document.getElementById('loader').style.display = 'none', 500);
    }, 1000);
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    fetchHero();
    fetchMovies(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, 'movie-grid');
    fetchMovies(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`, 'top-grid');
});

// Fetch Hero Banner
async function fetchHero() {
    const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`);
    const data = await res.json();
    const heroMovie = data.results[0]; // Get the #1 movie

    document.getElementById('hero-banner').style.backgroundImage = `url(${BACKDROP_PATH + heroMovie.backdrop_path})`;
    document.getElementById('hero-title').innerText = heroMovie.title;
    document.getElementById('hero-desc').innerText = heroMovie.overview.substring(0, 150) + "...";
    
    document.getElementById('hero-play').onclick = () => initiateStream(heroMovie.id, heroMovie.title);
}

// Fetch Grids
async function fetchMovies(url, containerId) {
    const res = await fetch(url);
    const data = await res.json();
    const container = document.getElementById(containerId);
    
    container.innerHTML = data.results.slice(0, 15).map(movie => `
        <div class="movie-card" onclick="initiateStream('${movie.id}', '${movie.title.replace(/'/g, "\\'")}')">
            <img src="${IMG_PATH + movie.poster_path}" alt="${movie.title}">
        </div>
    `).join('');
}

// Genres & Search
function loadGenre(genreId) {
    fetchMovies(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`, 'movie-grid');
    document.getElementById('main-section-title').innerText = "Genre Results";
    window.scrollTo({ top: document.getElementById('movie-grid').offsetTop - 100, behavior: 'smooth' });
}

function searchMovies() {
    const q = document.getElementById('searchInput').value;
    if(q) {
        fetchMovies(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${q}`, 'movie-grid');
        document.getElementById('main-section-title').innerText = `Search: ${q}`;
    }
}

// --- FIXED PLAYER LOGIC ---
async function initiateStream(tmdbId, title) {
    const res = await fetch(`${BASE_URL}/movie/${tmdbId}/external_ids?api_key=${API_KEY}`);
    const data = await res.json();
    
    window.currentTmdbId = tmdbId; window.currentTitle = title; window.currentImdbId = data.imdb_id;

    if (window.currentImdbId || window.currentTmdbId) {
        loadServer(1);
        document.getElementById('player-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevents background scrolling!
    } else {
        alert("Video source not found.");
    }
}

function loadServer(num) {
    const player = document.getElementById('video-player');
    const sources = {
        1: `https://vidsrc.pm/embed/movie/${window.currentImdbId}`,
        2: `https://vidsrc.xyz/embed/movie/${window.currentImdbId}`,
        3: `https://autoembed.to/movie/tmdb/${window.currentTmdbId}`
    };

    player.src = sources[num];
    document.getElementById('playing-title').innerText = window.currentTitle;
    document.getElementById('server-indicator').innerText = `Node: 0x${num} Active`;
}

function closePlayer() {
    document.getElementById('player-modal').classList.add('hidden');
    document.getElementById('video-player').src = "";
    document.body.style.overflow = 'auto'; // Restores background scrolling
}

