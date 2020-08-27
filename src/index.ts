import visit from "unist-util-visit";
import giphyClient, { GIFObject } from "giphy-api";

type PluginOptions = {
    giphyApiKey: string;
    useVideo?: boolean;
    useIframe?: boolean;
    embedWidth?: string;
};

function embedGif(imageNode, giphy: GIFObject) {
    const search = imageNode.url.replace(/^giphy:/, "");

    imageNode.alt = search;
    imageNode.url = giphy.images.downsized_large.url;
    imageNode.title = imageNode.title || search;

    return imageNode;
}

function embedVideo(imageNode, giphy: GIFObject, embedWidth) {
    const srcHTML = `<source src=${giphy.images.looping.mp4} type="video/mp4" />`;

    imageNode.type = "html";
    imageNode.children = undefined;
    imageNode.value = `<video style="margin: auto auto; display: block; max-width: ${embedWidth}" autoplay loop muted playsinline loading="lazy">
            ${srcHTML}
        </video>`;

    return imageNode;
}

function embedIframe(imageNode, giphy: GIFObject, embedWidth) {
    const responsivePadding = Math.round(
        (Number(giphy.images.original.height) /
            Number(giphy.images.original.width)) *
            Number(embedWidth.replace("%", ""))
    );

    imageNode.type = "html";
    imageNode.children = undefined;
    imageNode.value = `<div style="width:${embedWidth};height:0;padding-bottom:${responsivePadding}%;position:relative;margin: 0 auto"><iframe src="${giphy.embed_url}" width="100%" height="100%" style="position:absolute" frameborder="0" class="giphy-embed" allowfullscreen loading="lazy"></iframe></div>`;

    return imageNode;
}

function cacheKey(search) {
    return `giphy-result:${search}`;
}

export default async function (
    { cache, markdownAST },
    pluginOptions: PluginOptions
) {
    const transformations = [];
    const giphy = giphyClient({
        apiKey: pluginOptions.giphyApiKey,
        https: true,
    });
    const embedWidth = pluginOptions.embedWidth || "100%";

    visit(markdownAST, "image", (imageNode) => {
        const url = imageNode.url as string;

        if (url.startsWith("giphy:")) {
            transformations.push(async () => {
                const search = url.replace(/^giphy:/, "");

                let giphyData = await cache.get(cacheKey(search));

                if (!giphyData) {
                    try {
                        const result = await giphy.search(search);
                        const data = result.data;
                        giphyData = data[0];

                        cache.set(cacheKey(search), giphyData);
                    } catch (err) {
                        err.message = `The following error appeared while transforming Giphy for ${search}:\n\n${err.message}`;
                        throw err;
                    }
                }

                if (pluginOptions.useIframe) {
                    imageNode = embedIframe(imageNode, giphyData, embedWidth);
                } else if (pluginOptions.useVideo) {
                    imageNode = embedVideo(imageNode, giphyData, embedWidth);
                } else {
                    imageNode = embedGif(imageNode, giphyData);
                }
            });
        }
    });

    await Promise.all(transformations.map((t) => t()));

    return markdownAST;
}
