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

  // Input Box
  const inputEl = document.querySelector('input[placeholder*="手机号"]');
  results.input = getStyle(inputEl);

  // Button
  const buttonEl = Array.from(document.querySelectorAll('button')).find(el => el.innerText.includes('进入工作台'));
  results.button = getStyle(buttonEl);

  // Left Title - looking for 48px / 900
  const allElements = Array.from(document.querySelectorAll('*'));
  const titleEl = allElements.find(el => {
    const style = window.getComputedStyle(el);
    return style.fontSize === '48px' || style.fontWeight === '900' || el.innerText.includes('MERCADOAI');
  });
  results.leftTitle = getStyle(titleEl);
  if (titleEl) results.leftTitle.text = titleEl.innerText;

  // Tabs
  const loginTab = Array.from(document.querySelectorAll('button')).find(el => el.innerText.includes('账号登录'));
  if (loginTab && loginTab.parentElement) {
    results.tabsContainer = getStyle(loginTab.parentElement);
  }

  return results;
})()