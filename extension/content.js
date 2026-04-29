// Yunfan Collector Content Script
const CONFIG = {
    API_URL: 'http://localhost:8506/api/price_check/add'
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
    return {
        title: document.querySelector('.od-static-title')?.innerText || document.title,
        price_cny: parseFloat(document.querySelector('.price-text')?.innerText) || 0,
        image_url: document.querySelector('.prop-img, .box-img img')?.src,
        source_url: window.location.href,
        source_platform: '1688'
    };
}

function extractTemu() {
    return {
        title: document.querySelector('h1')?.innerText || document.title,
        price_cny: parseFloat(document.querySelector('._3YyXGExA')?.innerText?.replace(/[^0-9.]/g, '')) || 0,
        image_url: document.querySelector('._1_v79Xm1')?.src,
        source_url: window.location.href,
        source_platform: 'Temu'
    };
}

function extractAmazon() {
    const priceStr = document.querySelector('.a-price .a-offscreen')?.innerText || 
                     document.querySelector('#priceblock_ourprice')?.innerText || 
                     document.querySelector('#priceblock_dealprice')?.innerText;
    
    return {
        title: document.querySelector('#productTitle')?.innerText?.trim() || document.title,
        price_cny: parseFloat(priceStr?.replace(/[^0-9.]/g, '')) * 7.2 || 0, // Convert USD to CNY approx
        image_url: document.querySelector('#landingImage')?.src || document.querySelector('#imgBlkFront')?.src,
        source_url: window.location.href,
        source_platform: 'Amazon'
    };
}

init();
