# gatsby-remark-giphy

Gatsby Remark plugin to embed gifs with `![](giphy:yay_a_gif)`

## The problem

Looking for gifs disrupts your writing flow. Use `![](giphy:search_term)` and let gatsby-remark-giphy do the hard work for you.

For example, this line anywhere in your markdown:

`![](giphy:yay_a_gif`)

Creates a gif like this:

![](https://media0.giphy.com/media/1APaqOO5JHnWKLc7Bi/giphy.gif)

First search result from Giphy's API is used. This might not return the same image every time you run Gatsby build.

## Installation

```
npm install gatsby-remark-giphy
```

or

```
yarn add gatsby-remark-giphy
```

`gatsby-remark-giphy` is meant to be used as a plugin for [`gatsby-transformer-remark`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-remark) or [`gatsby-plugin-mdx`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-mdx).

## Usage

```javascript
// In your gatsby-config.js

module.exports = {
  // Find the 'plugins' array
  plugins: [
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-giphy`,
            options: {
              giphyApiKey: `<your-api-key>`
            },
          },

          // Other plugins here...
        ],
      },
    },
  ],
};
```

```javascript
// In your gatsby-config.js

module.exports = {
  // Find the 'plugins' array
  plugins: [
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-giphy`,
            options: {
              giphyApiKey: `<your-api-key>`
            },
          },

          // Other plugins here...
        ],
      },
    },
  ],
};
```

## Options

You can configure how `gatsby-remark-giphy` works with these helpful options:

- `giphyApiKey`: required - your [Giphy API Key](https://developers.giphy.com/). Create a Giphy developers account, request an API key, and you're ready to go. You should consider using this via an ENV variable of some sort instead of directly in your gatsby-config
- `useVideo`: optional - false by default. Whether to embed gifs as an autoplaying HTML5 video
- 

## Contributors ✨

## LICENSE

MIT