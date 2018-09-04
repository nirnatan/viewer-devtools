(() => {
  const loginButton = document.querySelector('.loginButton');
  loginButton.addEventListener('click', () => {
    const teamCityUsername = document.getElementById('username').value;
    chrome.storage.local.set({ teamCityUsername });
  });
})();
