var observer;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "clicked_browser_action") {
      var speak = function() {
        var comments = document.querySelectorAll('ul.chat-lines li')

        var length = comments.length
        var comment = comments[comments.length - 1].querySelector('.message')
        var regex = /(\<.​* alt="([a-zA-Z]*​)".*\>)/g

        window.speechSynthesis.speak(new SpeechSynthesisUtterance(comment.innerHTML.replace(regex, '$2')))
      }

      var observer = new MutationObserver(speak)

      observer.observe(document.querySelector('ul.chat-lines'), {childList: true})
    }
})

