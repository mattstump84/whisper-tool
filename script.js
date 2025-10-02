
// 1. Load parables from JSON
let parables = [];
fetch('parables.json')
  .then(response => response.json())
  .then(data => {
    parables = data.parables;
  })
  .catch(error => {
    console.error("Error loading parables:", error);
  });

let whisperReplies = [];

const savedReplies = localStorage.getItem("whisperReplies");
if (savedReplies) {
  whisperReplies = JSON.parse(savedReplies);
}


// 2. Tone slider setup
const toneMap = ["Gentle", "Poetic", "Honest", "Scriptural"];
const toneSlider = document.getElementById("toneSlider");
const toneLabel = document.getElementById("toneLabel");

toneSlider.addEventListener("input", () => {
  toneLabel.innerText = toneMap[toneSlider.value];
});

// 3. Whisper matching logic
function getWhisper() {
  const input = document.getElementById("seekerInput").value.toLowerCase();
  const selectedTone = toneMap[toneSlider.value];
  const output = document.getElementById("whisperOutput");

  // First pass: match both tone and keywords
  for (let parable of parables) {
    const matchesTone = parable.tone === selectedTone;
    const matchesKeyword = parable.keywords.some(keyword => input.includes(keyword));

    if (matchesTone && matchesKeyword) {
      output.innerHTML = `
        <p><strong>${parable.title}</strong></p>
        <p>${parable.text}</p>
        <p><em>${parable.reflection}</em></p>
      `;
      return;
    }
  }

  // Fallback pass: match keywords only, ignore tone
  for (let parable of parables) {
    const matchesKeyword = parable.keywords.some(keyword => input.includes(keyword));

    if (matchesKeyword) {
      output.innerHTML = `
        <p><strong>${parable.title}</strong></p>
        <p>${parable.text}</p>
        <p><em>${parable.reflection}</em></p>
        <p style="font-size: 0.9em; color: #666;"><em>Note: This whisper doesn’t match your selected tone, but it still speaks to your ache.</em></p>
      `;
      return;
    }
  }

  // Final fallback: no keyword match
  output.innerText = "We don’t have a whisper for that yet—but your ache is heard.";
}



function submitWhisperBack() {
  const reply = document.getElementById("seekerReply").value.trim();
  const confirmation = document.getElementById("replyConfirmation");

  if (reply.length === 0) {
    confirmation.innerText = "Please write something before sending.";
    return;
  }

  whisperReplies.push({
    text: reply,
    tone: toneMap[toneSlider.value], // Add this line
    timestamp: new Date().toISOString(),
    mentorResponse: "",
    mentorTone: "",
    status: "pending"
});



  confirmation.innerText = "Thank you. Your whisper has been received.";
  document.getElementById("seekerReply").value = "";

  localStorage.setItem("whisperReplies", JSON.stringify(whisperReplies));

}

function toggleDashboard() {
  const dashboard = document.getElementById("mentorDashboard");
  const replyList = document.getElementById("replyList");

  if (dashboard.style.display === "none") {
    dashboard.style.display = "block";
    replyList.innerHTML = "";

    if (whisperReplies.length === 0) {
      replyList.innerHTML = "<li>No whispers have been received yet.</li>";
    } else {
      for (let i = 0; i < whisperReplies.length; i++) {
        const reply = whisperReplies[i];
        const item = document.createElement("li");

        item.innerHTML = `
          <p><strong>${new Date(reply.timestamp).toLocaleString()}</strong></p>
          <p>${reply.text}</p>
          <p><strong>Tone Requested:</strong> ${reply.tone || "Not specified"}</p>

          <label for="mentorTone-${i}"><strong>Mentor Tone:</strong></label>
          <select id="mentorTone-${i}">
            <option value="Gentle">Gentle</option>
            <option value="Poetic">Poetic</option>
            <option value="Honest">Honest</option>
            <option value="Scriptural">Scriptural</option>
          </select>

          <textarea id="reply-${i}" placeholder="Respond as mentor...">${reply.mentorResponse}</textarea>
          <button onclick="submitMentorReply(${i})">Submit Reply</button>
          <hr />
        `;

        replyList.appendChild(item);
      }
    }
  } else {
    dashboard.style.display = "none";
  }
}


function updateMentorResponse(index, responseText) {
  whisperReplies[index].mentorResponse = responseText;

  localStorage.setItem("whisperReplies", JSON.stringify(whisperReplies));

}

function submitMentorReply(index) {
  const mentorReply = document.querySelector(`#reply-${index}`).value.trim();
  const mentorTone = document.querySelector(`#mentorTone-${index}`).value;

  const whisper = whisperReplies[index];

  if (!mentorReply) {
    alert("Please enter a reply.");
    return;
  }

  if (mentorTone !== whisper.tone) {
    const confirmMismatch = confirm(
      `Seeker requested a ${whisper.tone} tone. Your reply is marked as ${mentorTone}. Would you like to adjust?`
    );
    if (!confirmMismatch) {
      alert("Consider sending a response or letting the whisper rest.");
      return;
    }
  }

  whisper.mentorResponse = mentorReply;
  whisper.mentorTone = mentorTone;
  whisper.status = "replied";

  localStorage.setItem("whisperReplies", JSON.stringify(whisperReplies));
  alert("Reply submitted.");
}

function exportWhispers() {
  const data = localStorage.getItem("whisperReplies");
  if (!data) {
    alert("No whispers to export.");
    return;
  }

  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "whispers_backup.json";
  a.click();

  URL.revokeObjectURL(url);
}

function restoreWhispers() {
  const fileInput = document.getElementById("restoreFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to restore.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const restoredData = JSON.parse(event.target.result);
      if (!Array.isArray(restoredData)) {
        alert("Invalid file format. Expected an array of whispers.");
        return;
      }

      localStorage.setItem("whisperReplies", JSON.stringify(restoredData));
      whisperReplies = restoredData;
      alert("Whispers restored successfully.");
      toggleDashboard(); // Refresh the dashboard view
    } catch (error) {
      alert("Error reading file. Please ensure it's a valid JSON backup.");
    }
  };

  reader.readAsText(file);
}


function clearReplies() {
  localStorage.removeItem("whisperReplies");
  whisperReplies = [];
  document.getElementById("replyList").innerHTML = "";
}
