
async function getConfig() {
  return {
    exitOnPageError: false,
    launch: {
      headless: false,
    },
  };
}
module.exports = getConfig();
