(async () => {
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

  // Input Box (ref e3)
  const inputEl = document.querySelector('[data-accio-ref="e3"]');
  results.input = getStyle(inputEl);

  // Button (ref e6)
  const buttonEl = document.querySelector('[data-accio-ref="e6"]');
  results.button = getStyle(buttonEl);

  // Left Title
  const titleEl = Array.from(document.querySelectorAll('p, div')).find(el => el.innerText.includes('数据分析，卖家大学'));
  results.leftTitle = getStyle(titleEl);

  // Tabs (ref e1, e2)
  const tab1 = document.querySelector('[data-accio-ref="e1"]');
  const tabsContainer = tab1 ? tab1.parentElement : null;
  results.tabsContainer = getStyle(tabsContainer);
  results.tabSlider = getStyle(tab1); // Often the active one has the slider style

  return results;
})()