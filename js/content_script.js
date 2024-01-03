
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
  }, function (response) {
    if (response && response.message) {
      console.log('message is:', response.message);
      showInfoPopup(response.message);
    } else {
      console.log("My Extension log: message is received empty");
    }
  });
}

function showInfoPopup(message) {
  const popup = document.createElement('div');
  popup.className = 'info-popup';
  popup.textContent = message.message;

  // Style the popup (customize as needed)
  popup.style.position = 'fixed';
  popup.style.bottom = '20px';
  popup.style.left = '50%';
  popup.style.width = '90%';
  popup.style.transform = 'translateX(-50%)';
  popup.style.padding = '10px';
  popup.style.paddingLeft = '25px';
  popup.style.fontSize = '18px'
  popup.style.backgroundColor = '#c40094'; // Green background color
  popup.style.color = 'white';
  popup.style.borderRadius = '5px';
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 0.5s';

  document.body.appendChild(popup);

  // Trigger reflow to enable the transition
  popup.offsetWidth;

  // Set opacity to 1 for fade-in effect
  popup.style.opacity = '1';

  // Remove the popup after 4 seconds (adjust as needed)
  setTimeout(() => {
    popup.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(popup);
    }, 500); // Fade-out transition duration
  }, 4000); // Display duration
}


window.addEventListener('load', enhanceElementWithIconAndListener);