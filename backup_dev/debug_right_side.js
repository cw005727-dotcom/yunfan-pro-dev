(() => {
  const elements = Array.from(document.querySelectorAll('*')).filter(el => {
    const rect = el.getBoundingClientRect();
    // Only look at elements on the right side (left > 700)
    return rect.left > 700 && rect.height > 0 && rect.top < 1036;
  }).map(el => ({
    tag: el.tagName,
    className: el.className,
    top: el.getBoundingClientRect().top,
    height: el.getBoundingClientRect().height,
    text: el.innerText.trim().substring(0, 30)
  }));
  
  // Sort by top position
  return elements.sort((a, b) => a.top - b.top);
})()