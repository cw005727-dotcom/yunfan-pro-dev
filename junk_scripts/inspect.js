(() => {
  const elements = document.querySelectorAll('*');
  const summary = Array.from(elements).slice(0, 100).map(el => ({
    tag: el.tagName,
    class: el.className,
    text: el.innerText?.substring(0, 20)
  }));
  return summary;
})()