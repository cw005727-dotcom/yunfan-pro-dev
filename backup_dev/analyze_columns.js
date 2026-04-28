(() => {
  const results = {
    leftColumn: [],
    rightColumn: [],
    emptyBlocks: []
  };

  const columns = document.querySelectorAll('[data-testid="column"]');
  columns.forEach((col, index) => {
    const children = Array.from(col.querySelectorAll('[data-testid="stVerticalBlock"] > div, .stMarkdown, .element-container'));
    const side = index === 0 ? 'leftColumn' : 'rightColumn';
    
    children.forEach(child => {
      const rect = child.getBoundingClientRect();
      const text = child.innerText.trim();
      const isVisible = rect.height > 0 && rect.width > 0;
      
      if (isVisible) {
        results[side].push({
          tag: child.tagName,
          text: text.substring(0, 30),
          top: rect.top,
          height: rect.height,
          isEmpty: text === "" && !child.querySelector('img, button, input, iframe')
        });
      }
    });
  });

  return results;
})()