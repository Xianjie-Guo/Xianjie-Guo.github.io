// 获取当前页面的最后修改日期
fetch(window.location.href, {
  method: 'HEAD',
  cache: 'no-cache'
})
.then(response => {
  const lastModified = response.headers.get('last-modified');
  if (lastModified) {
    const date = new Date(lastModified);
    const formattedDate = date.toISOString().split('T')[0];
    document.getElementById('last-updated').textContent = formattedDate;
  }
})
.catch(error => console.error('获取最后修改日期时出错:', error));