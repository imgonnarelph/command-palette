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
