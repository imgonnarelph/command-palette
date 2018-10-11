const input = document.querySelector('.js-search-input')
const completer = document.querySelector('auto-complete')
const container = document.querySelector('#command-pallet')
let results = null

completer.addEventListener('load', function(event) {
  if (!results) results = container.cloneNode(true)
  
  const cloned = results.cloneNode(true)
  for (const item of cloned.querySelectorAll('a')) {
    const disabled = !item.textContent.toLowerCase().match(input.value.toLowerCase())
    if (disabled) item.remove()
  }
  container.innerHTML = cloned.innerHTML
})

document.addEventListener('click', function(event) {
  const target = event.target
  if (target.hash === '#recent-activity') {
    console.log('I tried to stop it')
    // input.focus()
    event.preventDefault()
    event.stopImmediatePropagation()
    setTimeout(function() {
      target.closest('auto-complete').open = true
    }, 0)
    document.querySelector('.js-commands').hidden = true
    document.querySelector('.js-recent-activity').hidden = false
  }
}, true)
