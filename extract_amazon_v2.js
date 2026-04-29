(() => {
  const products = [];
  const items = Array.from(document.querySelectorAll('li[role="listitem"], .zg-grid-general-faceout, .zg-item-immersion'));
  
  // Filter out items that are not actual products (if any)
  const productItems = items.filter(item => item.querySelector('a'));

  for (let i = 0; i < Math.min(productItems.length, 10); i++) {
    const item = productItems[i];
    
    // Title: first link that is long enough or doesn't look like a price/rating
    const links = Array.from(item.querySelectorAll('a'));
    const titleLink = links.find(a => a.innerText.length > 20 && !a.innerText.includes('$') && !a.innerText.includes('estrellas')) || links[0];
    const title = titleLink ? titleLink.innerText.trim() : '';
    
    // Price: link or span containing $
    const priceEl = Array.from(item.querySelectorAll('span, a')).find(el => el.innerText.includes('$'));
    const priceStr = priceEl ? priceEl.innerText.trim() : '';
    const priceMatch = priceStr.replace(/[^0-9.]/g, '');
    const price = parseFloat(priceMatch) || 0;
    
    // Link
    const link = titleLink ? (titleLink.href.startsWith('http') ? titleLink.href : window.location.origin + titleLink.getAttribute('href')) : '';
    
    // Image
    const imgEl = item.querySelector('img');
    const image = imgEl ? imgEl.src : '';
    
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
