(() => {
  const elements = Array.from(document.querySelectorAll('h1, h2, h3, p, span, div[data-testid="stMarkdownContainer"]')).map(el => {
    const rect = el.getBoundingClientRect();
    return {
      text: el.innerText.substring(0, 50),
      tag: el.tagName,
      top: rect.top,
      height: rect.height,
      centerY: rect.top + rect.height / 2,
      testid: el.getAttribute('data-testid')
    };
  });
  return elements.filter(e => e.height > 0 && e.text.trim() !== '');
})()