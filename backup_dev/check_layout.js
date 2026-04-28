(async () => {
  const leftSide = document.querySelector('.left-side') || document.querySelector('section:first-child') || document.body.children[0];
  const rightSide = document.querySelector('.right-side') || document.querySelector('section:last-child') || document.body.children[1];
  
  const leftWidth = leftSide?.getBoundingClientRect().width;
  const totalWidth = window.innerWidth;
  const isSplit50 = Math.abs((leftWidth / totalWidth) - 0.5) < 0.1;

  const leftText = leftSide?.innerText || "";
  const targetText = "数据分析，卖家大学、优化中心";
  
  // Find the element containing the target text
  const spans = Array.from(document.querySelectorAll('span, div, p, h1, h2, h3'));
  const targetEl = spans.find(s => s.innerText.includes("数据分析") && s.innerText.includes("卖家大学"));
  
  let isSingleLine = false;
  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    // Crude check: if height is small enough, it's likely one line
    isSingleLine = rect.height < 40; 
  }

  const styles = window.getComputedStyle(leftSide);
  const hasGradient = styles.backgroundImage.includes('gradient');

  return {
    isSplit50,
    leftTextSnippet: leftText.substring(0, 100),
    targetTextFound: !!targetEl,
    isSingleLine,
    hasGradient,
    windowWidth: totalWidth,
    leftWidth
  };
})()