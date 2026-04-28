(() => {
  const inputs = document.querySelectorAll('input');
  const phone = Array.from(inputs).find(i => i.placeholder?.includes('手机号'));
  const pass1 = Array.from(inputs).find(i => i.placeholder?.includes('建议至少 6 位'));
  const pass2 = Array.from(inputs).find(i => i.placeholder?.includes('再次输入密码'));
  
  const setVal = (el, val) => {
    el.focus();
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
    el.blur();
  };

  if (phone) setVal(phone, '13812345678');
  if (pass1) setVal(pass1, 'Accio123!');
  if (pass2) setVal(pass2, 'Accio123!');

  setTimeout(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const subBtn = btns.find(b => b.innerText.includes('立即创建账号'));
    if (subBtn) subBtn.click();
  }, 1000);
})();