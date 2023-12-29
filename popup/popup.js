// Show the spinner before loading the quiz questions

let quizquestions = [];
let dbSize;
var spinnerContainer = document.getElementById('spinner-container');
spinnerContainer.style.display = 'none';


document.addEventListener("DOMContentLoaded", function () {
    var randomQuizBtn = document.getElementById("randomQuizBtn");
    var recentQuizBtn = document.getElementById("recentQuizBtn");
    var spinnerContainer = document.getElementById('spinner-container');

    randomQuizBtn.addEventListener("click", function () {
        randomQuizBtn.style.display = "none";
        recentQuizBtn.style.display = "none";
        spinnerContainer.style.display = 'block';
        send("random");
    });

    recentQuizBtn.addEventListener("click", function () {
        randomQuizBtn.style.display = "none";
        recentQuizBtn.style.display = "none";
        spinnerContainer.style.display = 'block';
        send("recent");
    });
});

function send(type) {
    chrome.runtime.sendMessage({
        action: "getData2",
        type: type
    }, function (response) {
        console.log('helloooo')
        console.log(response)
        if (response.success) {
            // const data = response.data;
            // const list = document.createElement("ul");

            // // Create a bullet point for each item in the data array
            // data.forEach(function (item) {
            //     const listItem = document.createElement("li");
            //     listItem.innerText = item.question + " - " + item.answer;
            //     list.appendChild(listItem);
            // });

            // // Append the list to the document
            // document.body.appendChild(list);
            prepareQuiz(response.data.quiz)
            quizquestions = response.data.quiz
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

    // Display quiz questions and options
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

// Attach click event listener to submit button
var submitBtn = document.getElementById('submit-btn');
submitBtn.addEventListener('click', function () {
    submitQuiz();
});

// Check quiz answers on submit
// function submitQuiz() {
//     var score = 0;
//     var result = document.getElementById('result');
//     for (var i = 0; i < quizquestions.length; i++) {
//         var answer = quizquestions[i].answer;
//         var selected = document.querySelector('input[name="question' + i + '"]:checked');
//         console.log('selected is ' + selected + ' and the answer is ' + answer)
//         if (selected !== null && selected.value === answer) {
//             score++;
//         }
//     }
//     result.innerHTML = 'You scored ' + score + ' out of ' + quizquestions.length;
// }

function submitQuiz() {
    let correctAnswers = []
    let wrongAnswers = []
    var result = document.getElementById('result');
    for (var i = 0; i < quizquestions.length; i++) {
        var answer = quizquestions[i].answer;
        var selected = document.querySelector('input[name="question' + i + '"]:checked');
        if (selected !== null) {
            if (selected.value === answer.toLowerCase()) {
                selected.parentNode.style.textDecoration = 'underline';
                selected.parentNode.style.textDecorationColor = 'green';
                correctAnswers.push(answer)
            } else {
                selected.parentNode.style.textDecoration = 'underline';
                selected.parentNode.style.textDecorationColor = 'red';
                var correctOption = selected.parentNode.parentNode.querySelector('input[value="' + answer.toLowerCase() + '"]');
                correctOption.parentNode.style.textDecoration = 'underline';
                correctOption.parentNode.style.textDecorationColor = 'green';
                wrongAnswers.push(answer)
            }
        } else {
            var correctOption = document.querySelector('input[name="question' + i + '"][value="' + answer.toLowerCase() + '"]');
            correctOption.parentNode.style.textDecoration = 'underline';
            correctOption.parentNode.style.textDecorationColor = 'green';
            wrongAnswers.push(answer)
        }
    }
    result.innerHTML = 'Quiz submitted!';
    submitBtn.style.display = 'none';
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
}