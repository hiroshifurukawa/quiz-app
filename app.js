let quizData = [];
let currentQuestion = null;
let totalCount = 0;
let correctCount = 0;

async function loadQuiz() {
  try {
    const response = await fetch("./kumite_quiz_merged.csv");
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
  const explanationIndex = header.indexOf("explanation");

  if (questionIndex === -1 || answerIndex === -1 || explanationIndex === -1) {
    throw new Error("CSVのヘッダーは question,answer,explanation にしてください");
  }

  return rows.slice(1).map(row => ({
    question: row[questionIndex]?.trim() || "",
    answer: row[answerIndex]?.trim() || "",
    explanation: row[explanationIndex]?.trim() || ""
  })).filter(item => item.question && item.answer);
}

function showRandomQuestion() {
  const randomIndex = Math.floor(Math.random() * quizData.length);
  currentQuestion = quizData[randomIndex];

  document.getElementById("question").textContent = currentQuestion.question;
  document.getElementById("answerInput").value = "";
  document.getElementById("result").textContent = "";
  document.getElementById("answerInput").focus();
  document.getElementById("explanation").textContent = "";
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

  const resultEl = document.getElementById("result");
  const explanationEl = document.getElementById("explanation");

  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    correctCount++;
    resultEl.textContent = "正解です！";
  } else {
    resultEl.textContent =
      `不正解です。正解は「${currentQuestion.answer}」です。`;
  }

  // 説明を追加
  explanationEl.textContent = currentQuestion.explanation || "";

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
