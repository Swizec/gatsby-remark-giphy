import { Node } from "unist";
import { visit } from "unist-util-visit";
import giphyClient, { GIFObject } from "giphy-api";

type PluginOptions = {
    giphyApiKey: string;
    useVideo?: boolean;
    useIframe?: boolean;
    embedWidth?: string;
};

/**
 * This is a bastardized type
 * Covers base ImageNode and what we transform it into
 * ASTs aren't the nicest fit for TypeScript
 */
type ImageNode = {
    type: "image" | "text" | "html";
    title: string | null;
    url: string;
    alt: string;
    value?: string;
    children?: [];
    position: {
        start: { line: number; column: number; offset: number };
        end: { line: number; column: number; offset: number };
    };
};

function embedGif(imageNode: ImageNode, giphy: GIFObject) {
    const search = imageNode.url.replace(/^giphy:/, "");

    imageNode.alt = search;
    imageNode.url = giphy.images.downsized_large.url;
    imageNode.title = imageNode.title || search;

    return imageNode;
}

function embedVideo(imageNode: ImageNode, giphy: GIFObject, embedWidth) {
    const srcHTML = `<source src=${giphy.images.looping.mp4} type="video/mp4" />`;

    imageNode.type = "html";
    // imageNode.children = undefined;
    imageNode.value = `<video style="margin: auto auto; display: block; max-width: ${embedWidth}" autoplay loop muted playsinline loading="lazy">
            ${srcHTML}
        </video>`;

    return imageNode;
}

function embedIframe(imageNode: ImageNode, giphy: GIFObject, embedWidth) {
    const responsivePadding = Math.round(
        (Number(giphy.images.original.height) /
            Number(giphy.images.original.width)) *
            Number(embedWidth.replace("%", ""))
    );

    imageNode.type = "html";
    // imageNode.children = undefined;
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

    visit(markdownAST, "image", (imageNode: ImageNode) => {
        const url = imageNode.url as string;

        if (url.startsWith("giphy:")) {
            transformations.push(async () => {
                const search = url.replace(/^giphy:/, "").replace(/_/g, " ");

                let giphyData = await cache.get(cacheKey(search));

                if (!giphyData) {
                    try {
                        const result = await giphy.search(search);
                        const data = result.data;
                        giphyData = data[0];

                        cache.set(cacheKey(search), giphyData);
                    } catch (err) {
                        err.message = `The following error appeared while transforming Giphy for ${search}:\n\n${err.message}`;
                        console.error(err);

                        imageNode.type = "text";
                        imageNode.value = "";
                        // imageNode = null;
                        return;
                    }
                }

                try {
                    if (pluginOptions.useIframe) {
                        imageNode = embedIframe(
                            imageNode,
                            giphyData,
                            embedWidth
                        );
                    } else if (pluginOptions.useVideo) {
                        imageNode = embedVideo(
                            imageNode,
                            giphyData,
                            embedWidth
                        );
                    } else {
                        imageNode = embedGif(imageNode, giphyData);
                    }
                } catch (e) {
                    console.warn(`Couldn't find giphy for: ${search}`);

                    imageNode.type = "text";
                    imageNode.value = "";
                    // imageNode = null;
                }
            });
        }
    });

    await Promise.all(transformations.map((t) => t()));

    return markdownAST;
}
