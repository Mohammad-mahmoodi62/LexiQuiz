// Select the input element of the search bar
const inputElement = document.getElementsByClassName('search_input')[0];

// chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
//     console.log("My Extension log: Navigation about to occur:", details.url);
//   });

window.addEventListener('beforeunload', function (event) {
  chrome.runtime.sendMessage({
      action: 'clickedSugesstion',
      data: inputElement.value
    },
    function (response) {
      if (response && response.message) {
        console.log(response.message);
      } else {
        console.log("My Extension log: message is received empty")
      }
    });
})


// Add an event listener to the input element
inputElement.addEventListener('keydown', function (event) {
  // If the user has pressed the Enter key (keyCode 13)
  if (event.keyCode === 13) {
    console.log("My Extension log: enter key has been pressed")
    // Get the text from the input element
    const searchText = inputElement.value;
    // send the entered message to background
    chrome.runtime.sendMessage({
        action: 'enteredKey',
        data: searchText
      },
      function (response) {
        if (response && response.message) {
          console.log(response.message);
        } else {
          console.log("My Extension log: message is received empty")
        }
      });
  }
});

console.log("My Extension log: hello from not background")