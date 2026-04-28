(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('进入工作台'));
  if (!btn) return 'button not found';
  
  const styles = window.getComputedStyle(btn);
  const hoverStyles = {};
  
  // Create a dummy element to check hover if possible or look at sheets
  let hoverBg = 'not found';
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText && rule.selectorText.includes(':hover')) {
          if (btn.matches(rule.selectorText.replace(':hover', ''))) {
             if (rule.style.backgroundColor) hoverBg = rule.style.backgroundColor;
          }
        }
      }
    } catch (e) {}
  }

  return {
    text: btn.innerText,
    className: btn.className,
    background: styles.backgroundColor,
    borderRadius: styles.borderRadius,
    hoverBackground: hoverBg
  };
})()