
let questions = JSON.parse(
  sessionStorage.getItem("pendingQuestions")
);

if (!questions || questions.length === 0) {
  alert("ไม่พบข้อมูลคำถาม");
  location.href = "quest-admin-multiple.html";
}

const list =
  document.getElementById("questionList");

function saveQuestions() {
  sessionStorage.setItem(
    "pendingQuestions",
    JSON.stringify(questions)
  );
}

function renderQuestions() {

  list.innerHTML = "";

  questions.forEach((q, i) => {

    const div =
      document.createElement("div");

    div.className =
      "question-preview";

    div.innerHTML = `

      <h4>ข้อ ${i + 1}</h4>

      <input
        type="text"
        value="${q.question}"
        class="question-input"
      >

      <br><br>

      <input
        type="text"
        value="${q.options[0]}"
        class="option-input"
        data-index="${i}"
        data-option="0"
      >

      <input
        type="text"
        value="${q.options[1]}"
        class="option-input"
        data-index="${i}"
        data-option="1"
      >

      <input
        type="text"
        value="${q.options[2]}"
        class="option-input"
        data-index="${i}"
        data-option="2"
      >

      <input
        type="text"
        value="${q.options[3]}"
        class="option-input"
        data-index="${i}"
        data-option="3"
      >

      <br><br>

      <select
        class="correct-select"
      >
        <option value="1"
          ${q.correct == 1 ? "selected" : ""}>
          ตัวเลือกที่ 1
        </option>

        <option value="2"
          ${q.correct == 2 ? "selected" : ""}>
          ตัวเลือกที่ 2
        </option>

        <option value="3"
          ${q.correct == 3 ? "selected" : ""}>
          ตัวเลือกที่ 3
        </option>

        <option value="4"
          ${q.correct == 4 ? "selected" : ""}>
          ตัวเลือกที่ 4
        </option>
      </select>

      <br><br>

      <textarea
        class="explanation-input"
      >${q.explanation || ""}</textarea>

      <br><br>

      <button
        type="button"
        class="delete-btn">

        🗑️ ลบข้อนี้

      </button>

      <hr>
    `;

    list.appendChild(div);

    const questionInput =
      div.querySelector(
        ".question-input"
      );

    questionInput.addEventListener(
      "input",
      () => {

        questions[i].question =
          questionInput.value;

        saveQuestions();
      }
    );

    div.querySelectorAll(
      ".option-input"
    ).forEach(input => {

      input.addEventListener(
        "input",
        () => {

          const option =
            Number(
              input.dataset.option
            );

          questions[i]
            .options[option] =
            input.value;

          saveQuestions();
        }
      );

    });

    div.querySelector(
      ".correct-select"
    ).addEventListener(
      "change",
      e => {

        questions[i].correct =
          Number(e.target.value);

        saveQuestions();
      }
    );

    div.querySelector(
      ".explanation-input"
    ).addEventListener(
      "input",
      e => {

        questions[i].explanation =
          e.target.value;

        saveQuestions();
      }
    );

    div.querySelector(
      ".delete-btn"
    ).addEventListener(
      "click",
      () => {

        if (
          !confirm(
            "ลบคำถามข้อนี้?"
          )
        ) return;

        questions.splice(i, 1);

        saveQuestions();

        renderQuestions();
      }
    );

  });

}

renderQuestions();

document
  .getElementById("nextBtn")
  .addEventListener(
    "click",
    () => {

      saveQuestions();

      location.href =
        "quest-admin-multiple3.html";

    }
  );
