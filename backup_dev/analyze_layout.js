(() => {
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

  const leftTitle = Array.from(document.querySelectorAll('p, span, div')).find(el => el.innerText.includes('数据分析') && el.offsetHeight > 0);
  const rightTitle = Array.from(document.querySelectorAll('h2, p, span, div')).find(el => el.innerText.includes('欢迎回来') && el.offsetHeight > 0);
  
  // Find Streamlit columns
  const columns = Array.from(document.querySelectorAll('[data-testid="column"]'));
  
  // Find potential "squeezing" elements (empty containers with height/padding)
  const squeezing = Array.from(document.querySelectorAll('.stMarkdown, [data-testid="stVerticalBlock"] > div')).filter(el => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const hasVisibleContent = el.innerText.trim().length > 0 || el.querySelector('img, button, input, iframe');
    return rect.height > 0 && !hasVisibleContent;
  }).map(el => ({
    className: el.className,
    height: el.getBoundingClientRect().height,
    top: el.getBoundingClientRect().top
  }));

  return {
    viewport: { width: window.innerWidth, height: window.innerHeight },
    left: getRect(leftTitle),
    right: getRect(rightTitle),
    columns: columns.map(c => getRect(c)),
    squeezing: squeezing
  };
})()