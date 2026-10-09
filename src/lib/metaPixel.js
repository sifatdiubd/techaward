export function trackPixelEvent(eventName, params = {}) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params);
  }
}

export function initMetaPixel(pixelId) {
  if (!pixelId) {
    return;
  }
  const scriptId = "meta-pixel-script";
  if (document.getElementById(scriptId)) {
    return;
  }
  const script = document.createElement("script");
  script.id = scriptId;
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
  const noscript = document.createElement("noscript");
  noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
  document.head.appendChild(noscript);
}

export function injectPixelCode(code) {
  if (!code) {
    return;
  }
  const containerId = "meta-pixel-script-custom";
  if (document.getElementById(containerId)) {
    return;
  }
  const container = document.createElement("div");
  container.id = containerId;
  container.innerHTML = code;
  container.querySelectorAll("script").forEach((item) => {
    const script = document.createElement("script");
    Array.from(item.attributes).forEach((item2) => {
      script.setAttribute(item2.name, item2.value);
    });
    script.appendChild(document.createTextNode(item.innerHTML));
    document.head.appendChild(script);
    item.remove();
  });
  document.head.appendChild(container);
}
