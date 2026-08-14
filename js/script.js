/* ========================================
   기본 설정
======================================== */

// 처음 열 날짜
let currentDate = new Date(2026, 7, 11);

// 현재 달력에서 보고 있는 월
let calendarMonth = currentDate.getMonth();

// 대화가 존재하는 날짜
let availableDates = [];

// 발신자 이름
const SENDER_NAME = "서준";

// 프로필 이미지
const PROFILE_IMAGE = "assets/profile/profile.png";


/* ========================================
   DOM
======================================== */

const dateButton =
    document.getElementById("dateButton");

const calendar =
    document.getElementById("calendar");

const calendarDays =
    document.getElementById("calendarDays");

const calendarTitle =
    document.getElementById("calendarTitle");

const monthButtons =
    document.querySelectorAll(".month-button");

const prevDate =
    document.getElementById("prevDate");

const nextDate =
    document.getElementById("nextDate");

const chatMessages =
    document.getElementById("chatMessages");


/* ========================================
   날짜 → YYYY-MM-DD
======================================== */

function formatDate(date) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* ========================================
   날짜 → 한글 날짜
======================================== */

function formatKoreanDate(date) {

    const year =
        date.getFullYear();

    const month =
        date.getMonth() + 1;

    const day =
        date.getDate();

    const weekdays = [
        "일요일",
        "월요일",
        "화요일",
        "수요일",
        "목요일",
        "금요일",
        "토요일"
    ];

    const weekday =
        weekdays[date.getDay()];

    return `${year}년 ${month}월 ${day}일 ${weekday}`;

}


/* ========================================
   날짜 UI 업데이트
======================================== */

function updateDateUI() {

    dateButton.textContent =
        formatKoreanDate(currentDate);

}


/* ========================================
   dates.json 불러오기
======================================== */

async function loadAvailableDates() {

    try {

        const response =
            await fetch("./data/dates.json");

        if (!response.ok) {
            throw new Error(
                "dates.json을 찾을 수 없습니다."
            );
        }

        availableDates =
            await response.json();

    }

    catch (error) {

        console.warn(
            "dates.json을 불러오지 못했습니다.",
            error
        );

        availableDates = [];

    }

}


/* ========================================
   달력 그리기
======================================== */

function renderCalendar() {

    const year =
        currentDate.getFullYear();

    const month =
        calendarMonth;


    /* 제목 */

    calendarTitle.textContent =
        `${year}년 ${month + 1}월`;


    /* 기존 날짜 제거 */

    calendarDays.innerHTML = "";


    /* 해당 월의 첫 번째 요일 */

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    /* 해당 월의 마지막 날짜 */

    const lastDate =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /* 앞쪽 빈칸 */

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "calendar-day empty";

        calendarDays.appendChild(
            empty
        );

    }


    /* 날짜 생성 */

    for (
        let day = 1;
        day <= lastDate;
        day++
    ) {

        const button =
            document.createElement("button");

        button.className =
            "calendar-day";

        button.textContent =
            day;


        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        /* 대화가 존재하는 날짜 */

        if (
            availableDates.includes(dateString)
        ) {

            button.classList.add(
                "has-data"
            );

        }


        /* 현재 선택된 날짜 */

        if (
            dateString ===
            formatDate(currentDate)
        ) {

            button.classList.add(
                "selected"
            );

        }


        /* 날짜 클릭 */

        button.addEventListener(
            "click",
            () => {

                currentDate =
                    new Date(
                        year,
                        month,
                        day
                    );

                calendarMonth =
                    month;


                updateDateUI();

                loadMessages();

                renderCalendar();


                calendar.classList.remove(
                    "active"
                );

            }
        );


        calendarDays.appendChild(
            button
        );

    }


    /* 월 버튼 활성화 */

    monthButtons.forEach(button => {

        button.classList.toggle(

            "active",

            Number(
                button.dataset.month
            ) === month

        );

    });

}


/* ========================================
   JSON 불러오기
======================================== */

async function loadMessages() {

    const dateString =
        formatDate(currentDate);


    chatMessages.innerHTML = `
        <div class="loading">
            불러오는 중...
        </div>
    `;


    try {

        const response =
            await fetch(
                `./data/${dateString}.json`
            );


        if (!response.ok) {

            throw new Error(
                "해당 날짜의 데이터가 없습니다."
            );

        }


        const messages =
            await response.json();


        renderMessages(
            messages
        );

    }

    catch (error) {

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

        const row =
            document.createElement("div");

        row.className =
            "message-row";


        /* 메시지 내용 */

        const content =
            document.createElement("div");

        content.className =
            "message-content";


        /* 발신자 */

        const sender =
            document.createElement("div");

        sender.className =
            "sender-name";

        sender.textContent =
            SENDER_NAME;


        /* 말풍선 + 시간 */

        const messageLine =
            document.createElement("div");

        messageLine.className =
            "message-line";


        /* 시간 */

        const time =
            document.createElement("span");

        time.className =
            "message-time";

        time.textContent =
            message.time || "";


        /* 텍스트 메시지 */

        if (
            message.type === "text"
        ) {

            const bubble =
                document.createElement("div");

            bubble.className =
                "message-bubble";

            bubble.textContent =
                message.message;

            messageLine.appendChild(
                bubble
            );

        }


        /* 이미지 메시지 */

        else if (
            message.type === "image"
        ) {

            const bubble =
                document.createElement("div");

            bubble.className =
                "message-bubble image-bubble";


            const image =
                document.createElement("img");

            image.className =
                "message-image";

            image.src =
                message.src;

            image.alt =
                "";


            bubble.appendChild(
                image
            );

            messageLine.appendChild(
                bubble
            );

        }


        /* 시간 */

        messageLine.appendChild(
            time
        );


        /* 내용 조립 */

        content.appendChild(
            sender
        );

        content.appendChild(
            messageLine
        );


        /* 프로필 */

        const profile =
            document.createElement("img");

        profile.className =
            "profile";

        profile.src =
            PROFILE_IMAGE;

        profile.alt =
            SENDER_NAME;


        /* 최종 조립 */

        row.appendChild(
            profile
        );

        row.appendChild(
            content
        );

        chatMessages.appendChild(
            row
        );

    });


    window.scrollTo({
        top: 0,
        behavior: "auto"
    });

}


/* ========================================
   이전 날짜
======================================== */

prevDate.addEventListener(
    "click",
    () => {

        currentDate.setDate(
            currentDate.getDate() - 1
        );

        calendarMonth =
            currentDate.getMonth();

        updateDateUI();

        loadMessages();

        renderCalendar();

    }
);


/* ========================================
   다음 날짜
======================================== */

nextDate.addEventListener(
    "click",
    () => {

        currentDate.setDate(
            currentDate.getDate() + 1
        );

        calendarMonth =
            currentDate.getMonth();

        updateDateUI();

        loadMessages();

        renderCalendar();

    }
);


/* ========================================
   날짜 클릭 → 달력 열기
======================================== */

dateButton.addEventListener(
    "click",
    () => {

        calendarMonth =
            currentDate.getMonth();


        renderCalendar();


        calendar.classList.toggle(
            "active"
        );

    }
);


/* ========================================
   4월 ~ 8월 선택
======================================== */

monthButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            calendarMonth =
                Number(
                    button.dataset.month
                );

            renderCalendar();

        }
    );

});


/* ========================================
   시작
======================================== */

async function initialize() {

    await loadAvailableDates();

    updateDateUI();

    await loadMessages();

    calendarMonth =
        currentDate.getMonth();

    renderCalendar();

}


initialize();
