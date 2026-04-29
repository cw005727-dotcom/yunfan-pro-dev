(() => {
  const products = [];
  const items = Array.from(document.querySelectorAll('li[role="listitem"], .zg-grid-general-faceout, .zg-item-immersion'));
  
  const productItems = items.filter(item => item.querySelector('a'));

  for (let i = 0; i < Math.min(productItems.length, 10); i++) {
    const item = productItems[i];
    
    // Title
    const links = Array.from(item.querySelectorAll('a'));
    const titleLink = links.find(a => a.innerText.length > 20 && !a.innerText.includes('$') && !a.innerText.includes('estrellas')) || links[0];
    const title = titleLink ? titleLink.innerText.trim() : '';
    
    // Price
    let price = 0;
    const priceEl = item.querySelector('.p13n-sc-price, .a-price .a-offscreen, .a-color-price');
    if (priceEl) {
      const priceStr = (priceEl.innerText || priceEl.textContent).trim();
      const priceMatch = priceStr.replace(/[$,]/g, '');
      price = parseFloat(priceMatch) || 0;
    } else {
      const allText = item.innerText;
      const match = allText.match(/\$\s?([0-9,]+\.[0-9]{2})/);
      if (match) {
        price = parseFloat(match[1].replace(/,/g, ''));
      }
    }
    
    // Link
    const link = titleLink ? (titleLink.href.startsWith('http') ? titleLink.href : window.location.origin + titleLink.getAttribute('href')) : '';
    
    // Image - attempt to get original high-res
    const imgEl = item.querySelector('img');
    let image = imgEl ? imgEl.src : '';
    if (image) {
      // Amazon image sizing pattern: filename.extension -> filename.suffix.extension
      // e.g. 613gJ8g29aL._AC_UL900_SR900,600_.jpg -> 613gJ8g29aL.jpg
      image = image.replace(/\._[A-Z0-9,._]+(?=\.[a-z]+$)/, '');
    }
    
    products.push({
      title,
      price,
      currency: "MXN",
      image,
      link
    });
  }
  return products;
})()
