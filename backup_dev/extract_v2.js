(() => {
  const result = {};

  const getStyle = (el, props) => {
    if (!el) return null;
    const style = window.getComputedStyle(el);
    const res = {};
    props.forEach(p => res[p] = style.getPropertyValue(p));
    return res;
  };

  // 1. Left container background
  const leftSection = document.querySelector('section.bg-slate-950');
  if (leftSection) {
    const bg = getStyle(leftSection, ['background-image', 'background-color', 'background']);
    // Check for the gradient blobs inside
    const blobs = Array.from(leftSection.querySelectorAll('div[class*="bg-"]')).map(b => ({
      class: b.className,
      style: getStyle(b, ['background-color', 'filter', 'opacity'])
    }));
    result.leftContainer = {
      base: bg,
      blobs: blobs
    };
  }

  // 2. Main headers
  const h1 = document.querySelector('h1');
  const h2 = document.querySelector('h2');
  result.headers = {
    h1: getStyle(h1, ['font-family', 'font-size', 'color', 'font-weight']),
    h2: getStyle(h2, ['font-family', 'font-size', 'color', 'font-weight'])
  };

  // 3. Width ratio
  const mainFlex = document.querySelector('.flex.min-h-screen.w-full');
  if (mainFlex) {
    const children = Array.from(mainFlex.children);
    if (children.length >= 2) {
      const w1 = children[0].offsetWidth;
      const w2 = children[1].offsetWidth;
      const total = w1 + w2;
      result.widthRatio = `${((w1 / total) * 100).toFixed(0)}% : ${((w2 / total) * 100).toFixed(0)}%`;
    }
  }

  // 4. Cards
  const card = document.querySelector('.rounded-2xl.border-white\\/10');
  result.cardStyles = getStyle(card, ['background-color', 'border', 'padding', 'border-radius', 'backdrop-filter']);

  // 5. Login button
  const loginBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('进入工作台') || b.className.includes('bg-primary') || b.className.includes('bg-blue'));
  if (loginBtn) {
    result.loginBtn = {
      base: getStyle(loginBtn, ['background-color', 'border-radius', 'color', 'font-weight']),
      hoverColor: 'checking...'
    };
    // Try to find hover color in styleSheets
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText && rule.selectorText.includes(':hover')) {
              // Match button or its classes
              const classes = loginBtn.className.split(' ').filter(c => c && !c.includes(':'));
              if (classes.some(c => rule.selectorText.includes('.' + c))) {
                 if (rule.style.backgroundColor) result.loginBtn.hoverColor = rule.style.backgroundColor;
              }
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  // 6. Icons
  const inputs = document.querySelectorAll('input');
  result.inputIcons = Array.from(inputs).map(input => {
    const container = input.closest('div');
    const svgs = container ? container.querySelectorAll('svg') : [];
    return {
      name: input.placeholder || input.name,
      hasSvg: svgs.length > 0,
      svgCount: svgs.length
    };
  });

  return result;
})()