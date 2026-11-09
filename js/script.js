
/* ========================================
   기본 설정
======================================== */

// 처음 열 날짜
let currentDate = new Date(2026, 4, 19);

// 현재 달력에서 보고 있는 월
let calendarMonth = currentDate.getMonth();

// 대화가 존재하는 날짜
let availableDates = [];

// 기념일 데이터
let anniversaries = {};

// 발신자 이름
const SENDER_NAME = "서준";

// 프로필 이미지
const PROFILE_IMAGE = "assets/profile/profile.png";


/* ========================================
   DOM
======================================== */

const dateButton = document.getElementById("dateButton");
const calendarOverlay = document.getElementById("calendarOverlay");
const calendar = document.getElementById("calendar");
const calendarDays = document.getElementById("calendarDays");
const monthButtons = document.querySelectorAll(".month-button");
const prevDate = document.getElementById("prevDate");
const nextDate = document.getElementById("nextDate");
const chatMessages = document.getElementById("chatMessages");


/* ========================================
   날짜 → YYYY-MM-DD
======================================== */

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* ========================================
   날짜 → 한글 날짜
======================================== */

function formatKoreanDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const weekdays = [
        "일요일",
        "월요일",
        "화요일",
        "수요일",
        "목요일",
        "금요일",
        "토요일"
    ];

    return `${year}년 ${month}월 ${day}일 ${weekdays[date.getDay()]}`;
}


/* ========================================
   상단 날짜 업데이트
======================================== */

function updateDateUI() {
    dateButton.textContent = formatKoreanDate(currentDate);
}


/* ========================================
   대화 날짜 목록 불러오기
======================================== */

async function loadAvailableDates() {
    try {
        const response = await fetch("./data/dates.json");

        if (!response.ok) {
            throw new Error("dates.json을 찾을 수 없습니다.");
        }

        availableDates = await response.json();

    } catch (error) {
        console.warn("dates.json을 불러오지 못했습니다.", error);
        availableDates = [];
    }
}


/* ========================================
   기념일 데이터 불러오기
======================================== */

async function loadAnniversaries() {
    try {
        const response = await fetch("./data/anniversaries.json");

        if (!response.ok) {
            throw new Error(
                `파일을 불러오지 못했습니다. 상태 코드: ${response.status}`
            );
        }

        const data = await response.json();

        if (
            typeof data !== "object" ||
            data === null ||
            Array.isArray(data)
        ) {
            throw new Error("기념일 데이터 형식이 올바르지 않습니다.");
        }

        anniversaries = data;

        console.log("기념일 데이터 로드 성공:", anniversaries);
        console.log("불러온 기념일 개수:", Object.keys(anniversaries).length);

    } catch (error) {
        console.error("기념일 데이터 로드 실패:", error);
        anniversaries = {};
    }
}

/* ========================================
   기념일 이름 가져오기
======================================== */

function getAnniversaryLabel(dateString) {
    const anniversary = anniversaries[dateString];

    if (!anniversary) {
        return "";
    }

    if (Array.isArray(anniversary)) {
        return anniversary.join(" / ");
    }

    return String(anniversary);
}

/* ========================================
   달력 그리기
======================================== */


function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = calendarMonth;

    calendarDays.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const weekCount = Math.ceil((firstDay + lastDate) / 7);

    calendarDays.style.position = "relative";

    // 날짜 칸 생성
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-day empty";
        calendarDays.appendChild(empty);
    }

    for (let day = 1; day <= lastDate; day++) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "calendar-day";

        const dateString = formatDate(new Date(year, month, day));

        const dayNumber = document.createElement("span");
        dayNumber.className = "calendar-day-number";
        dayNumber.textContent = day;
        button.appendChild(dayNumber);

        // 기존 하루짜리 기념일
        const anniversaryLabel = getAnniversaryLabel(dateString);

        if (anniversaryLabel) {
            const label = document.createElement("span");
            label.className = "anniversary-label";
            label.textContent = anniversaryLabel;
            label.title = anniversaryLabel;
            button.classList.add("has-anniversary");
            button.appendChild(label);
        }

        if (availableDates.includes(dateString)) {
            button.classList.add("has-data");
        }

        if (dateString === formatDate(currentDate)) {
            button.classList.add("selected");
        }

        button.addEventListener("click", () => {
            currentDate = new Date(year, month, day);
            calendarMonth = month;

            updateDateUI();
            loadMessages();
            renderCalendar();
            calendarOverlay.classList.remove("active");
        });

        calendarDays.appendChild(button);
    }

    // 여러 날 일정 블록 레이어
    const eventLayer = document.createElement("div");
    eventLayer.className = "calendar-event-layer";
    eventLayer.style.gridTemplateRows = `repeat(${weekCount}, 1fr)`;

    // 여러 날 일정 가져오기
    const events = Array.isArray(anniversaries.events)
        ? anniversaries.events
        : [];

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month, lastDate);

    // 각 일정의 해당 월 부분을 주 단위로 나누어 표시
    events.forEach((event, eventIndex) => {
        if (!event.start || !event.end || !event.title) return;

        const start = new Date(`${event.start}T00:00:00`);
        const end = new Date(`${event.end}T00:00:00`);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            end < start
        ) return;

        if (end < monthStart || start > monthEnd) return;

        const visibleStart = start < monthStart ? monthStart : start;
        const visibleEnd = end > monthEnd ? monthEnd : end;

        let cursor = new Date(visibleStart);

        while (cursor <= visibleEnd) {
            const day = cursor.getDate();
            const column = (firstDay + day - 1) % 7;
            const row = Math.floor((firstDay + day - 1) / 7);

            const daysUntilSunday = 6 - column;
            const segmentEnd = new Date(cursor);
            segmentEnd.setDate(
                Math.min(
                    cursor.getDate() + daysUntilSunday,
                    visibleEnd.getDate()
                )
            );

            const segmentLength =
                Math.round((segmentEnd - cursor) / 86400000) + 1;

            const bar = document.createElement("div");
            bar.className = "calendar-event-bar";
            bar.style.gridColumn = `${column + 1} / span ${segmentLength}`;
            bar.style.gridRow = String(row + 1);
            bar.style.setProperty(
                "--event-color",
                event.color || "#279e83"
            );

            // 일정이 시작되는 구간에만 이름 표시
            const isFirstSegment =
                formatDate(cursor) === event.start;

            if (isFirstSegment) {
                bar.textContent = event.title;
                bar.title = event.title;
            } else {
                bar.classList.add("continuation");
                bar.title = event.title;
            }

            // 겹치는 일정의 순서를 위해 인덱스 사용
            bar.dataset.eventIndex = eventIndex;

            eventLayer.appendChild(bar);

            cursor = new Date(segmentEnd);
            cursor.setDate(cursor.getDate() + 1);
        }
    });

    calendarDays.appendChild(eventLayer);

    // 월 버튼 활성화
    monthButtons.forEach(button => {
        button.classList.toggle(
            "active",
            Number(button.dataset.month) === month
        );
    });
}

