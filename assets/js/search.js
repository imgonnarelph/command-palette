function ready() {
  const searchInput = document.querySelector('.js-search-input');
  const commandPallet = document.querySelector('.js-command-pallet');
  const commands = []

  searchInput.onfocus = () => {
    commandPallet.classList.toggle('active');
  }  
}

document.addEventListener('DOMContentLoaded', ready);