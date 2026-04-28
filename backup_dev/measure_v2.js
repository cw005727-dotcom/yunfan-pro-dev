(async () => {
  const getRect = (el) => {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
      centerY: rect.top + rect.height / 2
    };
  };

  const leftTitle = Array.from(document.querySelectorAll('p')).find(p => p.textContent.includes('数据分析'));
  const rightTitle = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('欢迎回来'));
  
  const results = {
    left: getRect(leftTitle),
    right: getRect(rightTitle),
    hiddenElements: []
  };

  const containers = document.querySelectorAll('.stMarkdown, .element-container, [data-testid="stVerticalBlock"]');
  containers.forEach(el => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    if (rect.height < 5 || el.innerText.trim() === '' || style.display === 'none' || style.visibility === 'hidden') {
      results.hiddenElements.push({
        tag: el.tagName,
        className: el.className,
        rect: { top: rect.top, height: rect.height },
        isEmpty: el.innerText.trim() === ''
      });
    }
  });

  return results;
})()