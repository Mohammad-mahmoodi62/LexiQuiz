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
    console.log("My extension log: input bar before change is " + inputElement.value)
})

console.log("My Extension log: hello from not background")