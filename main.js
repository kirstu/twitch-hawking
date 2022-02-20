const CHAT_MESSAGE_CONTAINER_SELECTOR = '.chat-line__message-container'
const CHAT_INPUT_BUTTONS_CONTAINER_SELECTOR = '.chat-input__buttons-container'
const CHAT_CONTAINER_SELECTOR = '.chat-scrollable-area__message-container'
const CHAT_MESSAGES_SELECTOR = `${CHAT_CONTAINER_SELECTOR}`

let observer;
let filterWhiteList = []
let usedVoice = null

// {
//   author,
//   rawText,
//   entities
// }

const authors = new Map();

const narrator = {
  voice: window.speechSynthesis.getVoices().find(voice => voice.name === 'Google Uk English Male'),
  pitch: 0.85,
  rate: 0.9,
};

const INTRODUCTIONS = [
  (a) => `${a} emerges from the brickwork`,
  (a) => `We have a new contender, ${a}`,
  (a) => `Hello there ${a}!`,
  (a) => `From the depths, a new voice. Welcome ${a}`,
  (a) => `Perhaps ${a} has fresh ideas?`,
  (a) => `All hail, ${a}!`,
  (a) => `I would not have let ${a} in here. But welcome.`,
  (a) => `Attention! ${a}, the ambassador to communist china has arrived`,
  (a) => `Hello officer ${a}`,
]

const SCOLDINGS = [
  (a) => `${a} throws a tantrum`,
  (a) => `Hold your horses ${a}`,
  (a) => `Do not act like you own the city ${a}`,
  (a) => `You ain't no big shot ${a}`,
  (a) => `${a} keeps mumbling`,
  (a) => `${a} is stuck in a loop`,
  (a) => `Silence, wench!`,
]

const clamp = (num, min, max) => Math.round(Math.max(max, Math.min(num, min) * 10) / 10)

const getAuthorForName = (authorName) => {
  if(authors.has(authorName)) {
    return authors.get(authorName);
  }

  const voices = window.speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('en') || voice.lang.startsWith('fi'));

  const voice = voices[authors.size % voices.length];
  const pitch = Math.random() * 100 % 2
  const rate = clamp(Math.random() * 100 % 2, 0.7, 1.2)
  
  const author = {
    name: authorName,
    voice,
    pitch,
    rate,
  }

  authors.set(authorName, author);

  // const introductionComment = INTRODUCTIONS[authors.size % INTRODUCTIONS.length](authorName);

  // utter({
  //   author: narrator,
  //   rawText: introductionComment
  // })

  return author;
}

const scold = (comment) => {
  const scolding = SCOLDINGS[Math.floor(Math.random() * 100) % SCOLDINGS.length];
  return utter({
    rawText: scolding(comment.author.name),
    author: narrator,
  });
}

const COMMENT_AUTHOR_SELECTOR = '.chat-author__display-name';
const COMMENT_MESSAGE_BODY_SELECTOR = '[data-test-selector="chat-line-message-body"]'

const extractTextFromCommentElement = (commentElement) => {
  if(commentElement.classList.contains('text-fragment')) {
    return commentElement.innerText;
  }

  if(commentElement.classList.contains('chat-line__message--emote-button')) {
    return commentElement.querySelector('img').alt;
  }

  if(commentElement.classList.contains('mention-fragment')) {
    return commentElement.innerText.substr(1)
  }

  return ''
}


const createCommentFromElement = (commentContainer) => {

  const authorName = commentContainer.querySelector(COMMENT_AUTHOR_SELECTOR).innerHTML;
  const messageBody = commentContainer.querySelector(COMMENT_MESSAGE_BODY_SELECTOR);
  const messageElements = Array.from(messageBody.childNodes)
  const rawText = messageElements.map(extractTextFromCommentElement).join(' ').toLocaleLowerCase();

  const author = getAuthorForName(authorName);
  return {
    author,
    rawText
  }
}

//Speak out the sentence in selected voice. Console log for goodness and bugfix.
function utter(comment) {
  const utterance = new SpeechSynthesisUtterance(comment.rawText)
  utterance.voice = comment.author.voice;
  utterance.pitch = comment.author.pitch ?? 1;
  utterance.rate = comment.author.rate ?? 1; 
  window.speechSynthesis.speak(utterance)
}

function getNewestComment() {
  const comments = document.querySelectorAll(CHAT_MESSAGE_CONTAINER_SELECTOR)
  const length = comments.length
  
  return comments[comments.length -1]
  return comments[comments.length - 1].innerHTML.toLowerCase()
}

function shouldUtter(comment) {
  return comment.rawText && comment.rawText.length > 50 || (Math.random() * 100) > 90

  // return filterWhiteList.some(whiteWord => comment.includes(whiteWord))
}

const BOT_NAMES = [
  'Moobot',
  'FACEIT TV',
];

const shouldBeScolded = (comment) => {

  if(BOT_NAMES.includes(comment.author.name)) {
    return true;
  }

  const tokens = comment.rawText.split(' ');
  const uniqueTokens = Array.from(new Set(tokens))
  const uniqueTokensRatio = uniqueTokens.length / tokens.length;
  const uniqueTokensRatioThreshold = 0.4;

  if(tokens.length > 10 && uniqueTokensRatio < uniqueTokensRatioThreshold) {
    return true;
  }

  return false;
}

function tryToUtter() {
  const comment = getNewestComment()

  const utteranceComment = createCommentFromElement(comment);

  if(shouldBeScolded(utteranceComment)) {
    scold(utteranceComment);
    return;
  }
  
  if(shouldUtter(utteranceComment)) {
    utter(utteranceComment)
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
    observer.observe(document.querySelector(CHAT_CONTAINER_SELECTOR), {childList: true})
    utter({
      rawText: 'And thus the story unfolds',
      author: narrator,
    });
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
  document.querySelector(CHAT_INPUT_BUTTONS_CONTAINER_SELECTOR).appendChild(linkNode)
}

const getChatEl = () => new Promise((resolve, reject) => {
  const findChat = (target, observerInstance) => {
    const chatEl = document.querySelector(CHAT_CONTAINER_SELECTOR)
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


