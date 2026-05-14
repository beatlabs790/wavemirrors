const API_KEY = 'f22b8df492bf289db1c9aae5f5e3cc24';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

// Global variables to store movie details for server switching
window.currentImdbId = "";
window.currentTmdbId = "";
window.currentTitle = "";

// --- LOADER LOGIC ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }, 1000);
});

// --- DATA FETCHING ---
document.addEventListener('DOMContentLoaded', () => {
    // Section 1: Trending
    fetchMovies(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, 'movie-grid');
    // Section 2: Top Rated
    fetchMovies(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`, 'top-grid');
});

async function fetchMovies(url, containerId) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        const container = document.getElementById(containerId);
        
        container.innerHTML = data.results.slice(0, 10).map(movie => `
            <div class="movie-card" onclick="initiateStream('${movie.id}', '${movie.title.replace(/'/g, "\\'")}')">
                <img src="${IMG_PATH + movie.poster_path}" alt="${movie.title}">
                <div class="card-overlay">
                    <p>${movie.title}</p>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

// --- STREAMING LOGIC ---
async function initiateStream(tmdbId, title) {
    const res = await fetch(`${BASE_URL}/movie/${tmdbId}/external_ids?api_key=${API_KEY}`);
    const data = await res.json();
    
    window.currentTmdbId = tmdbId;
    window.currentTitle = title;
    window.currentImdbId = data.imdb_id;

    if (window.currentImdbId || window.currentTmdbId) {
        loadServer(1); // Default to Server 1
        document.getElementById('player-wrapper').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        alert("Metadata missing for this title.");
    }
}

function loadServer(num) {
    const player = document.getElementById('video-player');
    const indicator = document.getElementById('server-indicator');
    const titleDisp = document.getElementById('playing-title');
    
    // Updated 2026 Stable Mirrors (Fix for Screenshot_2026-05-14-11-19-00-68_40deb401b9ffe8e1df2f1cc5ba480b12.jpg)
    const sources = {
        1: `https://vidsrc.pm/embed/movie/${window.currentImdbId}`,
        2: `https://vidsrc.xyz/embed/movie/${window.currentImdbId}`,
        3: `https://autoembed.to/movie/tmdb/${window.currentTmdbId}`
    };

    player.src = sources[num];
    titleDisp.innerText = window.currentTitle;
    indicator.innerText = `Connected: Node ${num} (Mirror Active)`;
}

// --- SEARCH ---
function searchMovies() {
    const q = document.getElementById('searchInput').value;
    if(q) {
        fetchMovies(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${q}`, 'movie-grid');
        document.querySelector('.section-label').innerText = `Search: ${q}`;
    }
}

function closePlayer() {
    document.getElementById('player-wrapper').classList.add('hidden');
    document.getElementById('video-player').src = "";
}
