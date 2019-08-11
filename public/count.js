'use strict;'

console.log('Hit init');
const hc = document.getElementById('hc-pop');

hc.innerText = '∞';

(async () => {

 return await fetch('https://hits.click/hit', {
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
    return json;
  })
})();
