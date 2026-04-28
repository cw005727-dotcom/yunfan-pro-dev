(function() {
    const getElStyle = (el) => {
        if (!el) return null;
        const style = window.getComputedStyle(el);
        return {
            backgroundColor: style.backgroundColor,
            borderRadius: style.borderRadius,
            boxShadow: style.boxShadow,
            padding: style.padding,
            border: style.border
        };
    };

    // Find the actual overview cards
    const cards = Array.from(document.querySelectorAll('div')).filter(el => {
        const s = window.getComputedStyle(el);
        return s.boxShadow !== 'none' && el.innerText.includes('区间采集数');
    });
    
    // Find icons
    const icon = document.querySelector('svg') || document.querySelector('.anticon');

    return {
        card: getElStyle(cards[0]),
        icon: icon ? {
            tag: icon.tagName,
            color: window.getComputedStyle(icon).color,
            size: window.getComputedStyle(icon).fontSize || window.getComputedStyle(icon).width
        } : "Not found"
    };
})();