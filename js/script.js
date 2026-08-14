/* ========================================
   기본 설정
======================================== */


// 현재 처음 열 날짜
let currentDate = new Date(2026, 7, 11);

let calendarMonth =
    currentDate.getMonth();

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

const calendar =
    document.getElementById("calendar");

const calendarDays =
    document.getElementById("calendarDays");

const calendarTitle =
    document.getElementById("calendarTitle");

const monthButtons =
    document.querySelectorAll(".month-button");

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
async function loadAvailableDates() {

    try {

        const response =
            await fetch("./data/dates.json");

        if (!response.ok) {
            throw new Error();
        }

        availableDates =
            await response.json();

    }

    catch (error) {

        console.warn(
            "dates.json을 불러오지 못했습니다."
        );

        availableDates = [];

    }

}



/* ========================================
   날짜 → 2021년 10월 7일 목요일
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


    datePicker.value =
        formatDate(currentDate);

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


        renderMessages(messages);


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


        /* -------------------------
           메시지 내용
        ------------------------- */

        const content =
            document.createElement("div");

        content.className =
            "message-content";


        /* -------------------------
           발신자 이름
        ------------------------- */

        const sender =
            document.createElement("div");

        sender.className =
            "sender-name";

        sender.textContent =
            SENDER_NAME;


        /* -------------------------
           말풍선 + 시간
        ------------------------- */

        const messageLine =
            document.createElement("div");

        messageLine.className =
            "message-line";


        /* -------------------------
           시간
        ------------------------- */

        const time =
            document.createElement("span");

        time.className =
            "message-time";

        time.textContent =
            message.time || "";



        /* =========================
           텍스트 메시지
        ========================= */

        if (message.type === "text") {

            const bubble =
                document.createElement("div");

            bubble.className =
                "message-bubble";


            bubble.textContent =
                message.message;


            messageLine.appendChild(bubble);

        }



        /* =========================
           이미지 메시지
        ========================= */

        else if (message.type === "image") {

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


            bubble.appendChild(image);

            messageLine.appendChild(bubble);

        }



        /* -------------------------
           시간 추가
        ------------------------- */

        messageLine.appendChild(time);


        /* -------------------------
           내용 조립
        ------------------------- */

        content.appendChild(sender);

        content.appendChild(messageLine);



        /* -------------------------
           프로필
        ------------------------- */

        const profile =
            document.createElement("img");

        profile.className =
            "profile";

        profile.src =
            PROFILE_IMAGE;

        profile.alt =
            SENDER_NAME;



        /* -------------------------
           최종 조립
        ------------------------- */

        row.appendChild(profile);

        row.appendChild(content);

        chatMessages.appendChild(row);

    }


    );


    /*
     * 새로운 날짜를 열었을 때
     * 페이지 맨 위로 이동
     */

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

}



/* ========================================
   날짜 이전
======================================== */

prevDate.addEventListener(
    "click",
    () => {

        currentDate.setDate(
            currentDate.getDate() - 1
        );


        updateDateUI();

        loadMessages();

    }
);



/* ========================================
   날짜 다음
======================================== */

nextDate.addEventListener(
    "click",
    () => {

        currentDate.setDate(
            currentDate.getDate() + 1
        );


        updateDateUI();

        loadMessages();

    }
);



/* ========================================
   날짜 선택
======================================== */

dateButton.addEventListener(
    "click",
    () => {

        /*
         * 브라우저의 날짜 선택창
         */

        if (datePicker.showPicker) {

            datePicker.showPicker();

        }

        else {

            datePicker.click();

        }

    }
);



/* ========================================
   날짜가 직접 선택되었을 때
======================================== */

datePicker.addEventListener(
    "change",
    () => {

        if (!datePicker.value) {
            return;
        }


        const [
            year,
            month,
            day
        ] = datePicker.value.split("-");


        currentDate =
            new Date(
                Number(year),
                Number(month) - 1,
                Number(day)
            );


        updateDateUI();

        loadMessages();

    }
);



/* ========================================
   시작
======================================== */

updateDateUI();

loadMessages();
