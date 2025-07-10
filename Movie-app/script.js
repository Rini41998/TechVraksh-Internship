const apiKey = 'ae34e0f0';
const searchBtn = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const movieContainer = document.getElementById('movie-container');
const modal = document.getElementById('modal');
const movieDetails = document.getElementById('movie-details');
const closeModal = document.getElementById('close-modal');
const viewFavoritesBtn = document.getElementById('view-favorites');
const toggleThemeBtn = document.getElementById('toggle-theme');

let isViewingFavorites = false;

const getFavorites = () => JSON.parse(localStorage.getItem('favorites') || '[]');
const saveFavorites = (favorites) => localStorage.setItem('favorites', JSON.stringify(favorites));

const toggleFavorite = (movie) => {
  let favorites = getFavorites();
  const exists = favorites.some(fav => fav.imdbID === movie.imdbID);
  if (exists) {
    favorites = favorites.filter(fav => fav.imdbID !== movie.imdbID);
    alert(`Removed "${movie.Title}" from favorites`);
  } else {
    favorites.push(movie);
    alert(`Added "${movie.Title}" to favorites`);
  }
  saveFavorites(favorites);
  if (isViewingFavorites) renderMovies(favorites);
};

const isFavorited = (imdbID) => getFavorites().some(m => m.imdbID === imdbID);

const renderMovies = (movies) => {
  movieContainer.innerHTML = '';
  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <span class="favorite-icon ${isFavorited(movie.imdbID) ? 'favorited' : ''}">&#10084;</span>
      <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Image'}" alt="${movie.Title}" />
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
    `;
    card.querySelector('.favorite-icon').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(movie);
      e.target.classList.toggle('favorited');
    });
    card.addEventListener('click', () => showMovieDetails(movie.imdbID));
    movieContainer.appendChild(card);
  });
};

async function searchMovies(title) {
  isViewingFavorites = false;
  movieContainer.innerHTML = 'Loading...';
  const res = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(title)}`);
  const data = await res.json();

  if (data.Response === 'True') {
    renderMovies(data.Search);
  } else {
    movieContainer.innerHTML = `<p>No results found for "${title}".</p>`;
  }
}

async function showMovieDetails(imdbID) {
  const res = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}&plot=full`);
  const movie = await res.json();

  if (movie.Response === 'True') {
    movieDetails.innerHTML = `
      <h2>${movie.Title}</h2>
      <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Image'}" alt="${movie.Title}" style="width:100%; margin-bottom:15px;" />
      <p><strong>Year:</strong> ${movie.Year}</p>
      <p><strong>Genre:</strong> ${movie.Genre}</p>
      <p><strong>Director:</strong> ${movie.Director}</p>
      <p><strong>Actors:</strong> ${movie.Actors}</p>
      <p><strong>IMDb Rating:</strong> ⭐ ${movie.imdbRating}</p>
      <p><strong>Plot:</strong> ${movie.Plot}</p>
    `;
    modal.style.display = 'flex';
  } else {
    movieDetails.innerHTML = `<p>Details not available.</p>`;
  }
}

closeModal.addEventListener('click', () => modal.style.display = 'none');
modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.style.display = 'none'; });

searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') searchBtn.click(); });
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) searchMovies(query);
});

viewFavoritesBtn.addEventListener('click', () => {
  isViewingFavorites = true;
  const favs = getFavorites();
  movieContainer.innerHTML = favs.length ? '' : '<p>No favorites added yet.</p>';
  renderMovies(favs);
});

toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
