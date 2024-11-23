const API_BASE_URL = "https://tldr-server.onrender.com";

// Utility function to extract the current webpage's content
const extractPageText = () => document.body.innerText;

// Utility function to run the provided script on the active tab (most recently used)
const runScriptOnActiveTab = (callback, script) => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0]; // Get active tab (most recently used)

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: script, // Execute provided script
      },
      async (results) => {
        const pageText = results[0].result; // Grab page text from script result
        callback(pageText);
      }
    );
  });
}

// Chrome runtime message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getSummary") {

    runScriptOnActiveTab(async (pageText) => {
      const summary = await summarizeText(pageText, message.question);
      sendResponse({ summary });
    }, extractPageText);

    return true; // Required for async onMessage
  }

  if (message.type === "askQuestion") {
    runScriptOnActiveTab(async (pageText) => {
      const answer = await askQuestion(pageText, message.question);
      sendResponse({ answer });
    }, extractPageText);

    return true; // Required for async onMessage
  }
});

// Function to send a request to the backend to summarize text
async function summarizeText(text) {
  try {
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch summary");
    }

    const data = await response.json();

    return data.summary;
  } catch (error) {
    console.error("Error in summarizeText:", error);
    return "Error summarizing text";
  }
}

// Function to send a request to the backend to answer a question about text
async function askQuestion(text, question) {
  console.log('question asked: ' + question);
  try {
    const response = await fetch(`${API_BASE_URL}/question`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, question }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch answer");
    }

    const data = await response.json();

    return data.summary;
  } catch (error) {
    console.error("Error in askQuestion:", error);
    return "Error answering question";
  }
}
