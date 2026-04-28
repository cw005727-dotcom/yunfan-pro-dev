(() => {
  const findByText = (text, selector = '*') => {
    return Array.from(document.querySelectorAll(selector))
      .find(el => el.innerText && el.innerText.trim().includes(text) && el.children.length === 0);
  };

  const leftText = "数据分析，卖家大学、优化中心";
  const rightText = "欢迎回来";

  const leftEl = Array.from(document.querySelectorAll('p, span, div')).find(el => el.innerText === leftText);
  const rightEl = Array.from(document.querySelectorAll('h2, p, span, div')).find(el => el.innerText === rightText);

  const getMetrics = (el) => {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      text: el.innerText,
      tag: el.tagName,
      top: rect.top,
      height: rect.height,
      centerY: rect.top + rect.height / 2,
      left: rect.left
    };
  };

  // Check for hidden/empty markdown or blocks
  const allBlocks = Array.from(document.querySelectorAll('[data-testid="stVerticalBlock"] > div, .stMarkdown'));
  const suspicious = allBlocks.filter(el => {
    const rect = el.getBoundingClientRect();
    const text = el.innerText.trim();
    // Empty blocks with height
    return rect.height > 0 && text === "" && !el.querySelector('img, button, input, iframe');
  }).map(el => ({
    tag: el.tagName,
    className: el.className,
    height: el.getBoundingClientRect().height,
    top: el.getBoundingClientRect().top
  }));

  return {
    leftTitle: getMetrics(leftEl),
    rightTitle: getMetrics(rightEl),
    suspicious: suspicious,
    window: { width: window.innerWidth, height: window.innerHeight }
  };
})()