window.onload = () => {
  let counter = 0;
  const int = setInterval(() => {
    counter++;
    if (window.boltInstance) {
      clearInterval(int);
      window.parent.postMessage('bolt', '*');
    }
    // assuming we are on santa
    if (counter > 10) {
      clearInterval(int);
      window.parent.postMessage('santa', '*');
    }
  }, 300);
};
