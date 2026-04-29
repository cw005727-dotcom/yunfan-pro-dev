// Yunfan Collector Content Script
const CONFIG = {
    API_URL: 'http://127.0.0.1:8506/api/price_check/add'
};

function init() {
    console.log('🚢 云帆全网采集助手已启动');
    addCollectButton();
}

function addCollectButton() {
    const btn = document.createElement('div');
    btn.id = 'yunfan-collect-btn';
    btn.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:900; letter-spacing:1px;">YUNFAN</span>
            <span style="opacity:0.6;">|</span>
            <span>一键采集</span>
        </div>
    `;
    
    Object.assign(btn.style, {
        position: 'fixed',
        right: '20px',
        bottom: '100px',
        zIndex: '999999',
        backgroundColor: '#0066FF',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '16px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
        boxShadow: '0 10px 20px rgba(0,102,255,0.3)',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    });

    btn.onmouseover = () => btn.style.transform = 'scale(1.05) translateY(-5px)';
    btn.onmouseout = () => btn.style.transform = 'scale(1) translateY(0)';
    btn.onclick = collectProduct;

    document.body.appendChild(btn);
}

async function collectProduct() {
    const host = window.location.hostname;
    let data = {};

    try {
        if (host.includes('1688.com')) {
            data = extract1688();
        } else if (host.includes('temu.com')) {
            data = extractTemu();
        } else if (host.includes('amazon.com')) {
            data = extractAmazon();
        }

        if (!data.title) throw new Error('未能提取到商品信息');

        const btn = document.getElementById('yunfan-collect-btn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '正在同步...';
        btn.style.backgroundColor = '#666';

        // Add timeout to fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const res = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                btn.innerHTML = '✅ 采集成功';
                btn.style.backgroundColor = '#10B981';
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.backgroundColor = '#0066FF';
                }, 2000);
            } else {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || '服务器响应错误');
            }
        } catch (fetchErr) {
            if (fetchErr.name === 'AbortError') {
                throw new Error('同步超时，请检查后端服务是否启动');
            }
            throw fetchErr;
        }
    } catch (err) {
        console.error('Yunfan Collect Error:', err);
        alert('采集失败: ' + err.message);
        const btn = document.getElementById('yunfan-collect-btn');
        btn.innerHTML = '❌ 采集失败';
        btn.style.backgroundColor = '#EF4444';
        setTimeout(() => {
            btn.innerHTML = '<div style="display:flex; align-items:center; gap:8px;"><span style="font-weight:900; letter-spacing:1px;">YUNFAN</span><span style="opacity:0.6;">|</span><span>一键采集</span></div>';
            btn.style.backgroundColor = '#0066FF';
        }, 3000);
    }
}

function extract1688() {
    console.log('🔍 开始提取 1688 信息...');
    
    // Title
    const title = document.querySelector('.od-static-title, .title-text, h1, .title, [class*="title"]')?.innerText?.trim() || document.title;
    
    // Price - Deep search
    let price = 0;
    const priceSelectors = [
        '.price-text', '.price-number', '.offer-attr-price', 
        '.price-now', '.od-static-price', '.price', 
        '[class*="price-text"]', '[class*="price-num"]'
    ];
    
    for (const sel of priceSelectors) {
        const el = document.querySelector(sel);
        if (el && el.innerText) {
            const val = parseFloat(el.innerText.replace(/[^0-9.]/g, ''));
            if (val > 0) {
                price = val;
                break;
            }
        }
    }
    
    // Fallback for price: search for ¥ in the whole body if still 0
    if (price === 0) {
        const priceItems = Array.from(document.querySelectorAll('span, div')).filter(el => 
            el.innerText && el.innerText.includes('¥') && el.innerText.length < 20
        );
        for (const item of priceItems) {
            const val = parseFloat(item.innerText.replace(/[^0-9.]/g, ''));
            if (val > 0) {
                price = val;
                break;
            }
        }
    }
    
    // Image
    let img = '';
    const imgSelectors = [
        '.prop-img', '.box-img img', '.detail-gallery-img', 
        '.mod-detail-gallery img', '.gallery-img', '.lazyload',
        '[class*="main-image"] img', '[class*="poster"] img'
    ];
    for (const sel of imgSelectors) {
        const el = document.querySelector(sel);
        if (el) {
            const src = el.src || el.getAttribute('data-lazy-src') || el.getAttribute('data-src');
            if (src && !src.includes('base64')) {
                img = src;
                break;
            }
        }
    }
    if (img && img.startsWith('//')) img = 'https:' + img;

    // Weight
    const bodyText = document.body.innerText;
    const weightMatch = bodyText.match(/(?:重量|净重|毛重|Weight|Gross Weight)[:：\s]*([0-9.]+)\s*(g|kg|克|千克|磅|lb|oz|盎司)/i);
    let weight = 0;
    if (weightMatch) {
        weight = parseFloat(weightMatch[1]);
        const unit = weightMatch[2].toLowerCase();
        if (unit.includes('k') || unit.includes('千')) weight *= 1000;
        else if (unit.includes('磅') || unit === 'lb') weight *= 453.59;
        else if (unit.includes('盎司') || unit === 'oz') weight *= 28.35;
    }
    
    const result = {
        title,
        price_cny: price,
        weight_g: Math.round(weight) || 300,
        image_url: img,
        source_url: window.location.href,
        source_platform: '1688'
    };
    console.log('✅ 1688 提取结果:', result);
    return result;
}

function extractTemu() {
    console.log('🔍 开始提取 Temu 信息...');
    const title = document.querySelector('h1, [class*="title"], [class*="productName"]')?.innerText || document.title;
    const priceEl = document.querySelector('._3YyXGExA, [class*="price"], [class*="currentPrice"]');
    const imgEl = document.querySelector('._1_v79Xm1, [class*="mainImage"], [class*="productImage"]');
    
    return {
        title: title.trim(),
        price_cny: parseFloat(priceEl?.innerText?.replace(/[^0-9.]/g, '')) || 0,
        image_url: imgEl?.src,
        source_url: window.location.href,
        source_platform: 'Temu'
    };
}

function extractAmazon() {
    console.log('🔍 开始提取 Amazon 信息...');
    const title = document.querySelector('#productTitle')?.innerText?.trim() || document.title;
    const priceStr = document.querySelector('.a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice, .a-color-price')?.innerText;
    let img = document.querySelector('#landingImage')?.src || document.querySelector('#imgBlkFront')?.src || document.querySelector('.main-image-container img')?.src;

    if (img && img.includes('._AC_')) {
        img = img.replace(/\._AC_.*_\./, '._AC_SL1500_.');
    }

    // Weight
    const weightMatch = document.body.innerText.match(/([0-9.]+)\s*(pounds|ounces|lbs|oz|g|kg)/i);
    let weight = 0;
    if (weightMatch) {
        const val = parseFloat(weightMatch[1]);
        const unit = weightMatch[2].toLowerCase();
        if (unit.includes('pound') || unit === 'lbs') weight = val * 453.59;
        else if (unit.includes('ounce') || unit === 'oz') weight = val * 28.35;
        else if (unit === 'kg') weight = val * 1000;
        else weight = val;
    }
    
    return {
        title,
        price_cny: (parseFloat(priceStr?.replace(/[^0-9.]/g, '')) || 0) * 7.2,
        weight_g: Math.round(weight) || 400,
        image_url: img,
        source_url: window.location.href,
        source_platform: 'Amazon'
    };
}

init();
