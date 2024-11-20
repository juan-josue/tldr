document.addEventListener("DOMContentLoaded", () => {
  const loadingElement = document.getElementById("loading");
  const summaryElement = document.getElementById("summary");

  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const textBox = document.getElementById("text-box");

  // Initially show the loading message
  loadingElement.style.display = "block";
  summaryElement.style.display = "none"; // Hide summary initially

  // Send message to background to fetch the summary
  chrome.runtime.sendMessage({ type: "getSummary" }, (response) => {
    if (response && response.summary) {
      // Hide the loading message and show the summary
      loadingElement.style.display = "none";
      summaryElement.style.display = "block";
      summaryElement.textContent = response.summary;
    } else {
      // Handle case where summary is unavailable
      loadingElement.style.display = "none";
      summaryElement.style.display = "block";
      summaryElement.textContent = "Failed to load summary.";
    }
  });

  // Send a message to background to asnwer the question in the input box
  function sendQuestionMessage() {
    const question = userInput.value.trim();
    if (question) {
      // Clear the input field
      userInput.value = "";

      // Display the user's question in a chat bubble
      const userBubble = document.createElement("div");
      userBubble.className = "speech-bubble speech-bubble-right";
      userBubble.textContent = question;
      textBox.appendChild(userBubble);

      // Show loading bubble for answer
      const loadingAnswerBubble = document.createElement("div");
      loadingAnswerBubble.className = "speech-bubble speech-bubble-left";
      loadingAnswerBubble.textContent = "Thinking...";
      textBox.appendChild(loadingAnswerBubble);

      // Send the question to the background script
      chrome.runtime.sendMessage(
        { type: "askQuestion", question: question },
        (response) => {
          // Remove loading bubble
          loadingAnswerBubble.remove();

          // Display the answer in a new bubble
          const answerBubble = document.createElement("div");
          answerBubble.className = "speech-bubble speech-bubble-left";
          answerBubble.textContent =
            response && response.answer
              ? response.answer
              : "No answer available.";
          textBox.appendChild(answerBubble);
        }
      );
    }
  }

  sendBtn.addEventListener("click", sendQuestionMessage);
  userInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      sendQuestionMessage();
    }
  });
});
