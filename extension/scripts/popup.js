// Utility function to create a new message to the chat
const appendChatBubble = (text, textBox, leftOrRight) => {
  const bubble = document.createElement("div");
  bubble.className = `speech-bubble speech-bubble-${leftOrRight}`;
  bubble.textContent = text;
  textBox.appendChild(bubble);
  return bubble;
};

// Utility function to toggle element visibility
const toggleVisibility = (element, makeVisible) => {
  element.style.display = makeVisible ? "block" : "none";
};

document.addEventListener("DOMContentLoaded", () => {
  // HTML page elements
  const loadingText = document.getElementById("loading");
  const summaryText = document.getElementById("summary");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const textBox = document.getElementById("text-box");

  // Show loading and hide summary initially
  toggleVisibility(loadingText, true);
  toggleVisibility(summaryText, false);

  // Send message to background to fetch the summary text
  chrome.runtime.sendMessage({ type: "getSummary" }, (response) => {
    // Hide loading and show returned summary
    toggleVisibility(loadingText, false);
    toggleVisibility(summaryText, true);

    // If summary request successful display summary text, otherwise an error msg
    summaryText.textContent = response?.summary
      ? response.summary
      : "Failed to load summary.";
  });

  // Send a message to background to answer the question in the input box
  function sendQuestionMessage() {
    const question = userInput.value.trim();
    if (!question) return;

    // Wipe user input
    userInput.value = "";

    // Display the user's question in the chat
    appendChatBubble(question, textBox, "right");

    // Show a loading message in the chat
    const loadingAnswerBubble = appendChatBubble(
      "Thinking...",
      textBox,
      "left"
    );

    // Send the question message to the background
    chrome.runtime.sendMessage(
      { type: "askQuestion", question: question },
      (response) => {
        // Response recieved, remove loading message from chat
        loadingAnswerBubble.remove();

        // Display the answer in the chat
        const answerBubbleText = response?.answer
          ? response.answer
          : "No answer available.";
        appendChatBubble(answerBubbleText, textBox, "left");
      }
    );
  }

  // Event listeners, send msg on btn click or enter key up
  sendBtn.addEventListener("click", sendQuestionMessage);
  userInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") sendQuestionMessage();
  });
});
