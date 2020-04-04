import visit from "unist-util-visit";
import giphyClient from "giphy-api";

type PluginOptions = {
    giphyApiKey: string;
};

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

                imageNode.url = data[0].images.downsized_large.url;
                imageNode.alt = search;
                imageNode.title = imageNode.title || search;
            });
        }
    });

    await Promise.all(transformations.map((t) => t()));

    return markdownAST;
}
