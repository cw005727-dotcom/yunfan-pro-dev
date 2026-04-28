(() => {
  const inputs = document.querySelectorAll('input');
  const phone = Array.from(inputs).find(i => i.placeholder?.includes('手机号'));
  const pass1 = Array.from(inputs).find(i => i.placeholder?.includes('建议至少 6 位'));
  const pass2 = Array.from(inputs).find(i => i.placeholder?.includes('再次输入密码'));
  
  const setNativeValue = (element, value) => {
    const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
    
    if (valueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else {
      valueSetter.call(element, value);
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
  };

  if (phone) setNativeValue(phone, '13800138000');
  if (pass1) setNativeValue(pass1, 'Accio123!');
  if (pass2) setNativeValue(pass2, 'Accio123!');

  setTimeout(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const subBtn = btns.find(b => b.innerText.includes('立即创建账号'));
    if (subBtn) subBtn.click();
  }, 500);
  
  return 'Filling and clicking...';
})()