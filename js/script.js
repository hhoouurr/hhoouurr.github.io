let currentDate = new Date(2026, 7, 11);


/* =========================
   DOM
========================= */

const dateButton = document.getElementById("dateButton");
const datePicker = document.getElementById("datePicker");

const prevDate = document.getElementById("prevDate");
const nextDate = document.getElementById("nextDate");

const chatDate = document.getElementById("chatDate");
const chatMessages = document.getElementById("chatMessages");


/* =========================
   날짜 포맷
========================= */

function formatDate(date) {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDisplayDate(date) {

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}. ${String(month).padStart(2, "0")}. ${String(day).padStart(2, "0")}`;
}


function formatKoreanDate(date) {

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}년 ${month}월 ${day}일`;
}


/* =========================
   날짜 표시
========================= */

function updateDateUI() {

    dateButton.textContent = formatDisplayDate(currentDate);

    chatDate.textContent = formatKoreanDate(currentDate);

    datePicker.value = formatDate(currentDate);
}


/* =========================
   대화 불러오기
========================= */

async function loadMessages() {

    const dateString = formatDate(currentDate);

    chatMessages.innerHTML = `
        <div class="loading">
            불러오는 중...
        </div>
    `;


    try {

        const response = await fetch(
            `data/${dateString}.json`
        );


        if (!response.ok) {
            throw new Error("No data");
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


/* =========================
   메시지 표시
========================= */

function renderMessages(messages) {

    chatMessages.innerHTML = "";


    messages.forEach(message => {

        const row = document.createElement("div");

        row.className = "message-row";


        /*
         * 일반 텍스트
         */

        if (message.type === "text") {

            row.innerHTML = `

                <span class="message-time">
                    ${message.time}
                </span>

                <div class="message-bubble">
                    ${escapeHTML(message.message)}
                </div>

            `;

        }


        /*
         * 이미지
         */

        else if (message.type === "image") {

            row.innerHTML = `

                <span class="message-time">
                    ${message.time}
                </span>

                <div class="message-bubble image-bubble">

                    <img
                        src="${message.src}"
                        class="message-image"
                        alt=""
                    >

                </div>

            `;

        }


        chatMessages.appendChild(row);

    });


    /*
     * 새로운 날짜를 열었을 때
     * 가장 아래로 이동
     */

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

}


/* =========================
   HTML 문자 방지
========================= */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =========================
   이전 날짜
========================= */

prevDate.addEventListener("click", () => {

    currentDate.setDate(
        currentDate.getDate() - 1
    );

    updateDateUI();
    loadMessages();

});


/* =========================
   다음 날짜
========================= */

nextDate.addEventListener("click", () => {

    currentDate.setDate(
        currentDate.getDate() + 1
    );

    updateDateUI();
    loadMessages();

});


/* =========================
   날짜 선택
========================= */

dateButton.addEventListener("click", () => {

    datePicker.showPicker();

});


datePicker.addEventListener("change", () => {

    const [year, month, day] =
        datePicker.value.split("-");

    currentDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );

    updateDateUI();
    loadMessages();

});


/* =========================
   시작
========================= */

updateDateUI();
loadMessages();
