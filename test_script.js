(() => {
  const allText = document.body.innerText;
  const leftSide = document.querySelector('div[data-testid="stVerticalBlock"] > div:first-child') || document.body; 
  // Streamlit apps often use specific structures. Let's look for the split.
  
  return {
    text: allText.substring(0, 500),
    url: window.location.href
  };
})()