(async () => {
  const getStyle = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      borderRadius: style.borderRadius,
      backgroundColor: style.backgroundColor,
      height: style.height,
      fontWeight: style.fontWeight,
      fontSize: style.fontSize,
      letterSpacing: style.letterSpacing,
      lineHeight: style.lineHeight
    };
  };

  const results = {
    input: getStyle('input[type="text"]'),
    button: getStyle('button[type="submit"], button:contains("进入工作台")'),
    // The "button:contains" is not valid CSS, I'll use a better selector based on the snapshot
    submitBtn: getStyle('button:has(p:contains("进入工作台"))') || getStyle('button.w-full'),
    title: getStyle('p:contains("数据分析")')?.parentElement?.parentElement ? getStyle('p:contains("数据分析")')?.parentElement?.parentElement.querySelector('p:nth-child(1)') : null,
    // Finding the left title manually
    leftTitle: Array.from(document.querySelectorAll('p, div')).find(el => el.innerText.includes('数据分析') && el.innerText.includes('卖家大学'))
  };
  
  // Specific check for the left title as per description
  const leftHeading = Array.from(document.querySelectorAll('p')).find(el => el.innerText === '数据分析，卖家大学、');
  const tabsContainer = document.querySelector('div[role="tablist"]') || document.querySelector('button[role="tab"]')?.parentElement;

  return {
    input: results.input,
    submitBtn: getStyle('button:last-of-type') || results.submitBtn, // Fallback
    title: leftHeading ? {
      fontWeight: window.getComputedStyle(leftHeading).fontWeight,
      fontSize: window.getComputedStyle(leftHeading).fontSize,
      lineHeight: window.getComputedStyle(leftHeading).lineHeight,
      letterSpacing: window.getComputedStyle(leftHeading).letterSpacing
    } : 'Title not found',
    tabs: tabsContainer ? {
      backgroundColor: window.getComputedStyle(tabsContainer).backgroundColor,
      borderRadius: window.getComputedStyle(tabsContainer).borderRadius
    } : 'Tabs not found'
  };
})()