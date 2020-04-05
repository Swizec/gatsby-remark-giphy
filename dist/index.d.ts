declare type PluginOptions = {
    giphyApiKey: string;
    useVideo?: boolean;
    useIframe?: boolean;
    embedWidth?: string;
};
export default function ({ cache, markdownAST }: {
    cache: any;
    markdownAST: any;
}, pluginOptions: PluginOptions): Promise<any>;
export {};
