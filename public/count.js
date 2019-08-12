'use strict;'

console.log('Hit init');

(async () => {

   const hc = document.getElementById('hc-pop');
   hc.innerText = '∞';

 await fetch('https://hits.click/hit', {
    method: 'POST',
    body: JSON.stringify({
      url: window.location.href
    }),
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(async function (response) {
    const json = await response.json();
    hc.innerHTML = json.recent + ' / ' +  json.count;
  })
})();
