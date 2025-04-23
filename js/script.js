// console.log(window.location.pathname);

const global = {
    currentPage: window.location.pathname,
    search: {
        term: "",
        type: "",
        page: 1,
        total_pages: 1,
    },
    api: {
        apiKey: "e76d2381f0382657b3c2960253bbd771",
        apiURL: "https://api.themoviedb.org/3/",
    },
};

//Fetch data from TMDB API
async function fetchAPIData(endpoint) {
    const API_KEY = global.api.apiKey;
    const API_URL = global.api.apiURL;

    showSpinner();

    try {
        const response = await fetch(
            `${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
        );

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data); 
        hideSpinner();
        return data;
    } catch (error) {
        console.error("Error fetching data from API:", error);
        hideSpinner();
        showAlert("Failed to fetch data. Please try again later.");
        return { results: [] }; 
    }
}

// alert
function showAlert(message, timeout = 3000) {
  const alertDiv = document.querySelector("#alert");
  if (!alertDiv) {
    console.error("Alert container not found");
    return;
  }
  
  const alertMsg = document.createElement("div");
  alertMsg.classList.add("alert", "error");
  alertMsg.textContent = message;
  
  const pagination = document.querySelector(".pagination");
  if (pagination) {
    pagination.innerHTML = "";
  }
  
  alertDiv.appendChild(alertMsg);
  setTimeout(() => {
    alertMsg.remove();
  }, timeout);
}

//Swiper
async function displayNowPlayingMovies() {
  const {results} = await fetchAPIData('movie/now_playing');
  
  // Create swiper slides first
  results.forEach((movie) => {
    const div = document.createElement('div');
    div.classList.add('swiper-slide');
    div.innerHTML = `
      <a href="movie-details.html?id=${movie.id}">
        ${
          movie.poster_path
            ? `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
              class="card-img-top"
              alt="${movie.title}"/> `
            : `<img
              src="./images/no-image.jpg"
              class="card-img-top"
              alt="No image available"
            />`
        }
      </a>
      <div class="swiper-rating">
        <i class="fas fa-star text-secondary"></i> ${movie.vote_average.toFixed(1)} / 10
      </div>
      <h4 class="swiper-title">${movie.title}</h4>
    `;
    document.querySelector(".swiper-wrapper").appendChild(div);
  });
  
  // Initialize swiper after all slides are added
  const swiper = new Swiper('.swiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    effect: 'coverflow',
    coverflowEffect: {
      rotate: 50,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },
    centeredSlides: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    speed: 1000,
    grabCursor: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true,
    },
    navigation: { 
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',  
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 3,
      },
      1024: {
        slidesPerView: 4,
        spaceBetween: 25,
      },
    },
  });
}

// Search

async function search() {
  const queryString = window.location.search;
  const urlParam = new URLSearchParams(window.location.search);

  global.search.term = urlParam.get('search-term');
  global.search.type = urlParam.get('type');

  if (global.search.term !== "" && global.search.term !== null) {
    const {results, total_pages, page, total_results} = await searchAPIDATA();

    global.search.page = page;
    global.search.total_pages = total_pages;
    global.search.total_results = total_results;

    if (results.length === 0) {
      showAlert(" No results found");
      return;
    }
    displaySearchResults(results);
    document.querySelector("#search-term").value = '';
  } else {
    showAlert("Please enter a search term");
  }
}

// Display Search results

function displaySearchResults(results) {
  document.querySelector("#search-results").innerHTML = "";
  document.querySelector("#search-results-heading").innerHTML = "";
  document.querySelector("#pagination").innerHTML = "";

  console.log("Search results:", results); // Debug log

  results.forEach((result) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
    <a href="${global.search.type}-details.html?id=${result.id}">
    ${
        result.poster_path
          ? `<img src="https://image.tmdb.org/t/p/w500${result.poster_path}"
            class="card-img-top"
            alt ="${global.search.type === "movie" ? result.title : result.name}"/>`
          : `<img
            src="./images/no-image.jpg"
            class="card-img-top"
            alt="${global.search.type === "movie" ? result.title : result.name}"/>`
    }
    </a>
    <div class="card-body">
      <h5 class="card-title">${global.search.type === "movie" ? result.title : result.name}</h5>
        <p class="card-text">
           <small class="text-muted">Release: ${
           global.search.type === "movie"
           ? (result.release_date || 'N/A') :
           (result.first_air_date || 'N/A')}</small>
            </p>
          </div>
    `;
    
    document.querySelector("#search-results").appendChild(div);
  });
  
  document.querySelector("#search-results-heading").innerHTML = 
    `<h2>${results.length} OF ${global.search.total_results || 0} RESULTS FOR ${global.search.term}</h2>`;
  
  displayPagination();
}

