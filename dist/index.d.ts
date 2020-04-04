declare type PluginOptions = {
    giphyApiKey: string;
};
export default function ({ cache, markdownAST }: {
    cache: any;
    markdownAST: any;
}, pluginOptions: PluginOptions): Promise<any>;
export {};
