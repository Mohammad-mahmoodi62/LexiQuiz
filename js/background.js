let db = null;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("My Extension log: received a message and the action is " + request.action +
        "and the sender is " + sender.tab);
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
    } else if (request.action === "getData") {
        getFromDB().then((data) => {
            sendResponse({
                success: true,
                data: data
            });
        }).catch((error) => {
            sendResponse({
                success: false,
                error: error.message
            });
        });
        // Tell Chrome that we will send the response asynchronously
        return true;
    } 
    else if (request.action === "getData2" && sender.tab) {
        console.log('responding')
        // sendResponse('kire khar')
        getFromDB2().then((data) => {
            sendResponse({
                success: true,
                data: data
            });
        }).catch((error) => {
            sendResponse({
                success: false,
                error: error.message
            });
        });
        // Tell Chrome that we will send the response asynchronously
        return true;
    } else if (request.action === "submitQuiz" && sender.tab) {
        updateDBafterAnswer(request.data)
        sendResponse("hello my friend")
    }
});

window.addEventListener("unload", function () {
    console.log("My Extension log: Background script unloaded");
});

function addWordToDB(word) {
    word = word.trimRight()
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
        console.log("Database initialized successfully");
        db = event.target.result;
        addingToDB(word)
    };

    request.onerror = (event) => {
        console.error("My Extension log: Error initializing database", event.target.error);
    };
}

function addingToDB(word) {
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
                db.close();
                db = null;
                console.log("My Extension log: Database closed successfully");
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
                db.close();
                db = null;
                console.log("My Extension log: Database closed successfully");
            };

            addRequest.onerror = (event) => {
                db.close();
                db = null;
                console.error("My Extension log: Error adding data", event.target.error);
            };
        }
    };

    getRequest.onerror = function (event) {
        db.close();
        db = null;
        console.error("My Extension log: Failed to get data:", event.target.error);
    };
}

function deleteWordFromDB(word) {
    const request = window.indexedDB.open("LexiDB", 1);
    request.onsuccess = (event) => {
        console.log("Database initialized successfully");
        db = event.target.result;
        const transaction = db.transaction(["savedWord"], "readwrite");
        const objectStore = transaction.objectStore("savedWord");

        const deleteRequest = objectStore.delete(word);

        deleteRequest.onsuccess = (event) => {
            console.log("My Extension log: ${word} deleted successfully");
            db.close()
            console.log("Database closed successfully");
            db = null
        };

        deleteRequest.onerror = (event) => {
            console.error("My Extension log: Error deleting data", event.target.error);
            db.close()
            console.log("Database closed successfully");
            db = null
        };
    }
}

function getFromDB() {
    return new Promise((resolve, reject) => {
        // Open the database
        const request = window.indexedDB.open("LexiDB", 1);

        // Handle database open success
        request.onsuccess = (event) => {
            db = event.target.result;

            // Open a read-only transaction on the savedWord object store
            const transaction = db.transaction("savedWord", "readonly");
            const objectStore = transaction.objectStore("savedWord");

            // Get all objects in the object store
            const getAllRequest = objectStore.getAll();

            // Handle getAll success
            getAllRequest.onsuccess = (event) => {
                // Get the first 20 items in the array
                const data = event.target.result.slice(0, 20);

                // Resolve the promise with the data
                resolve(data);
                db.close()
                db = null
            };

            // Handle getAll error
            getAllRequest.onerror = (event) => {
                db.close()
                db = null
                reject(event.target.error);
            };
        };

        // Handle database open error
        request.onerror = (event) => {
            db.close()
            db = null
            reject(event.target.error);
        };
    });
}

async function getExampleForQuiz(word) {
    let examples = [];

    try {
        const response = await fetch("https://www.ldoceonline.com/dictionary/" + word);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const elements = doc.querySelectorAll(".cexa1g1.exa");

        elements.forEach(element => {
            examples.push(element.textContent);
        });

        // Generate a random index into the array
        let randomIndex = Math.floor(Math.random() * examples.length);

        // Select the item at the random index
        return examples[randomIndex];
    } catch (error) {
        throw error;
    }
}

