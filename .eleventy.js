const pluginWebc = require("@11ty/eleventy-plugin-webc");

module.exports = (eleventyConfig) => {
  //eleventyConfig.addPlugin(pluginWebc);

  eleventyConfig.addPlugin(pluginWebc, {
    components: [
      // Add as a global WebC component
      "npm:@oddbird/browser-support/*.webc",
    ],
  });

  eleventyConfig.addPassthroughCopy({
    'src/assets/css/main.css': '/assets/css/main.css',
    'src/assets/img/': '/assets/img/',
    'src/assets/js/': '/assets/js/'
  });
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
