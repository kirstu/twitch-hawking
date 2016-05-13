// Saves options to chrome.storage.sync.
function save_options() {
  var keywords = document.getElementById('keywords').value.trim();
  var voice = document.getElementById("voice").value
  console.log(voice)
  chrome.storage.sync.set({
    keywords: keywords,
    voice: voice,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    keywords: "kappa"
  }, function({keywords}) {
    document.getElementById("keywords").value = keywords

  });
}

document.addEventListener('DOMContentLoaded', restore_options);

window.speechSynthesis.onvoiceschanged = () => {
  const options = window.speechSynthesis.getVoices().map(voice => `<option value="${voice.name}">${voice.name}</option>`).join("")
  document.getElementById("voice").innerHTML = options
}
document.getElementById('save').addEventListener('click',
    save_options);




