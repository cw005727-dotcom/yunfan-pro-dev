(() => {
  const results = {};
  
  // Find background elements more robustly
  const divs = Array.from(document.querySelectorAll('div'));
  
  // Find the dark blue one
  const darkBlueEl = divs.find(el => window.getComputedStyle(el).backgroundColor === 'rgb(2, 6, 23)');
  if (darkBlueEl) {
    results.leftBackground = '#020617';
    // Check text inside it
    const textEl = darkBlueEl.querySelector('p, span, h1, h2');
    if (textEl) {
      results.leftTextColor = window.getComputedStyle(textEl).color;
    }
  }

  // Find the white one (usually the one next to it or the main body)
  const whiteEl = divs.find(el => {
    const bg = window.getComputedStyle(el).backgroundColor;
    return bg === 'rgb(255, 255, 255)' || bg === 'white';
  });
  if (whiteEl) {
    results.rightBackground = 'white';
  }

  return results;
})()