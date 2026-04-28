(async () => {
  const getStyle = (el) => {
    if (!el) return null;
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      color: style.color,
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      borderRadius: style.borderRadius,
      padding: style.padding,
      margin: style.margin,
      height: style.height,
      width: style.width,
      border: style.border,
      boxShadow: style.boxShadow,
      letterSpacing: style.letterSpacing,
      lineHeight: style.lineHeight,
      rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left }
    };
  };

  const results = {};

  // Background
  results.body = getStyle(document.body);
  const main = document.querySelector('main');
  results.main = getStyle(main);

  // Left Content
  results.h1 = getStyle(document.querySelector('h1'));
  
  // Tabs (Login/Register)
  const tabsContainer = document.querySelector('div[role="tablist"]') || document.querySelector('.flex.bg-slate-100'); // common patterns
  results.tabsContainer = getStyle(tabsContainer);
  const activeTab = document.querySelector('button[aria-selected="true"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('登录'));
  results.activeTab = getStyle(activeTab);

  // Inputs
  const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[placeholder*="email"]');
  results.input = getStyle(emailInput);
  if (emailInput) {
      emailInput.focus();
      const focusStyle = window.getComputedStyle(emailInput);
      results.inputFocus = {
          border: focusStyle.border,
          boxShadow: focusStyle.boxShadow,
          outline: focusStyle.outline
      };
      emailInput.blur();
  }

  // Primary Button
  const primaryBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('进入工作台'));
  results.primaryBtn = getStyle(primaryBtn);

  // Layout check
  const root = document.querySelector('#root') || document.body;
  results.layout = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight
  };

  return results;
})();
