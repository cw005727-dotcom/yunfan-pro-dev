(() => {
  const getStyle = (el) => {
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      borderRadius: style.borderRadius,
      backgroundColor: style.backgroundColor,
      color: style.color,
      height: style.height,
      fontWeight: style.fontWeight,
      fontSize: style.fontSize,
      letterSpacing: style.letterSpacing,
      lineHeight: style.lineHeight,
      display: style.display
    };
  };

  const results = {};

  // Left Title
  const titleEl = document.querySelector('.brand-h1');
  results.leftTitle = getStyle(titleEl);

  // Tabs
  const tabContainer = document.querySelector('.tab-container');
  results.tabsContainer = getStyle(tabContainer);
  
  const tabActive = document.querySelector('.tab-active');
  results.tabActive = getStyle(tabActive);

  return results;
})()