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
async function fetchAPIData(endpoint, query) {
    const API_KEY = global.api.apiKey;
    const API_URL = global.api.apiURL;

    showSpinner();

    try {
        const response = await fetch(
            `${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US&query=${query}`
        );

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        hideSpinner();
        return data;
    } catch (error) {
        console.error("Error fetching data from API:", error);
        hideSpinner();
        showAlert("Failed to fetch data. Please try again later.");
        return { results: [] }; // Return an empty result to prevent breaking the UI
    }
}

// alert
function showAlert(message, timeout = 3000) {
  const alertDiv = document.querySelector("#alert");
  const alertMsg = document.querySelector("div");
  const pagination = document.querySelector(".pagination");
  pagination.innerHTML = "";
  alertMsg.classList.add("alert", "error");
  alertMsg.textContent = message;
  alertDiv.appendChild(alertMsg);
  setTimeout(() => {
    alertMsg.remove();
  }, timeout);
}

//Spinner

async function displayNowPlayingMovies() {

const {results} = await fetchAPIData('movie/now_playing');
// console.log(results);
results.forEach((movie) => {
const swiper = new Swiper('.swiper', {
  slidesPerView: 4,
  spaceBetween: 25,
  direction: 'horizontal',
  loop: true,
  speed: 800,
  effect: 'slide',
  grabCursor: true,
  centeredSlides: true,
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: { 
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',  
  },

  scrollbar: {
    el: '.swiper-scrollbar',
  },
});
const div = document.createElement('div');
div.classList.add('swiper-slide');
div.innerHTML = ` <a href="movie-details.html?id=${movie.id}">

${
    movie.poster_path
    ? `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
    class="card-img-top"
    alt="${movie.title}"/> `
    : ` <img
    src="./images/no-image.jpg"
    class="card-img-top"
/>`
}
</a>
<h4 class = "swiper-rating>
  <i class= "fas fa-star text-secondary"></i> ${movie.vote_average} / 10
</h4>`;
document.querySelector(".swiper-wrapper").appendChild(div);
});
}

// Search

async function search() {
  const urlParam = new URLSearchParams(window.location.search);
  global.search.term = urlParam.get('search-term');
  global.search.type = urlParam.get('type');

  if (global.seearch.term !== "" && global.search.term !== null) {
    const {results, total_pages, page, total_results} = await searchAPIData();

    global.search.page = page;
    global.search.total_pages = total_pages;
    global.search.total_results = total_results;

    if (results.length === 0) {
      showAlert(" No results found");
      return;
    }
    displaySearchResults(results);
    document.querySelector("#search-term").value = "";
  } else {
    showAlert("Please enter a search term");
  }
}

// Display Search results

function displaySearchResults(results) {

  document.querySelector("#search-results").innerHTML = "";
  document.querySelector("#search-results-heading").innerHTML = "";
  document.querySelector("#pagination").innerHTML = "";

  results.forEach((results) => {
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
      <h5 class="card-title">${ global.search.type ==="movie" ?
      result.title : result.name} </h5>
        <p class="card-text">
           <small class="text-muted"> Release: ${
           global.search.type === "movie"
           ? result.release.date :
              result.first_air_date }</small>
            </p>
          </div>
    `;
    document.querySelector("#search-results-heading").innerHTML = `<h2> ${results.length} OF ${global.search.totalResults} RESULTS FOR ${global.search.term} </h2> ` ; 
    document.querySelector("#search-results").appendChild(div);
  });
  
  displayPagination();
}

//Display Pagination
function displayPagination() {
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

  const response = await fetch(
    `${API_URL}search/${global.search.type}?api_key=${API_KEY}&language=en-US$query=${global.search.term}&page=${global.search.page}&include_adult=false`
);

  const data = await response.json()

  hideSpinner();
  return data

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
    const { results } = await fetchAPIData('tv/popular');
    if (!results || results.length === 0) {
        console.warn("No TV shows found.");
        document.querySelector("#popular-shows").innerHTML = "<p>No TV shows available.</p>";
        return;
    }

    results.forEach((show) => {
        const div = document.createElement('div');
        div.classList.add('card');
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
              <small class="text-muted">Release: ${show.first_air_date}</small>
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
  const urlParams = new URLSearchParams(window.location.search);
  const tvId = urlParams.get('id');
  // console.log(tvId);

  const tvDetails = await fetchAPIData(`tv/${tvId}`);
  console.log(tvDetails);
  const tvDetailshTML = `<div class = "details-top">
    <div style = "background-image : url ('https://image.tmdb.org/t/p/original${tvDetails.backdrop_path
    }'); background-size: cover; background-position; center center; background-repeat: no-repeat; height: 100vh; width: 100vw; position: absolute; top: 0px; left: 0px; z-index: -1; opacity: 0.1;">
    </div>
    <div>
    ${
        tvDetails.poster_path
          ? `<img
    src="https://image.tmdb.org/t/p/w500${tvDetails.poster_path}"
    class="card-img-top"
    alt="${tvDetails.original_name}"/>`
    : ` <img
    src="./images/no-image.jpg"
      alt="${tvDetails.original_name}"
    />`
}
          </div>
         <div>
         <h2>${tvDetails.original_name}</h2>
         <p>
              <i class="fas fa-star text-primary"></i>
              ${tvDetails.vote_average.toFixed(1)} / 10
            </p>
            <p class="text-muted">Release Date: ${tvDetails.last_air_date}</p>
            <p>
            ${tvDetails.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
              ${tvDetails.genres.map((genre) => `
            <li>${genre.name}</li>`).join("")
            }
            </ul>
            <a
              href="${tvDetails.homepage}"
              target="_blank"
              class="btn"
              >Visit Movie Homepage</a
            >
          </div>
        </div>
        <div class="details-bottom">
                  <h2>Show Info</h2>
          <ul>
            <li><span class="text-secondary">Number Of Episodes:</span> ${tvDetails.number_of_episodes}</li>
            <li>
              <span class="text-secondary">Last Episode To Air:</span> ${tvDetails.last_episode_to_air.name}
            </li>
            <li><span class="text-secondary">Status:</span> ${tvDetails.status}</li>
          </ul>
          <h4>Production Companies</h4>
          <div class="list-group">${tvDetails.production_companies.map ((company) => company.name)
          .join(", ")}</div>
        </div> `;
        
  document.querySelector('#show-details').innerHTML = tvDetailshTML;
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
    switch (global.currentPage) {
        case "/":
        case "/index.html":
            console.log("Home");
            displayPopularMovies()
            displayNowPlayingMovies();

            break;
        case "/shows.html":
            displayPopularShows();
            break;
        case "/movie-details.html":
            displayMovieDetails();

            console.log("Movie Details");
            break;
        case "/tv-details.html":
            console.log("TV Details");
            displayTVShowsDetails();
            break;
        case "/search.html":
            console.log("Search");
            search();
            break;              
    }
    highlightActiveLink();
}

document.addEventListener("DOMContentLoaded", init);
