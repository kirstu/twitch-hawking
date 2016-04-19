
var observer;
let filterWhiteList = []


chrome.storage.sync.get({keywords: "kappa"}, ({keywords}) => {
  filterWhiteList = keywords.split(",")

})

chrome.storage.onChanged.addListener(function(changes, namespace) {
  filterWhiteList = changes["keywords"].newValue.split(",")
  window.speechSynthesis.speak(new SpeechSynthesisUtterance("New keywords!"))
})


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "clicked_browser_action") {
        const speak = () => {
          const comments = document.querySelectorAll('ul.chat-lines li')

          const length = comments.length
          const comment = comments[comments.length - 1].querySelector('.message').innerHTML
          const regex = /(\<.* alt="([a-zA-Z]*)" .*\>*)/gi

          const commentText = comment
            .replace(/\\n/g, "")
            .trim().replace(regex, (a,b,c) => {
              return c.trim()
            }).replace(/\<.*\>/g, "").replace("***", "fuck").toLowerCase()



          const isOnWhiteList = filterWhiteList.filter(whiteWord => commentText.includes(whiteWord)).length
          console.log(commentText)
          if(isOnWhiteList) {
            console.log(commentText)
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(commentText))
          }
        }

        if (!observer) {
            console.log('Starting observer')
            observer = new MutationObserver(speak)
            observer.observe(document.querySelector('ul.chat-lines'), {childList: true})
        } else {
            console.log('disconnecting')
            observer.disconnect()
            window.speechSynthesis.cancel()
            observer = null
        }

    }
})


