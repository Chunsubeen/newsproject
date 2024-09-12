const API_KEY = ``;
let newsList = [];
let totalResults = 0;
let page = 1;
const pageSize = 10;
const groupSize = 5;  // 한 그룹에 표시할 페이지 수

// 메뉴 버튼 클릭 이벤트 리스너 추가
const menus = document.querySelectorAll(".menus button");
menus.forEach(menu =>
    menu.addEventListener("click", (event) => getNewsByCategory(event))
);

// 햄버거 메뉴 클릭 시 메뉴 보이기/숨기기
let hamburger = document.querySelector(".hamburger");
hamburger.onclick = function () {
    const navBar = document.querySelector(".menus");
    navBar.classList.toggle("active");
};

// 공통 API 요청 함수
const fetchNews = async (url) => {
    url.searchParams.set("page", page);
    url.searchParams.set("pageSize", pageSize);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.status === 200) {
            if (data.articles.length === 0) {
                throw new Error("No result for this search");
            }
            newsList = data.articles;
            totalResults = data.totalResults;
            render(); // 뉴스 데이터를 받고 렌더링 함수 호출
            pageNationRender();  // 페이지네이션 렌더링 함수 호출
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        errorRender(error.message);
    }
};

// 최신 뉴스 가져오기 함수
const getLatestNews = async () => {
    const url = new URL(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`);
    await fetchNews(url);
};

// 카테고리별 뉴스 가져오기 함수
const getNewsByCategory = async (event) => {
    const category = event.target.textContent.toLowerCase();
    const url = new URL(`https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`);
    await fetchNews(url);
};

// 키워드로 뉴스 검색하기 함수
const getNewsByKeyword = async () => {
    const keyword = document.getElementById("search").value;
    const url = new URL(`https://newsapi.org/v2/top-headlines?country=us&q=${keyword}&apiKey=${API_KEY}`);
    await fetchNews(url);
};

// 뉴스 렌더링 함수
const render = () => {
    const newsHTML = newsList.map(news => {
        let description = news.description ? news.description : '내용없음';

        if (description.length > 200) {
            description = description.substring(0, 200) + '…';
        }

        const imageUrl = news.urlToImage ? news.urlToImage : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqEWgS0uxxEYJ0PsOb2OgwyWvC0Gjp8NUdPw&usqp=CAU";
        const sourceName = news.source && news.source.name ? news.source.name : 'no source';

        return `
            <div class="row news">
                <div class="col-lg-4">
                    <img class="news-img-size" src="${imageUrl}" alt="News Image"/>
                </div>
                <div class="col-lg-8">
                    <h2>${news.title}</h2>
                    <p>${description}</p>
                    <div>${sourceName} / ${moment(news.publishedAt).fromNow()}</div>
                </div>
            </div>`;
    }).join("");

    document.getElementById("news-board").innerHTML = newsHTML;
};

// 에러 메시지 렌더링 함수
const errorRender = (errorMessage) => {
    const errorHTML = `
        <div class="alert alert-danger" role="alert">
            ${errorMessage}
        </div>`;
    document.getElementById("news-board").innerHTML = errorHTML;
};

// 페이지네이션 렌더링 함수
const pageNationRender = () => {
    const totalPages = Math.ceil(totalResults / pageSize);  // 전체 페이지 수 계산
    const pageGroup = Math.ceil(page / groupSize);  // 현재 페이지 그룹 계산
    let lastPage = pageGroup * groupSize;  // 페이지 그룹의 마지막 페이지 계산

    if (lastPage > totalPages) {
        lastPage = totalPages;  // 마지막 페이지 그룹은 총 페이지를 넘지 않음
    }

    const firstPage = lastPage - (groupSize - 1) <= 0 ? 1 : lastPage - (groupSize - 1);  // 그룹의 첫 번째 페이지 계산

    // 처음으로 이동하는 << 버튼 추가 (첫 번째 페이지 그룹일 때 숨김)
    let pageNationHTML = '';
    if (page !== 1) {
        pageNationHTML += `<li class="page-item" onclick="moveToPage(1)"><a class="page-link" href="#"><<</a></li>`;
        pageNationHTML += `<li class="page-item" onclick="moveToPage(${page-1})"><a class="page-link" href="#">Previous</a></li>`;
    }

    // 페이지 번호 렌더링
    for (let i = firstPage; i <= lastPage; i++) {
        pageNationHTML += `
            <li class="page-item ${i === page ? "active" : ""}" onclick="moveToPage(${i})">
                <a class="page-link">${i}</a>
            </li>`;
    }

    // 마지막 페이지 그룹에선 Next와 >> 버튼 숨김
    if (page !== totalPages) {
        pageNationHTML += `<li class="page-item" onclick="moveToPage(${page+1})"><a class="page-link" href="#">Next</a></li>`;
        pageNationHTML += `<li class="page-item" onclick="moveToPage(${totalPages})"><a class="page-link" href="#">>></a></li>`;
    }

    document.querySelector(".pagination").innerHTML = pageNationHTML;  // 페이지네이션 HTML 적용
};

// 페이지 이동 함수
const moveToPage = async (pageNum) => {
    const totalPages = Math.ceil(totalResults / pageSize);
    if (pageNum < 1) {
        pageNum = 1;  // 최소 페이지는 1
    }
    if (pageNum > totalPages) {
        pageNum = totalPages;  // 최대 페이지는 전체 페이지 수
    }

    page = pageNum;  // 페이지 설정
    await getLatestNews();  // 최신 뉴스 가져오기
};

// 최신 뉴스 가져오기 호출
getLatestNews();
