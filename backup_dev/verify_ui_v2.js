(async () => {
  const getStyleByRef = (ref) => {
    const el = document.querySelector(`[data-accio-ref="${ref}"]`);
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
    input: getStyleByRef('e3'),
    button: getStyleByRef('e6'),
    tab1: getStyleByRef('e1'),
    tab2: getStyleByRef('e2'),
  };
  
  // Left side title detection
  const pTags = Array.from(document.querySelectorAll('p'));
  const titleTag = pTags.find(p => p.innerText.includes('数据分析'));
  if (titleTag) {
    const style = window.getComputedStyle(titleTag);
    results.title = {
      text: titleTag.innerText,
      fontWeight: style.fontWeight,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing
    };
  }

  // Tabs container detection
  const tab1 = document.querySelector(`[data-accio-ref="e1"]`);
  if (tab1 && tab1.parentElement) {
    const style = window.getComputedStyle(tab1.parentElement);
    results.tabsContainer = {
      backgroundColor: style.backgroundColor,
      borderRadius: style.borderRadius
    };
  }

  return results;
})()