(async () => {
  const getStyle = (el) => {
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      fontSize: style.fontSize,
      color: style.color,
      backgroundColor: style.backgroundColor
    };
  };

  const results = {
    h1: getStyle(document.querySelector('h1')),
    button: getStyle(document.querySelector('button'))
  };

  return { __result: results };
})();
