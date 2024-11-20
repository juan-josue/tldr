const extractTextFromPage = () => document.body.innerText;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getSummary") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0]; // Get active tab

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: extractTextFromPage,
        },
        async (results) => {
          const pageText = results[0].result; // Extracted text from the page
          const currentSummary = await summarizeText(pageText); // Get summary
          sendResponse({ summary: currentSummary });
        }
      );
    });

    return true; // Required for async onMessage
  }

  if (message.type === "askQuestion") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0]; // Get active tab

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: extractTextFromPage,
        },
        async (results) => {
          const pageText = results[0].result; // Extracted text from the page
          const answer = await askQuestion(pageText, message.question); // Get answer to question
          sendResponse({ answer: answer });
        }
      );
    });

    return true; // Required for async onMessage
  }
});

async function summarizeText(text) {
  try {
    const response = await fetch("https://tldr-server.onrender.com:3000/summarize", {
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

async function askQuestion(text, question) {
  console.log('question asked: ' + question);
  try {
    const response = await fetch("http://localhost:3000/question", {
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
