(async () => {
  const result = {};

  // Helper to get computed styles
  const getStyle = (el, props) => {
    const style = window.getComputedStyle(el);
    const res = {};
    props.forEach(p => res[p] = style.getPropertyValue(p));
    return res;
  };

  // 1. Left container
  const leftContainer = document.evaluate("//*[contains(text(), 'MERCADOAI PRO')]/ancestor::div[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue?.parentElement;
  // If not found, try a wider search or look for the layout
  // Often it's a grid or flex container
  const main = document.querySelector('main');
  const panels = main ? Array.from(main.children).filter(c => c.offsetWidth > 100) : [];
  const leftPanel = panels[0];
  const rightPanel = panels[1];

  if (leftPanel) {
    result.leftContainerBackground = getStyle(leftPanel, ['background-image', 'background-color', 'background']).background;
    result.leftPanelWidth = leftPanel.offsetWidth;
  }
  if (rightPanel) {
    result.rightPanelWidth = rightPanel.offsetWidth;
  }

  // 2. Main headers
  const h1 = document.querySelector('h1');
  const h2 = document.querySelector('h2');
  result.h1Styles = h1 ? getStyle(h1, ['font-family', 'font-size', 'color']) : null;
  result.h2Styles = h2 ? getStyle(h2, ['font-family', 'font-size', 'color']) : null;

  // 3. Exact width ratio
  if (leftPanel && rightPanel) {
    const total = leftPanel.offsetWidth + rightPanel.offsetWidth;
    result.widthRatio = `${((leftPanel.offsetWidth / total) * 100).toFixed(1)}% : ${((rightPanel.offsetWidth / total) * 100).toFixed(1)}%`;
  }

  // 4. Cards on the left
  const card = document.querySelector('h3')?.parentElement;
  if (card) {
    result.cardStyles = getStyle(card, ['background-color', 'border', 'padding', 'border-radius', 'backdrop-filter']);
  }

  // 5. Login button
  const loginBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('进入工作台') || b.textContent.includes('登录'));
  if (loginBtn) {
    result.loginBtnStyles = getStyle(loginBtn, ['background-color', 'border-radius']);
    // Hover color: hard to get without triggering hover or inspecting sheets
    // I'll try to find :hover in styleSheets
    let hoverColor = 'not found';
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText && rule.selectorText.includes('button:hover') || (rule.selectorText && rule.selectorText.includes(loginBtn.className.split(' ').join('.')) && rule.selectorText.includes(':hover'))) {
              if (rule.style.backgroundColor) hoverColor = rule.style.backgroundColor;
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
    result.loginBtnStyles.hoverColor = hoverColor;
  }

  // 6. Icons in input fields
  const inputs = document.querySelectorAll('input');
  result.inputIcons = Array.from(inputs).map(input => {
    const parent = input.parentElement;
    const icons = parent.querySelectorAll('svg, i, .icon');
    return {
      placeholder: input.placeholder,
      hasIcons: icons.length > 0,
      iconCount: icons.length,
      iconTags: Array.from(icons).map(i => i.tagName)
    };
  });

  return result;
})();