const arrows = document.querySelectorAll(".arrow");
const movieLists = document.querySelectorAll(".movie-list");

arrows.forEach((arrow, i) => {
  const itemNumber = movieLists[i].querySelectorAll("img").length;
  let clickCounter = 0;
  arrow.addEventListener("click", () => {
    const ratio = Math.floor(window.innerWidth / 270);
    clickCounter++;
    if (itemNumber - (4 + clickCounter) + (4 - ratio) >= 0) {
      movieLists[i].style.transform = `translateX(${
        movieLists[i].computedStyleMap().get("transform")[0].x.value - 300
      }px)`;
    } else {
      movieLists[i].style.transform = "translateX(0)";
      clickCounter = 0;
    }
  });

  console.log(Math.floor(window.innerWidth / 270));
});

//TOGGLE

const ball = document.querySelector(".toggle-ball");
const items = document.querySelectorAll(
  ".container,.movie-list-title,.navbar-container,.sidebar,.left-menu-icon,.toggle"
);

ball.addEventListener("click", () => {
  items.forEach((item) => {
    item.classList.toggle("active");
  });
  ball.classList.toggle("active");
});


document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/newly-added-movies')
    .then(response => response.json())
    .then(movies => {
      console.log('Fetched Movies:', movies);
      const container = document.getElementById('newly-added-list');
      if (!container) {
        console.error('❌ Element with id "newly-added-list" not found.');
        return;
      }

      if (!movies.length) {
        container.innerHTML = "<p style='color:white;'>No new movies added yet.</p>";
        return;
      }

      movies.forEach(movie => {
        const div = document.createElement('div');
        div.className = 'movie-list-item';
        div.innerHTML = `
          <img class="movie-list-item-img" src="${movie.thumbnail_path}" alt="${movie.name}">
          <span class="movie-list-item-title">${movie.name}</span>
          <p class="movie-list-item-desc">${movie.overview.substring(0, 100)}...</p>
          <a href="/protected/movie-template.html?id=${movie.id}">
            <button class="movie-list-item-button">Details</button>
          </a>
        `;
        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error('Failed to load new movies:', err);
    });
});


const input = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");

input.addEventListener("input", () => {
  const q = input.value.trim();
  if (!q) {
    suggestions.innerHTML = "";
    return;
  }

  fetch(`/api/search?q=${encodeURIComponent(q)}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) return;

      suggestions.innerHTML = "";
      data.results.forEach(movie => {
        const li = document.createElement("li");
        li.style.padding = "10px";
        li.style.cursor = "pointer";
        li.textContent = movie.name;

        li.addEventListener("click", () => {
          if (movie.source === "new_movies") {
            window.location.href = `/protected/movie-template.html?id=${movie.id}&source=new_movies`;
          } else {
            window.location.href = `/protected/movie-template.html?id=${movie.id}&source=movies`;
          }
        });

        suggestions.appendChild(li);
      });
    });
});

// Optional: hide suggestions when clicking outside
document.addEventListener("click", (e) => {
  if (!input.contains(e.target)) {
    suggestions.innerHTML = "";
  }
});



