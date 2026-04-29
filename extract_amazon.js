(() => {
  const products = [];
  const items = document.querySelectorAll('.zg-grid-general-faceout, [id^="p13n-asin-index-"]');
  
  for (let i = 0; i < Math.min(items.length, 10); i++) {
    const item = items[i];
    const titleEl = item.querySelector('.p13n-sc-truncate-desktop-type2, .p13n-sc-css-line-clamp-3, ._cDEBy_p13n-sc-css-line-clamp-3_3t_ch');
    const priceEl = item.querySelector('.p13n-sc-price');
    const linkEl = item.querySelector('a.a-link-normal');
    const imgEl = item.querySelector('img');
    
    const title = titleEl ? titleEl.textContent.trim() : (linkEl ? linkEl.textContent.trim() : '');
    const priceStr = priceEl ? priceEl.textContent.trim() : '';
    const priceMatch = priceStr.replace(/[^0-9.]/g, '');
    const price = parseFloat(priceMatch) || 0;
    const link = linkEl ? (linkEl.href.startsWith('http') ? linkEl.href : window.location.origin + linkEl.getAttribute('href')) : '';
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
