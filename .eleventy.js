const compat = require('./src/_11ty/shortcodes/compat.js');

module.exports = (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy({
    'src/assets/css/main.css': '/assets/css/main.css',
    'src/assets/img/': '/assets/img/'
  });

  eleventyConfig.addShortcode('compat', compat);

  return {
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid"
    ],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: 'src',
      output: '_site',
      data: '_data',
      includes: '_includes'
    },
  };
};
