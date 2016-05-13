let observer;
let filterWhiteList = []
let usedVoice = null

//Speak out the sentence in selected voice. Console log for goodness and bugfix.
function utter(text, voice) {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.voice = voice
  console.log(utterance)
  window.speechSynthesis.speak(utterance)
}

function getNewestComment() {
  const comments = document.querySelectorAll('ul.chat-lines li')

  const length = comments.length
  return comments[comments.length - 1].querySelector('.message').innerHTML.toLowerCase()
}

function shouldUtter(comment) {
  return filterWhiteList.some(whiteWord => comment.includes(whiteWord))
}

function tryToUtter() {
  const comment = getNewestComment()
  if(shouldUtter(comment)) {
    const commentWithKappas = kappafy(comment)
    utter(commentWithKappas, usedVoice)
  }
}

function kappafy(comment) {
  const kappaUrlToKappaRegex = /(\<.* alt="([a-zA-Z]*)" .*\>*)/gi

  return comment
    .replace(/\\n/g, "")                        // Remove possible newlines
    .trim()
    .replace(kappaUrlToKappaRegex, "$2".trim()) // Parse kappas from urls
    .replace(/\<.*\>/g, "")                     // Remove other possible HTML
    .replace(/WTF/i, "What the funk")
}

//Get settings
chrome.storage.sync.get({keywords: "kappa", voice: "Alex"}, ({keywords, voice}) => {
  filterWhiteList = keywords.split(",")
  window.speechSynthesis.onvoiceschanged = function () {
    usedVoice = window.speechSynthesis.getVoices().find(synthVoice => synthVoice.name === voice)
  }
})

//Set up listeners for changes in options
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if(changes["voice"]) {
    usedVoice = usedVoice = window.speechSynthesis.getVoices().find(synthVoice => synthVoice.name === changes["voice"].newValue)
    utter("New voice PogChamp", usedVoice)
  }

  if(changes["keywords"]) {
    filterWhiteList = changes["keywords"].newValue.split(",")
    utter("New keywords! KappaPride", usedVoice)
  }
})

function toggleObserver() {
  if (!observer) {
    console.log('Starting observer')
    observer = new MutationObserver(tryToUtter)
    observer.observe(document.querySelector('ul.chat-lines'), {childList: true})
  } else {
    console.log('disconnecting')
    observer.disconnect()
    window.speechSynthesis.cancel()
    observer = null
  }
}

function addObserverLink(chatEl) {
  //Boot it uppah
  const linkNode = document.createElement('a')
  linkNode.innerHTML = "HAWKING"
  linkNode.classList.add("button", "glyph-only")
  linkNode.addEventListener("click", toggleObserver)
  document.querySelector(".chat-buttons-container").appendChild(linkNode)
}

const getChatEl = () => new Promise((resolve, reject) => {
  const findChat = (target, observerInstance) => {
    const chatEl = document.querySelector("ul.chat-lines")
    console.log(chatEl)
    if (chatEl) {
      observerInstance.disconnect()
      observerInstance = null
      return resolve(chatEl)
    }
  }
  const observer = new MutationObserver(findChat);
  observer.observe(document.body, {childList: true})
})

getChatEl().then(addObserverLink)

// window.setTimeout(addObserverLink, 5000)


