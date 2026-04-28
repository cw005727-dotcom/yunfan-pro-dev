(() => {
  const allTestIds = Array.from(document.querySelectorAll('div[data-testid]')).map(el => ({
    testId: el.getAttribute('data-testid'),
    className: el.className,
    tagName: el.tagName
  }));

  const columnsInfo = Array.from(document.querySelectorAll('[data-testid="stHorizontalBlock"]')).map(parent => {
    const columns = Array.from(parent.querySelectorAll('[data-testid="stColumn"]')).map(col => ({
      testId: col.getAttribute('data-testid'),
      className: col.className
    }));
    return {
      parentTestId: parent.getAttribute('data-testid'),
      parentClassName: parent.className,
      columns: columns
    };
  });

  return {
    allTestIds: allTestIds,
    columnsInfo: columnsInfo
  };
})()