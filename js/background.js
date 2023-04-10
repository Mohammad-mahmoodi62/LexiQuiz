let db = null;

console.log("My Extension log: hello from background");

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.query({
    currentWindow: true,
    active: true
  }, function (tabs) {
    check_to_init_close_DB(tabs[0].url);
  });
});

function check_to_init_close_DB(currentTab) {
  if (currentTab.includes("https://www.ldoceonline.com/") && db === null) {
    initDB();
  } else if (!currentTab.includes("https://www.ldoceonline.com/") && db !== null) {
    closeDB();
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("My Extension log: received a message");
  if (request.action === "enteredKey") {
    addWordToDB(request.data);

    sendResponse({
      message: "Data saved successfully"
    });
  } else if (request.action === "clickedSugesstion") {
    if (request.data.length !== 0) {
      addWordToDB(request.data);

      sendResponse({
        message: "Data saved successfully"
      });
    }
  }
});

window.addEventListener("unload", function () {
  console.log("My Extension log: Background script unloaded");
});

function initDB() {
  const request = window.indexedDB.open("LexiDB", 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    const savedWordStore = db.createObjectStore("savedWord", {
      keyPath: "word"
    });

    savedWordStore.createIndex("searchCount", "searchCount", {
      unique: false
    });
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    console.log("Database initialized successfully");
  };

  request.onerror = (event) => {
    console.error("My Extension log: Error initializing database", event.target.error);
  };
}

function closeDB() {
  db.close();
  db = null;
  console.log("My Extension log: Database closed successfully");
}

function addWordToDB(word) {
  const transaction = db.transaction(["savedWord"], "readwrite");
  const objectStore = transaction.objectStore("savedWord");

  const getRequest = objectStore.get(word);

  getRequest.onsuccess = function (event) {
    const savedWordObj = event.target.result;

    if (savedWordObj) {
      savedWordObj.searchCount = savedWordObj.searchCount + 1;

      const addRequest = objectStore.put(savedWordObj);

      addRequest.onsuccess = function (event) {
        console.log("My Extension log: Data added successfully");
      };
      addRequest.onerror = function (event) {
        console.error("My Extension log: Failed to update data:", event.target.error);
      };
    } else {
      const data = {
        searchCount: 1,
        word: word
      };

      const addRequest = objectStore.add(data);

      addRequest.onsuccess = () => {
        console.log("My Extension log: Data added successfully");
      };

      addRequest.onerror = (event) => {
        console.error("My Extension log: Error adding data", event.target.error);
      };
    }
  };

  getRequest.onerror = function (error) {
    console.error("My Extension log: Failed to get data:", event.target.error);
  };
}

function deleteWordFromDB(word) {
  const transaction = db.transaction(["savedWord"], "readwrite");
  const objectStore = transaction.objectStore("savedWord");

  const deleteRequest = objectStore.delete(word);

  deleteRequest.onsuccess = (event) => {
    console.log("My Extension log: Data deleted successfully");
  };

  deleteRequest.onerror = (event) => {
    console.error("My Extension log: Error deleting data", event.target.error);
  };
}