//Display Pagination
async function displayPagination() {
  const div = document.createElement("div");
  div.classList.add("pagination");
  div.innerHTML = `
  <button class="btn btn-primary" id="prev">Prev</button>
  <button class="btn btn-primary" id="next">Next</button>
  <div class = "page-counter"> Page ${global.search.page} of ${global.search.total_pages}</div>
  `;

  document.querySelector("#pagination").appendChild(div);

  if (global.search.page === 1) {
    document.querySelector("#prev").disabled = true;
  }
  if (global.search.page === global.search.total_pages) {
    document.querySelector("#next").disabled = true;
  }

document.querySelector("#next").addEventListener("click", async () => {
  global.search.page++;
  const {results, total_pages} = await searchAPIData();
  displaySearchResults(results);
});

document.querySelector("#prev").addEventListener("click", async () => {
  global.search.page--;
  const {results, total_pages} = await searchAPIData();
  displaySearchResults(results);
});
}

async function searchAPIDATA() {
  const API_KEY = global.api.apiKey;
  const API_URL = global.api.apiURL;

  showSpinner();
  
  try {
    const response = await fetch(
      `${API_URL}search/${global.search.type}?api_key=${API_KEY}&language=en-US&query=${global.search.term}&page=${global.search.page}&include_adult=false`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Search API response:", data);
    hideSpinner();
    return data;
  } catch (error) {
    console.error("Error searching API:", error);
    hideSpinner();
    showAlert("Failed to perform search. Please try again later.");
    return { results: [], total_pages: 0, page: 1, total_results: 0 };
  }
}

//Display popular movies
async function displayPopularMovies() {
    const  {results} = await fetchAPIData('movie/popular')
    // console.log(results);

    results.forEach((movie) => {
        const div = document.createElement('div')
        div.classList.add('card')
        div.innerHTML = `
               
          <a href="movie-details.html?id=${movie.id}">
          ${
            movie.poster_path ? `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
              class="card-img-top"
              alt="${movie.title}"
            />` : `<img
              src="./images/no-image.jpg"
              class="card-img-top"
              alt="${movie.title}"
            />` 
          } 
          </a>
          <div class="card-body">
            <h5 class="card-title">${movie.title}</h5>
            <p class="card-text">
              <small class="text-muted">Release: ${movie.release_date}</small>
            </p>
          </div>
       
        `;
        document.querySelector("#popular-movies").appendChild(div);
    })

}

//Display 20 most popular tv shows
async function displayPopularShows() {
    const { results } = await fetchAPIData("tv/popular");
    console.log(results);

    results.forEach((show) => {
      
        const div = document.createElement("div");
        div.classList.add("card");
        div.innerHTML = `
          <a href="tv-details.html?id=${show.id}">
          ${
            show.poster_path
              ? `<img src="https://image.tmdb.org/t/p/w500${show.poster_path}"
                class="card-img-top"
                alt="${show.name}"
              />`
              : `<img
                src="./images/no-image.jpg"
                class="card-img-top"
                alt="${show.name}"
              />`
          } 
          </a>
          <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <p class="card-text">
              <small class="text-muted"> Aired: ${show.first_air_date}</small>
            </p>
          </div>
        `;
        document.querySelector("#popular-shows").appendChild(div);
    });
}



//Display Movie Details
async function displayMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    // console.log(movieId);
    const movieDetails = await fetchAPIData(`movie/${movieId}`);
    // console.log(movieDetails);

    const div = document.createElement('div');
    div.innerHTML = `<div class="details-top">
    <div style="background-image: url ('https://image.tmdb.org/t/p/original${movieDetails.backdrop_path
     }'); background-size: cover; background-position; center center; background-repeat: no-repeat; height: 100vh; width: 100vw; position: absolute; top: 0px; left: 0px; z-index: -1; opacity: 0.1;"></div>
     <div>
     ${
        movieDetails.poster_path
          ? `<img
    src="https://image.tmdb.org/t/p/w500${movieDetails.poster_path}"
    class="card-img-top"
    alt="${movieDetails.title}"/>`
    : `<img
    src="../images/no-image.jpg"
    alt="${movieDetails.title}"
  >`
      }
       </div>
         <div>
            <h2>${movieDetails.title}</h2>
            <p>
              <i class="fas fa-star text-primary"></i>
              ${movieDetails.vote_average.toFixed(2)} / 10
            </p>
            <p class="text-muted">Release Date: ${movieDetails.release_date}</p>
            <p>
            ${movieDetails.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
              ${movieDetails.genres.map((genre) => `
            <li>${genre.name}</li>`).join("")
            }
            </ul>
            <a
              href="${movieDetails.homepage}"
              target="_blank"
              class="btn"
              >Visit Movie Homepage</a
            >
          </div>
        </div>
        <div class="details-bottom">
          <h2>Movie Info</h2>
          <ul>
            <li><span class="text-secondary">Budget:</span> $ ${movieDetails.budget}</li>
            <li><span class="text-secondary">Revenue:</span> $ ${movieDetails.revenue}</li>
            <li><span class="text-secondary">Runtime:</span> ${movieDetails.runtime} minutes</li>
            <li><span class="text-secondary">Status:</span> ${movieDetails.status}</li>
          </ul>
          <h4>Production Companies</h4>
          <div class="list-group">${movieDetails.production_companies.map((company) => company.name).join(", ")}</div>
        </div>  
    `;

    document.querySelector('#movie-details').appendChild(div);
}