function shuffleArray(array) {
    array.sort(() => Math.random() - 0.5);
    return array;
}

async function getFromDB2() {
    return new Promise((resolve, reject) => {
        // Open the database
        const request = window.indexedDB.open("LexiDB", 1);

        // Handle database open success
        request.onsuccess = (event) => {
            db = event.target.result;

            // Open a read-only transaction on the savedWord object store
            const transaction = db.transaction("savedWord", "readonly");
            const objectStore = transaction.objectStore("savedWord");

            // Get all objects in the object store
            const getAllRequest = objectStore.getAll();

            // Handle getAll success
            getAllRequest.onsuccess = async (event) => {
                // Get the first 20 items in the array
                let data = event.target.result
                shuffleArray(data)
                let dataBaseSize = data.length

                let quizArr = data.slice(0, 20)
                shuffleArray(data)
                let quizOpt = data.slice(0, 20)
                db.close()
                db = null
                let quizQuestions = []

                try {
                    // Map each word to a promise that resolves with its example
                    const examplesArr = await Promise.all(quizArr.map(async (word) => {
                        const example = await getExampleForQuiz(word.word);
                        return example;
                    }));

                    for (let i = 0; i < 20; i++) {
                        const question = {
                            question: examplesArr[i],
                            answer: quizArr[i].word,
                            opt: quizOpt.slice(0, 3).map(item => item.word)
                        }
                        question.opt.push(question.answer)
                        shuffleArray(question.opt)
                        quizQuestions.push(question)
                        shuffleArray(quizOpt)
                    }

                    // Resolve the promise with the data
                    const neededInfo = {
                        dbSize: dataBaseSize,
                        quiz: quizQuestions
                    }
                    resolve(neededInfo);
                } catch (error) {
                    console.error(error);
                    reject(error);
                }
            };

            // Handle getAll error
            getAllRequest.onerror = (event) => {
                db.close()
                db = null
                reject(event.target.error);
            };
        };

        // Handle database open error
        request.onerror = (event) => {
            db.close()
            db = null
            reject(event.target.error);
        };
    });
}
// getFromDB2().then(result => {
//   console.log(result)
// })

// data = {dbSize, correctAnswers}
function updateDBafterAnswer(data) {
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
        console.log("Database initialized successfully");
        db = event.target.result;
        checkAnswers(data)
    };

    request.onerror = (event) => {
        console.error("My Extension log: Error initializing database", event.target.error);
    };
}

function checkAnswers(data) {
    const transaction = db.transaction(["savedWord"], "readwrite");
    const objectStore = transaction.objectStore("savedWord");

    for (const word of data.correctAnswers) {

        const getRequest = objectStore.get(word);

        getRequest.onsuccess = function (event) {
            const savedWordObj = event.target.result;
            if (savedWordObj.searchCount === 0 && data.dbSize > 20) {
                const deleteRequest = objectStore.delete(word);

                deleteRequest.onsuccess = (event) => {
                    console.log("My Extension log: Data deleted successfully");
                };

                deleteRequest.onerror = (event) => {
                    console.error("My Extension log: Error deleting data",
                        event.target.error);
                };
            } else if (savedWordObj.searchCount !== 0) {
                savedWordObj.searchCount--;
                const addRequest = objectStore.put(savedWordObj);

                addRequest.onsuccess = function (event) {
                    console.log("My Extension log: Data added successfully");
                };
                addRequest.onerror = function (event) {
                    console.error("My Extension log: Failed to update data:",
                        event.target.error);
                };
            }
        };

        getRequest.onerror = function (event) {
            console.error("My Extension log: Failed to get data:",
                event.target.error);
        };
    };
    db.close();
    db = null;
}