import visit from "unist-util-visit";
import giphyClient, { GIFObject } from "giphy-api";

type PluginOptions = {
    giphyApiKey: string;
    useVideo: boolean;
};

function embedGif(imageNode, giphy: GIFObject) {
    const search = imageNode.url.replace(/^giphy:/, "");

    imageNode.alt = search;
    imageNode.url = giphy.images.downsized_large.url;
    imageNode.title = imageNode.title || search;

    return imageNode;
}

function embedVideo(imageNode, giphy: GIFObject) {
    const srcHTML = `<source src=${giphy.images.looping.mp4} type="video/mp4" />`;

    imageNode.type = "html";
    imageNode.children = undefined;
    imageNode.value = `<video style="margin: auto auto; display: block; max-width: 100%" autoplay loop muted playsinline>
            ${srcHTML}
        </video>`;

    return imageNode;
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

    visit(markdownAST, "image", (imageNode) => {
        const url = imageNode.url as string;

        if (url.startsWith("giphy:")) {
            transformations.push(async () => {
                const search = url.replace(/^giphy:/, "");

                let data = await cache.get(search);

                if (!data) {
                    try {
                        const result = await giphy.search(search);
                        data = result.data;
                        cache.set(search, result.data);
                    } catch (err) {
                        err.message = `The following error appeared while searching Giphy for ${search}:\n\n${err.message}`;
                        throw err;
                    }
                }

                if (pluginOptions.useVideo) {
                    imageNode = embedVideo(imageNode, data[0]);
                } else {
                    imageNode = embedGif(imageNode, data[0]);
                }
            });
        }
    });

    await Promise.all(transformations.map((t) => t()));

    return markdownAST;
}
