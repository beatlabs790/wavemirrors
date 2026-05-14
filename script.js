const API_KEY = 'f22b8df492bf289db1c9aae5f5e3cc24';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

window.currentImdbId = "";
window.currentTmdbId = "";
window.currentTitle = "";

document.addEventListener('DOMContentLoaded', () => {
    fetchMovies(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
});

async function fetchMovies(url) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        const grid = document.getElementById('movie-grid');
        grid.innerHTML = data.results.map(movie => `
            <div class="movie-card" onclick="initiateStream('${movie.id}', '${movie.title.replace(/'/g, "\\'")}')">
                <img src="${IMG_PATH + movie.poster_path}" alt="${movie.title}">
                <div class="card-overlay">
                    <p>${movie.title}</p>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Failed to fetch movies:", err);
    }
}

async function initiateStream(tmdbId, title) {
    const res = await fetch(`${BASE_URL}/movie/${tmdbId}/external_ids?api_key=${API_KEY}`);
    const data = await res.json();
    
    window.currentTmdbId = tmdbId;
    window.currentTitle = title;
    window.currentImdbId = data.imdb_id;

    // Show player if at least one ID type exists
    if (window.currentImdbId || window.currentTmdbId) {
        loadServer(1); 
        document.getElementById('player-wrapper').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        alert("Streaming metadata not available for this title.");
    }
}

function loadServer(num) {
    const player = document.getElementById('video-player');
    const indicator = document.getElementById('server-indicator');
    const titleDisp = document.getElementById('playing-title');
    
    // 2026 High-Availability Mirrors
    const sources = {
        1: `https://vidsrc.pm/embed/movie/${window.currentImdbId}`,
        2: `https://vidsrc.xyz/embed/movie/${window.currentImdbId}`,
        3: `https://autoembed.to/movie/tmdb/${window.currentTmdbId}`
    };

    if (sources[num]) {
        player.src = sources[num];
        titleDisp.innerText = window.currentTitle;
        indicator.innerText = `Connected to Node: 0x${num} (Mirror ${num})`;
    }
}

function searchMovies() {
    const q = document.getElementById('searchInput').value;
    if(q) fetchMovies(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${q}`);
}

function closePlayer() {
    document.getElementById('player-wrapper').classList.add('hidden');
    document.getElementById('video-player').src = "";
}
