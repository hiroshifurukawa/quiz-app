let quizData = [];
let filteredQuizData = [];
let remainingQuestions = [];
let currentQuestion = null;

let totalCount = 0;
let correctCount = 0;
let answered = false;
let quizFinished = false;

let reviewMarkedQuestions = [];
let incorrectQuestions = [];

let nextTimer = null;
let autoNextTime = 3000;

/* =========================
   CSV読み込み（改行対応）
========================= */
async function loadQuiz() {
  try {
    const response = await fetch("./kumite_quiz_merged.csv");
    if (!response.ok) throw new Error("CSV読み込み失敗");

    const text = await response.text();
    quizData = parseCSV(text);

    document.getElementById("question").textContent = "「開始 / リセット」を押してください";
    disableAnswerButtons(true);
    document.getElementById("nextButton").disabled = true;

  } catch (e) {
    document.getElementById("question").textContent = "エラー: " + e.message;
    console.error(e);
  }
}

/* =========================
   CSVパース（改行OK）
========================= */
function parseCSV(text) {
  const rows = [];
  let current = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      current.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (field !== "" || current.length > 0) {
        current.push(field);
        rows.push(current);
        current = [];
        field = "";
      }
    } else {
      field += char;
    }
  }

  if (field !== "" || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

  return rows.slice(1).map(row => ({
    number: Number(row[0]),
    question: row[1] || "",
    answer: row[2] || "",
    explanation: row[3] || ""
  }));
}

/* =========================
   開始番号候補生成
========================= */
function updateStartOptions() {
  const count = Number(document.getElementById("countSelect").value);
  const select = document.getElementById("startNumberSelect");

  select.innerHTML = "";

  for (let i = 1; i <= 275; i += count) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    select.appendChild(option);

     // 第1問をデフォルトに設定
     if (i === 1) {
      option.selected = true;
    }
  }
}

/* =========================
   クイズ開始
========================= */
function startQuiz() {

  if (nextTimer) {
    clearTimeout(nextTimer);
    nextTimer = null;
  }

  const count = Number(document.getElementById("countSelect").value);
  const start = Number(document.getElementById("startNumberSelect").value);
  const end = start + count - 1;

  autoNextTime = Number(document.getElementById("timeSelect").value);

  filteredQuizData = quizData.filter(q =>
    q.number >= start && q.number <= end
  );

  remainingQuestions = [...filteredQuizData];

  totalCount = 0;
  correctCount = 0;
  answered = false;
  quizFinished = false;
  reviewMarkedQuestions = [];
  incorrectQuestions = [];

  document.getElementById("finalResult").style.display = "none";
  document.getElementById("reviewList").style.display = "none";

  updateScore();
  updateRemaining();

  showNextQuestion();
}

/* =========================
   問題表示
========================= */
function showNextQuestion() {

  if (nextTimer) {
    clearTimeout(nextTimer);
    nextTimer = null;
  }

  if (remainingQuestions.length === 0) {
    finishQuiz();
    return;
  }

  const index = Math.floor(Math.random() * remainingQuestions.length);
  currentQuestion = remainingQuestions[index];

  document.getElementById("question").textContent =
    `【${currentQuestion.number}】${currentQuestion.question}`;

  document.getElementById("result").textContent = "";
  document.getElementById("explanation").textContent = "";

  document.getElementById("reviewButton").disabled = false;
  document.getElementById("reviewButton").textContent = "この問題は回答要確認";

  answered = false;
  disableAnswerButtons(false);
  document.getElementById("nextButton").disabled = true;

  updateRemaining();
}

/* =========================
   回答処理
========================= */
function answer(userAnswer) {
  if (!currentQuestion || answered || quizFinished) return;

  answered = true;
  totalCount++;

  const resultEl = document.getElementById("result");
  const explanationEl = document.getElementById("explanation");

  if (userAnswer === currentQuestion.answer) {
    correctCount++;
    resultEl.textContent = "正解！";
  } else {
    resultEl.textContent = `不正解（正解: ${currentQuestion.answer}）`;

    incorrectQuestions.push({
       number: currentQuestion.number,
       question: currentQuestion.question,
       answer: currentQuestion.answer,
       explanation: currentQuestion.explanation
    });

  }

  explanationEl.textContent = currentQuestion.explanation;

  remainingQuestions = remainingQuestions.filter(
    q => q.number !== currentQuestion.number
  );

  updateScore();
  updateRemaining();

  disableAnswerButtons(true);

  if (remainingQuestions.length === 0) {
    finishQuiz();
  } else {
    document.getElementById("nextButton").disabled = false;

    // 自動遷移
    nextTimer = setTimeout(() => {
      showNextQuestion();
    }, autoNextTime);
  }
}

/* =========================
   要確認チェック
========================= */
function markForReview() {
  if (!currentQuestion || quizFinished) return;

  const exists = reviewMarkedQuestions.some(
    q => q.number === currentQuestion.number
  );
  if (exists) return;

  reviewMarkedQuestions.push({
    number: currentQuestion.number,
    question: currentQuestion.question
  });

  document.getElementById("reviewButton").textContent = "チェック済み";
}

/* =========================
   終了処理
========================= */
function finishQuiz() {
  quizFinished = true;
  disableAnswerButtons(true);
  document.getElementById("nextButton").disabled = true;

  document.getElementById("question").textContent = "全問完了しました";

  const rate =
    totalCount > 0
      ? ((correctCount / totalCount) * 100).toFixed(1)
      : "0.0";

  const finalEl = document.getElementById("finalResult");
  finalEl.style.display = "block";
  finalEl.textContent =
    `成績\n正解: ${correctCount}/${totalCount}\n正答率: ${rate}%`;

  const reviewEl = document.getElementById("reviewList");

   let sections = [];

   if (incorrectQuestions.length > 0) {
     const incorrectText = incorrectQuestions
       .map(q => `【${q.number}】${q.question}\n正解: ${q.answer}\n解説: ${q.explanation}
       .join("\n\n");
   
     sections.push(`間違えた問題一覧\n\n${incorrectText}`);
   }
   
   if (reviewMarkedQuestions.length > 0) {
     const reviewText = reviewMarkedQuestions
       .map(q => `【${q.number}】${q.question}`)
       .join("\n");
   
     sections.push(`以下の問題は回答要確認のチェックが入りました\n\n${reviewText}`);
   }
   
   if (sections.length > 0) {
     reviewEl.style.display = "block";
     reviewEl.textContent = sections.join("\n\n--------------------\n\n");
   } else {
     reviewEl.style.display = "none";
   }   
}

/* =========================
   UI補助
========================= */
function updateScore() {
  document.getElementById("score").textContent =
    `${totalCount}問中 ${correctCount}問正解`;
}

function updateRemaining() {
  document.getElementById("remaining").textContent =
    `残り問題数: ${remainingQuestions.length}`;
}

function disableAnswerButtons(disabled) {
  document.querySelectorAll(".answer-btn").forEach(btn => {
    btn.disabled = disabled;
  });
}

/* =========================
   イベント
========================= */
document.getElementById("nextButton").addEventListener("click", () => {
  if (nextTimer) {
    clearTimeout(nextTimer);
    nextTimer = null;
  }
  showNextQuestion();
});

document.getElementById("startButton").addEventListener("click", startQuiz);
document.getElementById("reviewButton").addEventListener("click", markForReview);
document.getElementById("countSelect").addEventListener("change", updateStartOptions);

/* =========================
   初期化
========================= */
updateStartOptions();
loadQuiz();
