let blocklist = {};

blocklist.common = {};

blocklist.common.pws_option_val = "off";

blocklist.common.show_links_option_val = "off";

blocklist.common.GET_BLOCKLIST = 'getBlocklist';
blocklist.common.ADD_TO_BLOCKLIST = 'addToBlocklist';
blocklist.common.ADD_LIST_TO_BLOCKLIST = 'addListToBlocklist';
blocklist.common.DELETE_FROM_BLOCKLIST = 'deleteFromBlocklist';
blocklist.common.GET_PWS_OPTION_VAL = "getPwsOptionVal";
blocklist.common.CHANGE_PWS_OPTION_VAL = "changePwsOptionVal";

blocklist.common.GET_SHOW_LINKS_OPTION_VAL = "getShowLinksOptionVal";
blocklist.common.CHANGE_SHOW_LINKS_OPTION_VAL = "changeShowLinksOptionVal";

blocklist.common.HOST_REGEX = new RegExp(
  '^https?://(www[.])?([0-9a-zA-Z.-]+).*$');

blocklist.common.startBackgroundListeners = function () {
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.type == blocklist.common.GET_BLOCKLIST) {
        console.log(localStorage['blocklist_pws_option']);
        let blocklistPatterns = [];
        if (!localStorage.blocklist) {
          localStorage['blocklist'] = JSON.stringify(blocklistPatterns);
        } else {
          blocklistPatterns = JSON.parse(localStorage['blocklist']);
        }
        sendResponse({
          blocklist: blocklistPatterns
        });
      } else if (request.type == blocklist.common.ADD_TO_BLOCKLIST) {
        let blocklists = JSON.parse(localStorage['blocklist']);
        if (blocklists.indexOf(request.pattern) == -1) {
          blocklists.push(request.pattern);
          blocklists.sort();
          localStorage['blocklist'] = JSON.stringify(blocklists);
        }
        sendResponse({
          success: 1,
          pattern: request.pattern
        });

      } else if (request.type == blocklist.common.ADD_LIST_TO_BLOCKLIST) {
        let regex = /(https?:\/\/)?(www[.])?([0-9a-zA-Z.-]+).*(\r\n|\n)?/g;
        let arr = [];
        while ((m = regex.exec(request.pattern)) !== null) {
          arr.push(m[3]);
        }

        let blocklists = JSON.parse(localStorage['blocklist']);
        for (let i = 0, length = arr.length; i < length; i++) {
          if (blocklists.indexOf(arr[i]) == -1) {
            blocklists.push(arr[i]);
          }
        }

        blocklists.sort();
        localStorage['blocklist'] = JSON.stringify(blocklists);

        sendResponse({
          success: 1,
          pattern: request.pattern
        });


      } else if (request.type == blocklist.common.DELETE_FROM_BLOCKLIST) {
        let blocklists = JSON.parse(localStorage['blocklist']);
        let index = blocklists.indexOf(request.pattern);
        if (index != -1) {
          blocklists.splice(index, 1);
          localStorage['blocklist'] = JSON.stringify(blocklists);
          sendResponse({
            pattern: request.pattern
          });
        }
      } else if (request.type == blocklist.common.GET_PWS_OPTION_VAL) {
        if (!localStorage.blocklist_pws_option)
          localStorage['blocklist_pws_option'] = "off";

        sendResponse({
          pws_option: localStorage['blocklist_pws_option']
        });
      } else if (request.type == blocklist.common.CHANGE_PWS_OPTION_VAL) {
        localStorage['blocklist_pws_option'] = request.val;

        sendResponse({
          pws_option: request.val
        });
      } else if (request.type == blocklist.common.GET_SHOW_LINKS_OPTION_VAL) {
        if (!localStorage.blocklist_show_links_option)
          localStorage['blocklist_show_links_option'] = "off";

        sendResponse({
          show_links_option: localStorage['blocklist_show_links_option']
        });
      } else if (request.type == blocklist.common.CHANGE_SHOW_LINKS_OPTION_VAL) {
        localStorage['blocklist_show_links_option'] = request.val;

        sendResponse({
            show_links_option: request.val
        });
      }
    }
  )
};

/*
 * get hostname from url
 *
 * ex) https://example.com/foo.html      → example.com
 *     http://example.com/               → example.com
 *     https://example.com/bar/foo.html  → example.com
 */
blocklist.common.getHostNameFromUrl = function (pattern) {
  return pattern.replace(blocklist.common.HOST_REGEX, '$2');
}


blocklist.common.startBackgroundListeners();

