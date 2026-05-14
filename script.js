const API_KEY = 'f22b8df492bf289db1c9aae5f5e3cc24';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/w500';

window.addEventListener('load', () => setTimeout(() => document.getElementById('loader').style.display = 'none', 1000));

document.addEventListener('DOMContentLoaded', () => {
    fetchContent(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, 'movie-grid', 'movie');
    fetchContent(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`, 'tv-grid', 'tv');
    fetchHero();
});

async function fetchContent(url, gridId, type) {
    const res = await fetch(url);
    const data = await res.json();
    document.getElementById(gridId).innerHTML = data.results.slice(0, 10).map(item => `
        <div class="movie-card" onclick="initiateStream('${item.id}', '${(item.title || item.name).replace(/'/g, "\\'")}', '${type}')">
            <img src="${item.poster_path ? IMG + item.poster_path : 'https://via.placeholder.com/200x300'}">
        </div>`).join('');
}

async function fetchHero() {
    const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`);
    const data = await res.json();
    const h = data.results[0];
    document.getElementById('hero-banner').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${h.backdrop_path})`;
    document.getElementById('hero-title').innerText = h.title;
    document.getElementById('hero-play').onclick = () => initiateStream(h.id, h.title, 'movie');
}

async function searchMovies() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    document.getElementById('main-section-title').innerText = `Search: "${query}"`;
    document.getElementById('tv-header').style.display = 'none';
    document.getElementById('tv-grid').innerHTML = '';
    document.getElementById('hero-banner').style.display = 'none';
    
    const grid = document.getElementById('movie-grid');
    grid.innerHTML = '<p>Searching...</p>';

    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    grid.innerHTML = data.results.length > 0 ? data.results.slice(0, 15).map(m => `
        <div class="movie-card" onclick="initiateStream('${m.id}', '${m.title.replace(/'/g, "\\'")}', 'movie')">
            <img src="${m.poster_path ? IMG + m.poster_path : 'https://via.placeholder.com/200x300'}">
        </div>`).join('') : '<p>No results found.</p>';
}

async function initiateStream(id, title, type) {
    window.currentId = id; window.currentType = type; window.currentTitle = title;
    document.getElementById('playing-title').innerText = title;
    
    if (type === 'tv') {
        document.getElementById('tv-controls').classList.remove('hidden');
        const res = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`);
        const data = await res.json();
        generateDropdowns(data.number_of_seasons);
        updateTvStream();
    } else {
        document.getElementById('tv-controls').classList.add('hidden');
        const res = await fetch(`${BASE_URL}/movie/${id}/external_ids?api_key=${API_KEY}`);
        const data = await res.json();
        window.currentImdb = data.imdb_id;
        loadServer(1);
    }
    document.getElementById('player-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function generateDropdowns(seasons) {
    document.getElementById('season-select').innerHTML = Array.from({length: seasons}, (_, i) => `<option value="${i+1}">S${i+1}</option>`).join('');
    document.getElementById('episode-select').innerHTML = Array.from({length: 20}, (_, i) => `<option value="${i+1}">Ep${i+1}</option>`).join('');
}

function updateTvStream() {
    const s = document.getElementById('season-select').value;
    const e = document.getElementById('episode-select').value;
    document.getElementById('video-player').src = `https://vidsrc.pm/embed/tv/${window.currentId}/${s}-${e}`;
}

function loadServer(num) {
    document.getElementById('video-player').src = num === 1 ? `https://vidsrc.pm/embed/movie/${window.currentImdb}` : `https://vidsrc.xyz/embed/movie/${window.currentImdb}`;
}

function closePlayer() { 
    document.getElementById('player-modal').classList.add('hidden'); 
    document.getElementById('video-player').src = ""; 
    document.body.style.overflow = 'auto'; 
}
