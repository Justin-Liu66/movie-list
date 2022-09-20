const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12; //每個頁面要顯示的頁數
const movies = []; //用來存放axios取回的所有電影資料

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const paginator = document.querySelector("#paginator");
const searchInput = document.querySelector("#search-input");
const modeChangePanel = document.querySelector("#change-mode");

let filteredMovies = []; //符合搜尋結果的電影
let currentPage = 1; //用來標示應該渲染的頁面，預設為第一頁；之後可重新賦值，以利在特定頁面切換模式時能夠正確顯示

//函式1:渲染電影清單
function renderMovieList(data) {
  //當模式為card時則用此template
  if (dataPanel.dataset.mode === "card-mode") {
    let rawHTML = "";
    //processing
    data.forEach((item) => {
      //title, image
      rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${
            POSTER_URL + item.image
          }" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${
              item.id
            }">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${
              item.id
            }">+</button>
          </div>
        </div>
      </div>
    </div>`;
    });
    dataPanel.innerHTML = rawHTML;
    //當模式為list時則用此template
  } else if (dataPanel.dataset.mode === "list-mode") {
    let rawHTML = '<ul class="list-group">';
    data.forEach((item) => {
      rawHTML += `
  <li class="list-group-item d-flex justify-content-between">
    <h5 class="card-title">${item.title}</h5>
    <div>
      <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
      <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
    </div>
  </li>`;
    });
    rawHTML += "</ul >";
    dataPanel.innerHTML = rawHTML;
  }
}

//函式2:渲染分頁器
function renderPaginator(amount) {
  //依據總電影數量及每頁欲顯示的電影數來計算分頁量
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

//函式3: 輸入特定頁數，回傳該頁數應有的電影資料
function getMoviesByPage(page) {
  //若filteredMovies的長度大於0，則data等於filteredMovies;若没有大於0，則data等於movies
  //用於區分是否使用搜尋功能
  const data = filteredMovies.length ? filteredMovies : movies;
  //依據該特定頁數中電影的索引位置範圍，從總電影資料中取出該頁包含的電影資料
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

//函式4: 以特定電影id為參數，透過axios取得該電影的資料後，套入templatle製作出該電影的Modal
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `
    <img src="${POSTER_URL + data.image}" alt="movie-poster" class="image-fuid">
    `;
  });
}

//函式5: 將點選的電影加至喜愛清單
function addToFavorite(id) {
  //宣告list並使用or判斷，若localStorage裡面有favoriteMovies這個key，則用list接下它的value；若localStorage裡面無favoriteMovies，則list就作為空陣列
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  //宣告movie作為被點擊到欲收藏的電影
  //movie的值為movies資料中的一筆物件（該物件中id這個key的值必需與丟進來此function的參數id之值相同)
  const movie = movies.find((movie) => movie.id === id);
  //避免list內有被使用者重複點選到的電影
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }
  //在已經排除重複點擊的條件下，將使用者點選的movie放到list中
  list.push(movie);
  //將list存入localStorage中，（需注意需為key-value的結構，且都要是字串的型態)
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

//函式6: 變換HTML中data-panel所註記的畫面渲染模式，使函式1（渲染電影清單）被呼叫時能按照data-panel來判斷要使用哪一種template進行畫面渲染
function changeDisplayMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) return;
  dataPanel.dataset.mode = displayMode;
}

//監聽切換模式的按鈕
modeChangePanel.addEventListener("click", function onSwitchClicked(event) {
  //點擊card模式
  if (event.target.matches("#card-mode-button")) {
    //呼叫函式6替data-panel註記模式
    changeDisplayMode("card-mode");
    //呼叫函式1，依據data-panel中所註記的模式進行畫面渲染（預設顯示的頁數為第1頁)
    renderMovieList(getMoviesByPage(currentPage));
    //點擊list模式 (概念同card模式)
  } else if (event.target.matches("#list-mode-button")) {
    changeDisplayMode("list-mode");
    renderMovieList(getMoviesByPage(currentPage));
  }
});

//監聽電影清單區塊
dataPanel.addEventListener("click", function onPanelClicked(event) {
  //若點擊MORE則呼叫函式4，依據More所綁定的電影id來顯示出Modal
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
    //若點擊＋則函式5，依據＋所綁定的電影id來將該電影放入喜愛清單
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

//監聽分頁器
paginator.addEventListener("click", function onPaginatorClicked(event) {
  // 'A' 指的是 <a></a>
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);
  //鎖定點擊的頁數後，重新賦值currentPage來記下該頁數(此動作的目的在於，當使用者停留在該頁數想變換card/list模式時，直接以currentPage的值來渲染畫面，頁數才不會跑掉)
  currentPage = page;
  renderMovieList(getMoviesByPage(currentPage));
});

//監聽搜尋區塊的submit事件
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  //取消瀏覽器預設行為，重置頁面
  event.preventDefault();
  //刪除input內容前後的空字元，並轉成小寫
  const keyword = searchInput.value.trim().toLowerCase();
  //將總電影清單中符合條件的電影放進新陣列中(比對過程中，總電影清單中電影的title也要轉成小寫)
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  //若輸入的keyword找不到符合電影，則跳出訊息告知無符合條件的電影
  if (filteredMovies.length === 0) {
    alert(`您所輸入的關鍵字: ${keyword} 無符合條件的電影`);
  }
  //以符合條件的電影數量來重新製作分頁器
  renderPaginator(filteredMovies.length);
  //最後重新渲染畫面，預設顯示第一頁
  currentPage = 1;
  renderMovieList(getMoviesByPage(currentPage));
});

axios
  .get(INDEX_URL)
  .then(function (response) {
    //將取得的電影資料放入movies陣列中
    movies.push(...response.data.results);
    //以電影數量來製作分頁器
    renderPaginator(movies.length);
    //渲染電影清單，預設顯示第一頁
    renderMovieList(getMoviesByPage(currentPage));
  })
  .catch((err) => console.log(err));