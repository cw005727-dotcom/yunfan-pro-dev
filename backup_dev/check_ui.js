(async () => {
  const styles = {
    button: {
      ref: 'e6', // "进入工作台 →"
      props: ['backgroundColor', 'borderRadius', 'color', 'fontSize', 'fontWeight', 'height']
    },
    input: {
      ref: 'e3', // "手机号码"
      props: ['backgroundColor', 'borderRadius', 'color', 'fontSize', 'fontWeight', 'height']
    }
  };

  const results = {};
  for (const [key, config] of Object.entries(styles)) {
    const el = document.querySelector(`[data-testid="${config.ref}"]`) || document.querySelector(`button:contains("${config.text}")`);
    // Fallback to searching by text since snapshot refs aren't direct CSS selectors
    // Actually, I can use the text content or target elements directly in the script.
  }

  // Simplified approach: Target by button text/content
  const getStyles = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const s = window.getComputedStyle(el);
    return {
      backgroundColor: s.backgroundColor,
      borderRadius: s.borderRadius,
      color: s.color,
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      height: s.height
    };
  };

  // Streamlit uses specific classes or data-testids. Let's try common ones or text.
  const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('进入工作台'));
  const input = document.querySelector('input[aria-label="手机号码"]');

  return {
    button: btn ? getStyles(`button:nth-child(${Array.from(btn.parentNode.children).indexOf(btn) + 1})`) : 'not found',
    actualBtnStyle: btn ? window.getComputedStyle(btn).backgroundColor : 'not found',
    input: input ? getStyles(`input[aria-label="手机号码"]`) : 'not found'
  };
})()