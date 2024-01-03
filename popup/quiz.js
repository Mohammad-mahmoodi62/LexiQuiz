let quizQuestions = [];
let dbSize;

function send(type) {
    chrome.runtime.sendMessage({
        action: "getData2",
        type: type
    }, function (response) {
        console.log('helloooo')
        console.log(response)
        if (response.success) {
            quizQuestions = response.data.quiz
            stopLoader();
            showQuestions()
            dbSize = response.data.dbSize
            spinnerContainer.style.display = 'none';
        } else {
            console.error("Error getting data from database: " + response.error);
        }
    });
}

function prepareQuiz(quizquestions) {
    // Get the quiz container element
    var quizContainer = document.getElementById('quiz-container');

    // Display quiz quizQuestions and options
    for (var i = 0; i < quizquestions.length; i++) {
        var question = quizquestions[i].question;
        question = question.toLowerCase();
        question = question.replace(quizquestions[i].answer.toLowerCase(), "__________");
        var options = quizquestions[i].opt;

        // Create a div for each question
        var questionDiv = document.createElement('div');
        questionDiv.innerHTML = '<p>' + (i + 1) + '. ' + question + '</p>';

        // Create radio buttons for each option
        for (var j = 0; j < options.length; j++) {
            var option = options[j].toLowerCase();
            var label = document.createElement('label');
            label.innerHTML = '<input type="radio" name="question' + i + '" value="' + option + '"> ' + option;
            questionDiv.appendChild(label);
        }

        // Add question div to quiz container
        quizContainer.appendChild(questionDiv);
    }
}

const startRecentBtn = document.querySelector('.start-recent-btn');
const startRandomBtn = document.querySelector('.start-random-btn');
const popupInfo = document.querySelector('.popup-info');
const exitBtn = document.querySelector('.exit-btn');
const main = document.querySelector('.main');
const continueBtn = document.querySelector('.continue-btn');
const quizSection = document.querySelector('.quiz-section');
const resultBox = document.querySelector('.result-box');
const tryAgainBtn = document.querySelector('.tryAgain-btn');
const goHomeBtn = document.querySelector('.goHome-btn');
const submitBtn = document.querySelector('.submit-btn');

startRecentBtn.onclick = () => {
    popupInfo.classList.add('active');
    main.classList.add('active');
    send('recent');
}
startRandomBtn.onclick = () => {
    popupInfo.classList.add('active');
    main.classList.add('active');
    send('random');
}

exitBtn.onclick = () => {
    popupInfo.classList.remove('active');
    main.classList.remove('active');
}

continueBtn.onclick = () => {
    quizSection.classList.add('active');
    popupInfo.classList.remove('active');
    main.classList.remove('active');
    // quizBox.classList.add('active');

    document.querySelector('.loader-container').classList.add('active');

    showQuestions();
    questionCounter(1);
    headerScore();
}

tryAgainBtn.onclick = () => {
    // quizBox.classList.add('active');
    // nextBtn.classList.remove('active');
    resultBox.classList.remove('active');

    const quizSection = document.querySelector('.quiz-section');
    
    // Get all elements with the class 'quiz-box'
    const quizBoxes = quizSection.querySelectorAll('.quiz-box');

    // Loop through the quiz boxes and remove them
    quizBoxes.forEach((quizBox) => {
        quizSection.removeChild(quizBox);
    });

    wrongAnswers = [];
    correctAnswers = [];
    selectedOptions = [];
    showQuestions();
    questionCounter(questionCount);

    headerScore();
}

goHomeBtn.onclick = () => {
    quizSection.classList.remove('active');
    // nextBtn.classList.remove('active');
    resultBox.classList.remove('active');

    
    // Get all elements with the class 'quiz-box'
    const quizBoxes = quizSection.querySelectorAll('.quiz-box');

    // Loop through the quiz boxes and remove them
    quizBoxes.forEach((quizBox) => {
        quizSection.removeChild(quizBox);
    });

    wrongAnswers = [];
    correctAnswers = [];
    selectedOptions = [];
}

let questionCount = 0;
let questionNumb = 1;
let userScore = 0;

let correctAnswers = [];
let wrongAnswers = [];
submitBtn.onclick = () => {
    quizQuestions.reverse();
    selectedOptions.reverse();
    const quizBoxex = document.querySelectorAll('.quiz-box');
    for(var i=0; i < quizQuestions.length; i++) {
        if(selectedOptions[i] === undefined){
            const options = quizBoxex[i].childNodes[1].childNodes;
            for (var j = 0; j < options.length; j++)
            {
                if (options[j].textContent === quizQuestions[i].answer) {
                    wrongAnswers.push(quizQuestions[i].answer);
                    options[j].classList.add('correct');
                }
            }
            continue;
        }
        const selectedOption = quizBoxex[i].childNodes[1].childNodes[selectedOptions[i]]
        if(quizQuestions[i].answer === selectedOption.textContent)
        {
            selectedOption.classList.add('correct');
            correctAnswers.push(quizQuestions[i].answer);
        }
        else {
            selectedOption.classList.add('incorrect');
            wrongAnswers.push(quizQuestions[i].answer);
            const options = quizBoxex[i].childNodes[1].childNodes;
            for (var j = 0; j < options.length; j++)
            {
                if (options[j].textContent === quizQuestions[i].answer) {
                    options[j].classList.add('correct');
                }
            }
        }
    }
    const allOptions = document.querySelectorAll('.option');
    for (var i= 0; i < allOptions.length; i++){
        allOptions[i].classList.add('disabled');
    }
    const data = {
        dbSize: dbSize,
        correctAnswers: correctAnswers,
        wrongAnswers: wrongAnswers
    }
    chrome.runtime.sendMessage({
        action: "submitQuiz",
        data: data
    }, function (response) {
        console.log(response)
    });
    showResultBox();
    return;
}

