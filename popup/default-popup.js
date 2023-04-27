// Create a new div element
var newDiv = document.createElement('div');

// Set the class of the div element
newDiv.className = 'my-class';

// Add some content to the div element
newDiv.innerHTML = '<h1>Hello, world!</h1><p>This is some example text.</p>';

// Add the div element to the page
document.body.appendChild(newDiv);

// Send the "getData" action to the background script
chrome.runtime.sendMessage({
    action: "getData"
}, function (response) {
    if (response.success) {
        const data = response.data;
        const list = document.createElement("ul");

        // Create a bullet point for each item in the data array
        data.forEach(function (item) {
            const listItem = document.createElement("li");
            listItem.innerText = item.word + " - " + item.searchCount;
            list.appendChild(listItem);
        });

        // Append the list to the document
        document.body.appendChild(list);
    } else {
        console.error("Error getting data from database: " + response.error);
    }
});