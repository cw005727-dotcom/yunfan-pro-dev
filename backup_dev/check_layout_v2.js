(() => {
  const cols = document.querySelectorAll('[data-testid="column"]');
  const isSplit50 = cols.length === 2 && Math.abs(cols[0].getBoundingClientRect().width - cols[1].getBoundingClientRect().width) < 50;
  
  const targetText = "数据分析，卖家大学、优化中心";
  const elements = Array.from(document.querySelectorAll('div, span, p, h1, h2, h3'));
  const targetEl = elements.find(el => el.innerText.trim() === targetText);
  
  let isSingleLine = false;
  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    // In Streamlit, fonts are roughly 16-24px. If height is < 40, it's likely one line.
    isSingleLine = rect.height < 45;
  }

  // Check for blue gradient on the left side (cols[0])
  let hasGradient = false;
  let hasGlow = false;
  if (cols[0]) {
    const style = window.getComputedStyle(cols[0]);
    hasGradient = style.backgroundImage.includes('gradient');
    // Glow effects are often box-shadow or filter or background-image patterns
    hasGlow = style.filter.includes('blur') || style.boxShadow !== 'none' || style.backgroundImage.includes('radial-gradient');
  }

  return {
    isSplit50,
    targetTextFound: !!targetEl,
    isSingleLine,
    hasGradient,
    hasGlow,
    colCount: cols.length,
    leftWidth: cols[0]?.getBoundingClientRect().width,
    rightWidth: cols[1]?.getBoundingClientRect().width
  };
})()