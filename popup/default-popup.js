// // Create a new div element
// var newDiv = document.createElement('div');

// // Set the class of the div element
// newDiv.className = 'my-class';

// // Add some content to the div element
// newDiv.innerHTML = '<h1>Hello, world!</h1><p>This is some example text.</p>';

// // Add the div element to the page
// document.body.appendChild(newDiv);

// Send the "getData" action to the background script
const quizBtn = document.querySelector(".take-quiz");
chrome.runtime.sendMessage({
    action: "getData"
}, function (response) {
    if (response.success) {
        console.log(response);
        const datas = response.data;
        if (datas.dbSize < 10) {
          quizBtn.classList.add('inactive');
        }
        // datas.words.forEach(addItemToList);
        for(var i = 0; i < datas.words.length; i++){
          if (i === datas.words.length - 1){
            addItemToList(datas.words[i], true);
          }
          else {
            addItemToList(datas.words[i], false);
          }
        }
        const numberElement = document.querySelector('.size');
        numberElement.textContent = datas.dbSize;
    } else {
        console.error("Error getting data from database: " + response.error);
    }
});

function addItemToList(item, lastItem=false) {
  const itemList = document.getElementById('item-list');
  const newItem = document.createElement('div');
  newItem.classList.add('item');
  if(lastItem){
    newItem.classList.add('last');
  }

  const itemName = document.createElement('span');
  itemName.classList.add('item-name');
  itemName.textContent = item.word + ':';
  newItem.appendChild(itemName);

  const itemNumber = document.createElement('span');
  itemNumber.classList.add('item-number');
  itemNumber.textContent = item.searchCount;
  newItem.appendChild(itemNumber);

  itemList.appendChild(newItem);
}

function loadPopup(url) {
    var container = document.getElementById('popup-container');
    container.innerHTML = '';
    var iframe = document.createElement('iframe');
    iframe.setAttribute('src', url);
    iframe.setAttribute('frameborder', '0');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    container.appendChild(iframe);
  }

  quizBtn.addEventListener('click', function() {
    loadPopup('quiz.html');
  });

document.addEventListener('DOMContentLoaded', function() {
    var createTabButton = document.querySelector(".take-quiz");
    createTabButton.addEventListener('click', createNewTab);
  });

  function createNewTab() {
    chrome.tabs.create({ url: chrome.extension.getURL('popup/quiz.html') }, 
    function (tab) {
      chrome.tabs.sendMessage(tab.id, { action: "someAction" });
    });
  }

//   document.addEventListener('DOMContentLoaded', function() {
//     var loadPopup2Button = document.getElementById("take-quiz");
//     loadPopup2Button.addEventListener('click', loadPopup2);
//   });
  
//   function loadPopup2() {
//     console.log('inside loadPopup2')
//     chrome.browserAction.setPopup({ popup: 'popup/quiz-popup.html' });
//     window.location.reload();
//   }