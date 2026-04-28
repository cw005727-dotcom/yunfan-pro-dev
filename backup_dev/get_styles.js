(async () => {
  const getStyle = (el) => {
    if (!el) return null;
    const style = window.getComputedStyle(el);
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
      display: style.display,
      flex: style.flex,
      justifyContent: style.justifyContent,
      alignItems: style.alignItems,
      gridTemplateColumns: style.gridTemplateColumns
    };
  };

  const results = {};

  // Background/Container
  const container = document.querySelector('main');
  results.container = getStyle(container);
  results.bodyBackground = getStyle(document.body);
  
  // Look for the "stream" effect (often a pseudo-element or a specific div)
  const streamEffect = document.querySelector('.stream-effect, [class*="gradient"], [class*="animate"]');
  results.streamEffect = getStyle(streamEffect);

  // Left Title
  const leftTitle = document.querySelector('h1');
  results.leftTitle = getStyle(leftTitle);

  // Tabs
  const loginTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('登录'));
  const registerTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('注册'));
  results.loginTab = getStyle(loginTab);
  results.registerTab = getStyle(registerTab);

  // Inputs
  const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[placeholder*="email"]');
  results.input = getStyle(emailInput);
  
  // Focus style (trigger focus to see)
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

  // Main Button
  const mainBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('进入工作台'));
  results.mainBtn = getStyle(mainBtn);

  // Layout ratio
  const leftPanel = leftTitle ? leftTitle.closest('div') : null;
  const rightPanel = mainBtn ? mainBtn.closest('div') : null;
  if (leftPanel && rightPanel) {
      results.layout = {
          leftWidth: leftPanel.offsetWidth,
          rightWidth: rightPanel.offsetWidth,
          totalWidth: container.offsetWidth
      };
  }

  return results;
})();
