// Show the spinner before loading the quiz questions
var spinnerContainer = document.getElementById('spinner-container');
spinnerContainer.style.display = 'block';
let quizquestions = []

chrome.runtime.sendMessage({
    action: "getData2"
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
        prepareQuiz(response.data)
        quizquestions = response.data
        spinnerContainer.style.display = 'none';
    } else {
        console.error("Error getting data from database: " + response.error);
    }
});

function prepareQuiz(quizquestions) {
    // Get the quiz container element
    var quizContainer = document.getElementById('quiz-container');

    // Display quiz questions and options
    for (var i = 0; i < quizquestions.length; i++) {
        var question = quizquestions[i].question.
                        replace(quizquestions[i].answer, "__________");
        var options = quizquestions[i].opt;

        // Create a div for each question
        var questionDiv = document.createElement('div');
        questionDiv.innerHTML = '<p>' + (i+1) + '. ' + question + '</p>';

        // Create radio buttons for each option
        for (var j = 0; j < options.length; j++) {
            var option = options[j];
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
submitBtn.addEventListener('click', function() {
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
	var result = document.getElementById('result');
	for (var i = 0; i < quizquestions.length; i++) {
		var answer = quizquestions[i].answer;
		var selected = document.querySelector('input[name="question' + i + '"]:checked');
		if (selected !== null) {
			if (selected.value === answer) {
				selected.parentNode.style.textDecoration = 'underline';
				selected.parentNode.style.textDecorationColor = 'green';
			} else {
				selected.parentNode.style.textDecoration = 'underline';
				selected.parentNode.style.textDecorationColor = 'red';
				var correctOption = selected.parentNode.parentNode.querySelector('input[value="' + answer + '"]');
				correctOption.parentNode.style.textDecoration = 'underline';
				correctOption.parentNode.style.textDecorationColor = 'green';
			}
		} else {
			var correctOption = document.querySelector('input[name="question' + i + '"][value="' + answer + '"]');
			correctOption.parentNode.style.textDecoration = 'underline';
			correctOption.parentNode.style.textDecorationColor = 'green';
		}
	}
	result.innerHTML = 'Quiz submitted!';
	submitBtn.style.display = 'none';
}