/* ========================================
   메시지 불러오기
======================================== */

async function loadMessages() {
    const dateString = formatDate(currentDate);

    chatMessages.innerHTML = `
        <div class="loading">
            불러오는 중...
        </div>
    `;

    try {
        const response = await fetch(`./data/${dateString}.json`);

        if (!response.ok) {
            throw new Error("해당 날짜의 데이터가 없습니다.");
        }

        const messages = await response.json();

        renderMessages(messages);

    } catch (error) {
        chatMessages.innerHTML = `
            <div class="empty-message">
                이 날짜에는 기록된 대화가 없습니다.
            </div>
        `;
    }
}


/* ========================================
   메시지 렌더링
======================================== */

function renderMessages(messages) {
    chatMessages.innerHTML = "";

    messages.forEach(message => {
        const row = document.createElement("div");
        row.className = "message-row";


        // 프로필
        const profile = document.createElement("img");

        profile.className = "profile";
        profile.src = PROFILE_IMAGE;
        profile.alt = SENDER_NAME;


        // 메시지 전체
        const content = document.createElement("div");
        content.className = "message-content";


        // 발신자
        const sender = document.createElement("div");

        sender.className = "sender-name";
        sender.textContent = SENDER_NAME;


        // 말풍선 + 시간
        const messageLine = document.createElement("div");
        messageLine.className = "message-line";


        // 텍스트
        if (message.type === "text") {
            const bubble = document.createElement("div");

            bubble.className = "message-bubble";
            bubble.textContent = message.message;

            messageLine.appendChild(bubble);
        }


        // 이미지
        else if (message.type === "image") {
            const bubble = document.createElement("div");

            bubble.className = "message-bubble image-bubble";

            const image = document.createElement("img");

            image.className = "message-image";
            image.src = message.src;
            image.alt = "";

            bubble.appendChild(image);
            messageLine.appendChild(bubble);
        }


        // 시간
        const time = document.createElement("span");

        time.className = "message-time";
        time.textContent = message.time || "";

        messageLine.appendChild(time);


        // 조립
        content.appendChild(sender);
        content.appendChild(messageLine);

        row.appendChild(profile);
        row.appendChild(content);

        chatMessages.appendChild(row);
    });

    window.scrollTo({
        top: 0,
        behavior: "auto"
    });
}


/* ========================================
   이전 날짜
======================================== */

prevDate.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() - 1);

    calendarMonth = currentDate.getMonth();

    updateDateUI();
    loadMessages();
    renderCalendar();
});


/* ========================================
   다음 날짜
======================================== */

nextDate.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() + 1);

    calendarMonth = currentDate.getMonth();

    updateDateUI();
    loadMessages();
    renderCalendar();
});


/* ========================================
   날짜 클릭 → 오버레이 열기
======================================== */

dateButton.addEventListener("click", () => {
    calendarMonth = currentDate.getMonth();

    renderCalendar();

    calendarOverlay.classList.add("active");
});


/* ========================================
   월 선택
======================================== */

monthButtons.forEach(button => {
    button.addEventListener("click", () => {
        calendarMonth = Number(button.dataset.month);

        renderCalendar();
    });
});


/* ========================================
   바깥 영역 클릭 → 닫기
======================================== */

calendarOverlay.addEventListener("click", event => {
    if (event.target === calendarOverlay) {
        calendarOverlay.classList.remove("active");
    }
});


/* ========================================
   시작
======================================== */


// 로딩 화면 시작 시간
const loadingStartTime = Date.now();

// 로딩 화면 닫기
async function hideLoadingScreen() {
    const minimumDuration = 900;
    const elapsed = Date.now() - loadingStartTime;
    const remaining = Math.max(0, minimumDuration - elapsed);

    await new Promise(resolve => setTimeout(resolve, remaining));

    const loadingScreen = document.getElementById("loadingScreen");

    if (loadingScreen) {
        loadingScreen.classList.add("is-hidden");
    }
}

// 홈페이지 초기화
async function initialize() {
    try {
        await Promise.all([
            loadAvailableDates(),
            loadAnniversaries()
        ]);

        updateDateUI();

        await loadMessages();

        calendarMonth = currentDate.getMonth();

        renderCalendar();

    } finally {
        await hideLoadingScreen();
    }
}

initialize();
