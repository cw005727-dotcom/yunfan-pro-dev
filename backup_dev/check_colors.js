(() => {
  const leftSide = document.querySelector('[data-testid="stSidebar"]') || document.querySelector('section[data-testid="stSidebar"]');
  const rightSide = document.querySelector('.main') || document.querySelector('section.main');
  
  // Streamlit apps often have specific structure. Let's look for the columns or main containers.
  // The snapshot suggests a split layout.
  
  const results = {
    leftBackground: 'Not found',
    rightBackground: 'Not found',
    leftTextColor: 'Not found',
    loginButtonVisible: !!document.querySelector('button[kind="secondary"] p, button[kind="primary"] p'), // Generic check based on snapshot
  };

  // Inspecting all elements to find the backgrounds if standard ones aren't obvious
  const allElements = document.querySelectorAll('*');
  let leftElement, rightElement;

  // Often in split layouts, they use stHorizontalBlock (columns)
  const columns = document.querySelectorAll('[data-testid="column"]');
  if (columns.length >= 2) {
    leftElement = columns[0];
    rightElement = columns[1];
  }

  if (leftElement) {
    results.leftBackground = window.getComputedStyle(leftElement).backgroundColor;
    const leftText = leftElement.querySelector('p, h1, h2, span');
    if (leftText) {
      results.leftTextColor = window.getComputedStyle(leftText).color;
    }
  }

  if (rightElement) {
    results.rightBackground = window.getComputedStyle(rightElement).backgroundColor;
  }

  // Alternative: Check computed style of the body or main containers
  if (results.leftBackground === 'Not found' || results.leftBackground === 'rgba(0, 0, 0, 0)') {
     // Search for an element with specific color #020617
     const darkBlue = Array.from(allElements).find(el => {
        const bg = window.getComputedStyle(el).backgroundColor;
        return bg === 'rgb(2, 6, 23)'; // #020617 in RGB
     });
     if (darkBlue) results.leftBackground = 'rgb(2, 6, 23)';
  }

  return results;
})()