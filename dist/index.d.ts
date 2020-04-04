declare type PluginOptions = {
    giphyApiKey: string;
    useVideo: boolean;
};
export default function ({ cache, markdownAST }: {
    cache: any;
    markdownAST: any;
}, pluginOptions: PluginOptions): Promise<any>;
export {};
