// As context: I have "shortcodes" in my markdown...
// ::: compat "Collator()" https://raw.githubusercontent.com/mdn/browser-compat-data/refs/heads/main/javascript/builtins/Intl/Collator.json javascript.builtins.Intl.Collator :::
// 
// 👆
// "compat" defines the short code
// "Collator()" is the title of the compat block
// "https://raw.githubusercontent.com/mdn/..." is the URl of the MDN compat data
// "javascript.builtins.Intl.Collator" is the path to the compat info I'm interested in

const EleventyFetch = require('@11ty/eleventy-fetch');
const objectPath = require('object-path');
const replaceAsync = require('string-replace-async');

function getMirroredVersion(compatData, platform, helperData) {
    const supportedChromeVersion =
        compatData.support.chrome instanceof Array
            ? compatData.support.chrome[0].version_added
            : compatData.support.chrome.version_added;

    if (supportedChromeVersion) {
        if (platform === 'edge') {
            const wasBeforeMigratingToChromium =
                parseInt(compatData.support.chrome.version_added, 10) <= 79;

            return wasBeforeMigratingToChromium ? '79' : `${supportedChromeVersion}`;
        }

        if (['chrome_android', 'webview_android'].includes(platform)) {
            return `${supportedChromeVersion}`;
        }

        // for android we have to fetch the engine version and
        // map a samsung internet version to a particular chrome relaese
        if (platform === 'samsunginternet_android') {
            for (const [version, info] of Object.entries(
                helperData.SAMSUNG_INTERNET_DATA.browsers[platform].releases
            )) {
                if (info.engine === 'Blink') {
                    const currentEngineVersion = parseInt(info.engine_version, 10);
                    if (currentEngineVersion >= supportedChromeVersion) {
                        return version;
                    }
                }
            }
        }
    }

    if (platform === 'firefox_android') {
        return compatData.support.firefox instanceof Array
            ? compatData.support.firefox[0].version_added
            : compatData.support.firefox.version_added;
    }

    if (platform === 'safari_ios') {
        return compatData.support.safari instanceof Array
            ? compatData.support.safari[0].version_added
            : compatData.support.safari.version_added;
    }
}

module.exports = ({ register, utilName }) => {
    register(utilName, (content, callback) => {
        const compatRegex =
            /:::\scompat[\s\t]+['"](.*?)['"][\s\t]+(.*?)[\s\t]+(.*?)\s:::/g;

        replaceAsync(
            content,
            compatRegex,
            async (match, name, compatUrl, compatPath) => {
                // @Manuel you want to look at this part and bring it into 
                // your setup... :) 

                const SAMSUNG_INTERNET_DATA = await EleventyFetch(
                    'https://raw.githubusercontent.com/mdn/browser-compat-data/main/browsers/samsunginternet_android.json',
                    {
                        duration: '1d',
                        type: 'json',
                    }
                );

                const response = await EleventyFetch(compatUrl, {
                    duration: '1d',
                    type: 'json',
                });
                const compatData = objectPath.get(response, `${compatPath}.__compat`);

                const platformsToSupport = Object.keys(compatData.support).filter(
                    (platform) =>
                        [
                            'chrome',
                            'chrome_android',
                            'edge',
                            'firefox',
                            'firefox_android',
                            'safari',
                            'safari_ios',
                            'samsunginternet_android',
                            'webview_android',
                        ].includes(platform)
                );

                const nos = ['Nope', 'Nein', 'Non', 'Nei', 'Nö'];
                const platformSupportVersions = platformsToSupport.map((platform) => {
                    let supportedVersion = false;
                    let hasFlags = false;

                    if (compatData.support[platform].version_added) {
                        supportedVersion = compatData.support[platform].version_added;

                        if (compatData.support[platform].flags) {
                            hasFlags = true;
                        }
                    }

                    if (compatData.support[platform] instanceof Array) {
                        supportedVersion = compatData.support[platform][0].version_added;

                        if (compatData.support[platform][0].flags) {
                            hasFlags = true;
                        }
                    }

                    if (!supportedVersion && compatData.support[platform] === 'mirror') {
                        supportedVersion = getMirroredVersion(compatData, platform, {
                            SAMSUNG_INTERNET_DATA,
                        });
                    }

                    return {
                        platform,
                        hasFlags,
                        version: supportedVersion,
                    };
                });
                const platformEntryHasFlags = platformSupportVersions.some(
                    ({ hasFlags }) => hasFlags
                );

                return `<div class="highlightBox mdn margin-top-xl margin-bottom-xl">
        <div class="cornerBubble">
          <svg aria-hidden="true"><use xlink:href="/sprite.svg#icon-mdn"></use></svg>
        </div>
        <div class="highlightBox__header">MDN Compat Data (<a href="${compatUrl}">source</a>)</div>
        <div class="highlightBox__body">
          <div class="highlightBox__overflow">
            <table class="highlightBox__compat">
              <caption>Browser support info for ${compatData.mdn_url
                        ? `<a href="${compatData.mdn_url}">${compatData.description || name
                        }</a>`
                        : `${compatData.description || name}`
                    } </caption>
              <thead>
                <tr>
                  ${platformsToSupport
                        .map(
                            (platform) =>
                                `<td>
                        <img src="/assets/browsers/${platform}.webp"
                              srcset="/assets/browsers/${platform}.webp, /assets/browsers/${platform}@2.webp 2x"
                              width="48" height="51" alt="${platform}">
                      </td>`
                        )
                        .join('')}
                </tr>
              </thead>
              <tbody>
                <tr>
                  ${platformSupportVersions
                        .map(({ hasFlags, version }) => {
                            return `<td>
                        <span class="highlightBox__pill ${version && !hasFlags ? 'success' : 'failure'
                                } margin-top-s">
                        ${version
                                    ? version
                                    : nos[Math.floor(Math.random() * nos.length)]
                                }${hasFlags ? '*' : ''}
                        </span>
                      </td>`;
                        })
                        .join('')}
                </tr>
              </tbody>
            </table>
          </div>

          ${platformEntryHasFlags
                        ? `<div class="padding-top-m fs-75" >* Please <a href="${compatData.mdn_url}">check MDN for more details</a>.</div>`
                        : ''
                    }

          </div>
        </div>`;
            }
        )
            .then((newContent) => {
                callback(null, newContent);
            })
            .catch((e) => {
                console.error(`Rendering ${content} failed`);
                callback(e);
            });
    });
};