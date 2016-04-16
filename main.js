var observer;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "clicked_browser_action") {
        const speak = () => {
          const comments = document.querySelectorAll('ul.chat-lines li')

          const length = comments.length
          const comment = comments[comments.length - 1].querySelector('.message')
          const regex = /(\<.​* alt="([a-zA-Z]*​)".*\>)/g

          window.speechSynthesis.speak(new SpeechSynthesisUtterance(comment.innerHTML.replace(regex, '$2')))
        }

        if (!observer) {
            observer = new MutationObserver(speak)
            observer.observe(document.querySelector('ul.chat-lines'), {childList: true})
        } else {
            observer.disconnect()
            window.speechSynthesis.cancel()
            observer = null
        }

    }
})