const optionList = document.querySelector('.option-list');

let selectedOptions = []; // Global variable to store selected options
// getting quizQuestions and options from array
function showQuestions() {
    const quizSection = document.querySelector('.quiz-section');
    let questionCounter = 0;
    for (const questionObj of quizQuestions) {
        // Create a new quiz box element
        const quizBox = document.createElement('div');
        quizBox.classList.add('quiz-box');
        quizBox.id = questionCounter; // Set a unique ID for each question
        questionCounter++;

        // Set the question text
        const questionText = document.createElement('h2');
        questionText.classList.add('question-text');
        var question = questionObj.question.toLowerCase();
        question = questionObj.question.toLowerCase().replace(questionObj.answer.toLowerCase(), "__________");
        questionText.textContent = question;

        // Create options list container
        const optionList = document.createElement('div');
        optionList.classList.add('option-list');

        // Loop through options and create option elements
        for (const option of questionObj.opt) {
            const optionElement = document.createElement('div');
            optionElement.classList.add('option');
            optionElement.textContent = option;

            // Attach the event handler using addEventListener
            optionElement.addEventListener('click', function() {
                optionSelected(this);
            });

            optionList.appendChild(optionElement);
        }

        // Append question text and options to quiz box
        quizBox.appendChild(questionText);
        quizBox.appendChild(optionList);

        // Append the quiz box to the quiz section
        quizSection.insertBefore(quizBox, quizSection.firstChild);
    }
}


function optionSelected(option) {
    const selectedOptionIndex = Array.from(option.parentNode.children).indexOf(option);
    const questionId = option.closest('.quiz-box').id;

    var isItRemoved = false;
    // Check if the option was already selected
    if (selectedOptions[questionId] === selectedOptionIndex) {
        // Deselect the option
        selectedOptions[questionId] = undefined;
        option.classList.remove('selected');
        isItRemoved = true;
    } else {
        // Store selected option for the current question
        selectedOptions[questionId] = selectedOptionIndex;
    }
    
    if (selectedOptions.length === 0 || Object.values(selectedOptions).every(value => value === undefined)) {
        submitBtn.classList.remove('active');
    }
    else {
        submitBtn.classList.add('active');
    }
    // Show UI for selected option
    Array.from(option.parentNode.children).forEach((opt, index) => {
        opt.classList.remove('selected');
        if (index === selectedOptionIndex && !isItRemoved) {
            opt.classList.add('selected');
        }
    });

    // You can continue with the code to check if the selected option is correct or perform other actions
    const correctAnswerIndex = quizQuestions[questionId].answer;
    const isCorrect = option.textContent === correctAnswerIndex;

    console.log('question index:', questionId,'Selected:', selectedOptionIndex, 'Correct:', correctAnswerIndex, 'Is Correct:', isCorrect);
}
function questionCounter(index) {
    const questionTotal = document.querySelector('.question-total');
    questionTotal.textContent = `${index} of ${quizQuestions.length} Questions`
}

function headerScore() {
    const headerScoreText = document.querySelector('.header-score');
    headerScoreText.textContent = `Score: ${userScore} / ${quizQuestions.length}`;
}

function showResultBox() {
    // quizBox.classList.remove('active');
    
    resultBox.classList.add('active');
    resultBox.scrollIntoView({ behavior: 'smooth' });
    const userScore = correctAnswers.length;

    const scoreText = document.querySelector('.score-text');
    scoreText.textContent = `Your score ${userScore} out of ${quizQuestions.length}`;

    const circularProgress = document.querySelector('.circular-progress');
    const progressValue = document.querySelector('.progress-value');
    let progressStartValue = -1;
    let progressEndValue = (userScore / quizQuestions.length) * 100;
    let speed = 20;

    console.log("startvalue:", progressStartValue, "endvalue:", progressEndValue);

    let progress = setInterval(() => {
        progressStartValue++;

        progressValue.textContent = `${progressStartValue}%`;
        circularProgress.style.background = `conic-gradient(#c40094 ${progressStartValue * 3.6}deg, rgba(255, 255, 255, 0.1) 0deg)`;
        if (progressStartValue == Math.floor(progressEndValue)) {
            clearInterval(progress);
        }
    }, speed);
}

function stopLoader() {
    var loaderContainer = document.getElementById("loaderContainer");
    var loader = document.getElementById("loader");

    loaderContainer.classList.add("paused");
    loader.style.animation = "none";
    loaderContainer.classList.remove('active');
    document.querySelector('.quiz-footer').classList.add('visible');
}
