
// content_script.js

function enhanceElementWithIconAndListener() {
  const targetSpan = document.querySelector('.speaker.amefile.hideOnAmp');

  if (targetSpan) {
    targetSpan.classList.add('with-icon');

    const iconImg = document.createElement('img');
    iconImg.className = 'icon-class';
    iconImg.src = chrome.extension.getURL('images/add_icon.png');

    targetSpan.appendChild(iconImg);

    // Attach the click event listener to the icon img
    iconImg.addEventListener('click', iconClickHandler);
  }
}

function iconClickHandler(event) {
  // Prevent the click event from bubbling up to parent/sibling elements
  event.stopPropagation();
  // Retrieve the value of the "pagetitle" class
  const pageTitleElement = document.querySelector('.pagetitle');
  const pageTitleValue = pageTitleElement ? pageTitleElement.textContent : '';

  console.log('Icon clicked:', pageTitleValue);
  chrome.runtime.sendMessage({
    action: 'clickedSugesstion',
    data: pageTitleValue
  },
  function (response) {
    if (response && response.message) {
      console.log(response.message);
    } else {
      console.log("My Extension log: message is received empty")
    }
  });
}

window.addEventListener('load', enhanceElementWithIconAndListener);