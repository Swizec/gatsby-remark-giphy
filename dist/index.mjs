import r from"unist-util-visit";import t from"giphy-api";export default function(e,i){var n=e.markdownAST;try{var a=[],o=t({apiKey:i.giphyApiKey,https:!0});return r(n,"image",function(r){var t=r.url;t.startsWith("giphy:")&&a.push(function(){try{var e=t.replace(/^giphy:/,"");return Promise.resolve(o.search(e)).then(function(t){r.url=t.data[0].images.downsized_large.url})}catch(r){return Promise.reject(r)}})}),Promise.resolve(Promise.all(a.map(function(r){return r()}))).then(function(){return n})}catch(r){return Promise.reject(r)}}
//# sourceMappingURL=index.mjs.map