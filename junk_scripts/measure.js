(async () => {
  const leftTitle = Array.from(document.querySelectorAll('p')).find(p => p.textContent.includes('数据分析'));
  const rightTitle = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('欢迎回来'));
  
  const results = {
    left: leftTitle ? leftTitle.getBoundingClientRect() : null,
    right: rightTitle ? rightTitle.getBoundingClientRect() : null,
    hiddenElements: []
  };

  // Check for common Streamlit containers that might have padding or be empty
  const containers = document.querySelectorAll('.stMarkdown, .element-container, [data-testid="stVerticalBlock"]');
  containers.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.height === 0 || el.innerText.trim() === '' || window.getComputedStyle(el).display === 'none') {
      results.hiddenElements.push({
        tag: el.tagName,
        className: el.className,
        rect: rect,
        isEmpty: el.innerText.trim() === ''
      });
    }
  });

  // Calculate center points (vertical)
  if (results.left) {
    results.leftCenterY = results.left.top + results.left.height / 2;
  }
  if (results.right) {
    results.rightCenterY = results.right.top + results.right.height / 2;
  }

  return results;
})()