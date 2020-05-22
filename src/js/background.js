chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.type == blocklist.common.GET_BLOCKLIST) {
      let blocklistPatterns = [];
      if (!localStorage.blocklist) {
        localStorage['blocklist'] = JSON.stringify(blocklistPatterns);
      } else {
        blocklistPatterns = JSON.parse(localStorage['blocklist']);
      }
      sendResponse({
        blocklist: blocklistPatterns
      });
    }
    else if (request.type == blocklist.common.ADD_TO_BLOCKLIST) {
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
    }
    else if (request.type == blocklist.common.ADD_LIST_TO_BLOCKLIST) {
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
    }
    else if (request.type == blocklist.common.DELETE_FROM_BLOCKLIST) {
      let blocklists = JSON.parse(localStorage['blocklist']);
      let index = blocklists.indexOf(request.pattern);
      if (index != -1) {
        blocklists.splice(index, 1);
        localStorage['blocklist'] = JSON.stringify(blocklists);
        sendResponse({
          pattern: request.pattern
        });
      }
    }
    else if (request.type == blocklist.common.GET_CONFIG) {
      let configs = [];
      if (!localStorage.configList) {
        localStorage['configList'] = JSON.stringify(configs);
      } else {
        configs = JSON.parse(localStorage['configList']);
      }

      sendResponse({
        configList: configs
      });
    }
    else if (request.type == blocklist.common.SAVE_CONFIG) {
      localStorage['configList'] = JSON.stringify(request.configList);

      sendResponse({
        success: 1
      });
    }
  }
);