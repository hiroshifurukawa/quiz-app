let quizData = [];
let currentQuestion = null;
let totalCount = 0;
let correctCount = 0;

async function loadQuiz() {
  try {
    const response = await fetch("./quiz.csv");
    if (!response.ok) {
      throw new Error("quiz.csv の読み込みに失敗しました");
    }

    const csvText = await response.text();
    quizData = parseCSV(csvText);

    if (quizData.length === 0) {
      document.getElementById("question").textContent = "問題がありません。";
      return;
    }

    showRandomQuestion();
  } catch (error) {
    document.getElementById("question").textContent = "エラー: " + error.message;
  }
}

function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const rows = lines.map(line => line.split(","));

  const header = rows[0];
  const questionIndex = header.indexOf("question");
  const answerIndex = header.indexOf("answer");

  if (questionIndex === -1 || answerIndex === -1) {
    throw new Error("CSVのヘッダーは question,answer にしてください");
  }

  return rows.slice(1).map(row => ({
    question: row[questionIndex]?.trim() || "",
    answer: row[answerIndex]?.trim() || ""
  })).filter(item => item.question && item.answer);
}

function showRandomQuestion() {
  const randomIndex = Math.floor(Math.random() * quizData.length);
  currentQuestion = quizData[randomIndex];

  document.getElementById("question").textContent = currentQuestion.question;
  document.getElementById("answerInput").value = "";
  document.getElementById("result").textContent = "";
  document.getElementById("answerInput").focus();
}

function normalizeText(text) {
  return text.trim().toLowerCase();
}

function checkAnswer() {
  if (!currentQuestion) return;

  const userAnswer = document.getElementById("answerInput").value;
  const normalizedUserAnswer = normalizeText(userAnswer);
  const normalizedCorrectAnswer = normalizeText(currentQuestion.answer);

  totalCount++;

  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    correctCount++;
    document.getElementById("result").textContent = "正解です！";
  } else {
    document.getElementById("result").textContent =
      `不正解です。正解は「${currentQuestion.answer}」です。`;
  }

  updateScore();
}

function updateScore() {
  document.getElementById("score").textContent =
    `${totalCount}問中 ${correctCount}問正解`;
}

document.getElementById("checkButton").addEventListener("click", checkAnswer);
document.getElementById("nextButton").addEventListener("click", showRandomQuestion);

document.getElementById("answerInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkAnswer();
  }
});

loadQuiz();let quizData = [];
let currentQuestion = null;
let totalCount = 0;
let correctCount = 0;

async function loadQuiz() {
  try {
    const response = await fetch("./quiz.csv");
    if (!response.ok) {
      throw new Error("quiz.csv の読み込みに失敗しました");
    }

    const csvText = await response.text();
    quizData = parseCSV(csvText);

    if (quizData.length === 0) {
      document.getElementById("question").textContent = "問題がありません。";
      return;
    }

    showRandomQuestion();
  } catch (error) {
    document.getElementById("question").textContent = "エラー: " + error.message;
  }
}

function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const rows = lines.map(line => line.split(","));

  const header = rows[0];
  const questionIndex = header.indexOf("question");
  const answerIndex = header.indexOf("answer");

  if (questionIndex === -1 || answerIndex === -1) {
    throw new Error("CSVのヘッダーは question,answer にしてください");
  }

  return rows.slice(1).map(row => ({
    question: row[questionIndex]?.trim() || "",
    answer: row[answerIndex]?.trim() || ""
  })).filter(item => item.question && item.answer);
}

function showRandomQuestion() {
  const randomIndex = Math.floor(Math.random() * quizData.length);
  currentQuestion = quizData[randomIndex];

  document.getElementById("question").textContent = currentQuestion.question;
  document.getElementById("answerInput").value = "";
  document.getElementById("result").textContent = "";
  document.getElementById("answerInput").focus();
}

function normalizeText(text) {
  return text.trim().toLowerCase();
}

function checkAnswer() {
  if (!currentQuestion) return;

  const userAnswer = document.getElementById("answerInput").value;
  const normalizedUserAnswer = normalizeText(userAnswer);
  const normalizedCorrectAnswer = normalizeText(currentQuestion.answer);

  totalCount++;

  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    correctCount++;
    document.getElementById("result").textContent = "正解です！";
  } else {
    document.getElementById("result").textContent =
      `不正解です。正解は「${currentQuestion.answer}」です。`;
  }

  updateScore();
}

function updateScore() {
  document.getElementById("score").textContent =
    `${totalCount}問中 ${correctCount}問正解`;
}

document.getElementById("checkButton").addEventListener("click", checkAnswer);
document.getElementById("nextButton").addEventListener("click", showRandomQuestion);

document.getElementById("answerInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkAnswer();
  }
});

loadQuiz();
