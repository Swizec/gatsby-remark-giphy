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

                const { data } = await giphy.search(search);

                imageNode.url = data[0].images.downsized_large.url;
            });
        }
    });

    await Promise.all(transformations.map((t) => t()));

    return markdownAST;
}
