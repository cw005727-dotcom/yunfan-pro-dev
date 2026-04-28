(() => {
  const inputs = document.querySelectorAll('input');
  const phone = Array.from(inputs).find(i => i.placeholder?.includes('手机号'));
  const pass = Array.from(inputs).find(i => i.placeholder?.includes('登录密码'));
  
  const setNativeValue = (element, value) => {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  };

  if (phone) setNativeValue(phone, '13800138000');
  if (pass) setNativeValue(pass, 'Accio123!');

  setTimeout(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const subBtn = btns.find(b => b.innerText.includes('进入工作台'));
    if (subBtn) subBtn.click();
  }, 500);
  
  return 'Logging in...';
})()