// Display TV Shows Details
async function displayTVShowsDetails() {
  const showId = window.location.search.split('=')[1];

  
  // console.log(tvId);

  const show = await fetchAPIData(`tv/${showId}`);
  console.log(show);
  const showHTML = `<div class = "details-top">
    <div style = "background-image : url ('https://image.tmdb.org/t/p/original${show.backdrop_path
    }'); background-size: cover; background-position; center center; background-repeat: no-repeat; height: 100vh; width: 100vw; position: absolute; top: 0px; left: 0px; z-index: -1; opacity: 0.1;">
    </div>
    <div>
    ${
        show.poster_path
          ? `<img
    src="https://image.tmdb.org/t/p/w500${show.poster_path}"
    class="card-img-top"
    alt="${show.original_name}"/>`
    : ` <img
    src="./images/no-image.jpg"
      alt="${show.original_name}"
    />`
}
          </div>
         <div>
         <h2>${show.original_name}</h2>
         <p>
              <i class="fas fa-star text-primary"></i>
              ${show.vote_average.toFixed(1)} / 10
            </p>
            <p class="text-muted">Release Date: ${show.last_air_date}</p>
            <p>
            ${show.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
              ${show.genres.map((genre) => `
            <li>${genre.name}</li>`).join("")
            }
            </ul>
            <a
              href="${show.homepage}"
              target="_blank"
              class="btn"
              >Visit Movie Homepage</a
            >
          </div>
        </div>
        <div class="details-bottom">
                  <h2>Show Info</h2>
          <ul>
            <li><span class="text-secondary">Number Of Episodes:</span> ${show.number_of_episodes}</li>
            <li>
              <span class="text-secondary">Last Episode To Air:</span> ${show.last_episode_to_air.name}
            </li>
            <li><span class="text-secondary">Status:</span> ${show.status}</li> 
          </ul> 
          <h4>Production Companies</h4>
          <div class="list-group">${show.production_companies.map ((company) => company.name)
          .join(", ")}</div>
        </div> `;
        
  document.querySelector('#tv-details').innerHTML = showHTML;
}



function showSpinner() {
    document.querySelector('.spinner').classList.add('show');
}

function hideSpinner() {
    document.querySelector('.spinner').classList.remove('show');
}

//Highlight active link
function highlightActiveLink() {
    const links = document.querySelectorAll('.nav-link')

    links.forEach((link) => {
        const hrefValue = link.getAttribute('href')

        //check for movie-details.html in pathname -> highlight Movies Link

        if (
            global.currentPage.includes('movie-details.html') && hrefValue.includes('index.html')
        ) {
            link.classList.add('active')
            return
        }

        //check for tv-details.html in pathname to highlight TV Shows link

        if (
            global.currentPage.includes('tv-details.html') && hrefValue.includes('shows.html')
        ) {
            link.classList.add('active')
            return
        }

        if (global.currentPage.includes(hrefValue) && hrefValue !== '/') {
            link.classList.add('active')
        }


    })
}


//Init App
function init() {
    const path = window.location.pathname;
    console.log("Current path:", path);
    

    if (path === '/' || path === '/index.html' || path.endsWith('index.html')) {
        console.log("Home");
        displayPopularMovies();
        displayNowPlayingMovies();
    } 
    else if (path.includes('shows.html') || path.endsWith('/shows')) {
        console.log("Shows page detected");
        displayPopularShows();
    }
    else if (path.includes('movie-details.html')) {
        console.log("Movie Details");
        displayMovieDetails();
    }
    else if (path.includes('tv-details.html')) {
        console.log("TV Details");
        displayTVShowsDetails();
    }
    else if (path.includes('search.html')) {
        console.log("Search");
        search();
    }
    
    highlightActiveLink();
}

document.addEventListener("DOMContentLoaded", init);
