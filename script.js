const loginScreen = document.getElementById("loginScreen");
const quizApp = document.getElementById("quizApp");
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const userInfo = document.getElementById("userInfo");

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const endButton = document.getElementById("end-btn");
const reviewButton = document.getElementById("review-btn");
const timerElement = document.getElementById("timer");
const themeToggle = document.getElementById("theme-toggle");

let loggedInUser = "";
let currentQuestionIndex = 0;
let score = 0;
let isQuizOver = false;
let timerInterval;
let totalTime = 60;

let questionStatus = [];
let reviewQuestions = [];
const scorePerQuestion = [];

let questions = [];

async function loadQuestions() {
  try {
    const res = await fetch('data/questions.json');
    questions = await res.json();
    startQuiz();
  } catch (err) {
    console.error("Failed to load questions:", err);
  }
}

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  loggedInUser = usernameInput.value.trim();
  if (!loggedInUser) return;

  loginScreen.style.display = "none";
  quizApp.style.display = "block";
  userInfo.textContent = `Hello, ${loggedInUser}!`;

  await loadQuestions();
});


function startTimer() {
  totalTime = 60;
  timerElement.textContent = `Time left: ${totalTime}s`;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    totalTime--;
    timerElement.textContent = `Time left: ${totalTime}s`;
    if (totalTime <= 0) {
      clearInterval(timerInterval);
      showScore();
    }
  }, 1000);
}

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  isQuizOver = false;
  nextButton.innerHTML = "Next";
  nextButton.style.display = "block";
  endButton.style.display = "block";
  answerButtons.innerHTML = "";
  initializeStatus();
  showQuestion();
  startTimer();
}

function showQuestion() {
  resetState();
  const currentQuestion = questions[currentQuestionIndex];
  questionElement.innerHTML = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;
  currentQuestion.answers.forEach(ans => {
    const btn = document.createElement("button");
    btn.textContent = ans.text;
    btn.className = "btn";
    if (ans.correct) btn.dataset.correct = "true";
    btn.addEventListener("click", selectAnswer);
    answerButtons.appendChild(btn);
  });
}

function resetState() {
  nextButton.style.display = "none";
  answerButtons.innerHTML = "";
}

function selectAnswer(e) {
  const selectedBtn = e.target;
  const isCorrect = selectedBtn.dataset.correct === "true";
  score += isCorrect ? 4 : -1;
  scorePerQuestion[currentQuestionIndex] = isCorrect ? 4 : -1;
  questionStatus[currentQuestionIndex] = 'attempted';
  selectedBtn.classList.add(isCorrect ? "correct" : "incorrect");

  Array.from(answerButtons.children).forEach(btn => {
    if (btn.dataset.correct === "true") btn.classList.add("correct");
    btn.disabled = true;
  });

  nextButton.style.display = "block";
  updateStatusBar();
  renderProgressBar();
}

function showScore() {
  clearInterval(timerInterval);
  resetState();
  endButton.style.display = "none";
  isQuizOver = true;
  questionElement.innerHTML = `🎉 Well done, ${loggedInUser}!`;
  nextButton.innerHTML = "Play Again";
  nextButton.style.display = "block";
}

function handleNextButton() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) showQuestion();
  else showScore();
}

endButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to end the quiz?")) {
    clearInterval(timerInterval);
    showScore();
  }
});

nextButton.addEventListener("click", () => {
  if (isQuizOver) startQuiz();
  else handleNextButton();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
});

function initializeStatus() {
  questionStatus = Array(questions.length).fill('unattempted');
  reviewQuestions = [];
  scorePerQuestion.length = questions.length;
  scorePerQuestion.fill(0);
  updateStatusBar();
  renderProgressBar();
}

function updateStatusBar() {
  document.getElementById("attempted-count").textContent = questionStatus.filter(s => s === 'attempted').length;
  document.getElementById("unattempted-count").textContent = questionStatus.filter(s => s === 'unattempted').length;
  document.getElementById("review-count").textContent = reviewQuestions.length;
}

function renderProgressBar() {
  const progressBar = document.getElementById("progress-bar");
  progressBar.innerHTML = "";
  questions.forEach((q, idx) => {
    const box = document.createElement("div");
    box.className = "question-box";
    box.textContent = idx + 1;
    if (questionStatus[idx] === 'attempted') box.classList.add('attempted');
    if (reviewQuestions.includes(idx)) box.classList.add('review');
    box.addEventListener("click", () => {
      currentQuestionIndex = idx;
      showQuestion();
    });
    progressBar.appendChild(box);
  });
}

reviewButton.addEventListener("click", () => {
  if (!reviewQuestions.includes(currentQuestionIndex)) {
    reviewQuestions.push(currentQuestionIndex);
    questionStatus[currentQuestionIndex] = 'review';
  }
  updateStatusBar();
  renderProgressBar();
});