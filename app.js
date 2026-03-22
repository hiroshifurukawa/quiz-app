let quizData = [];
let filteredQuizData = [];
let remainingQuestions = [];
let currentQuestion = null;

let totalCount = 0;
let correctCount = 0;
let answered = false;
let quizFinished = false;

async function loadQuiz() {
  try {
    const response = await fetch("./kumite_quiz_merged.csv");
    if (!response.ok) {
      throw new Error("CSVファイルの読み込みに失敗しました");
    }

    const csvText = await response.text();
    quizData = parseCSV(csvText);

    document.getElementById("question").textContent = "「開始 / リセット」を押してください";
    disableAnswerButtons(true);
    document.getElementById("nextButton").disabled = true;
  } catch (error) {
    document.getElementById("question").textContent = "エラー: " + error.message;
    console.error(error);
  }
}

function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);

  const rows = lines.map(parseCSVLine);
  const header = rows[0];

  const numberIndex = header.indexOf("number");
  const questionIndex = header.indexOf("question");
  const answerIndex = header.indexOf("answer");
  const explanationIndex = header.indexOf("explanation");

  return rows.slice(1).map(row => ({
    number: Number(row[numberIndex]?.trim() || 0),
    question: row[questionIndex]?.trim() || "",
    answer: row[answerIndex]?.trim() || "",
    explanation: row[explanationIndex]?.trim() || ""
  }));
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function startQuiz() {
  const rangeValue = document.getElementById("rangeSelect").value;
  const [start, end] = rangeValue.split("-").map(Number);

  filteredQuizData = quizData.filter(q => q.number >= start && q.number <= end);

  remainingQuestions = [...filteredQuizData];
  totalCount = 0;
  correctCount = 0;
  answered = false;
  quizFinished = false;

  document.getElementById("finalResult").style.display = "none";
  document.getElementById("finalResult").textContent = "";

  updateScore();
  updateRemaining();

  if (remainingQuestions.length === 0) {
    document.getElementById("question").textContent = "この範囲の問題がありません。";
    document.getElementById("result").textContent = "";
    document.getElementById("explanation").textContent = "";
    disableAnswerButtons(true);
    document.getElementById("nextButton").disabled = true;
    return;
  }

  showNextQuestionFromPool();
}

function showNextQuestionFromPool() {
  if (remainingQuestions.length === 0) {
    finishQuiz();
    return;
  }

  const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
  currentQuestion = remainingQuestions[randomIndex];

  document.getElementById("question").textContent =
    `【${currentQuestion.number}】${currentQuestion.question}`;
  document.getElementById("result").textContent = "";
  document.getElementById("explanation").textContent = "";

  answered = false;
  disableAnswerButtons(false);
  document.getElementById("nextButton").disabled = true;

  updateRemaining();
}

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
  }

  explanationEl.textContent = currentQuestion.explanation || "";

  remainingQuestions = remainingQuestions.filter(q => q.number !== currentQuestion.number);

  updateScore();
  updateRemaining();

  disableAnswerButtons(true);

  if (remainingQuestions.length === 0) {
    document.getElementById("nextButton").disabled = true;
    finishQuiz();
  } else {
    document.getElementById("nextButton").disabled = false;
  }
}

function finishQuiz() {
  quizFinished = true;
  disableAnswerButtons(true);
  document.getElementById("nextButton").disabled = true;

  document.getElementById("question").textContent = "全問完了しました。";
  document.getElementById("result").textContent = "";

  const rate = totalCount > 0 ? ((correctCount / totalCount) * 100).toFixed(1) : "0.0";
  const finalResultEl = document.getElementById("finalResult");
  finalResultEl.style.display = "block";
  finalResultEl.textContent =
    `成績\n正解数: ${correctCount} / ${totalCount}\n正答率: ${rate}%`;
}

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

document.getElementById("nextButton").addEventListener("click", showNextQuestionFromPool);
document.getElementById("startButton").addEventListener("click", startQuiz);

loadQuiz();
