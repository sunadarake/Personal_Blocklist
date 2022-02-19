
blocklist.searchpage = {};

blocklist.searchpage.blocklist = [];

blocklist.searchpage.mutationObserver = null;

blocklist.searchpage.pws_option = "off";

blocklist.searchpage.SEARCH_RESULT_DIV_BOX = "div.g";

blocklist.searchpage.LINK_TAG = "div.yuRUbf > a";


blocklist.searchpage.handleGetBlocklistResponse = function (response) {
  if (response.blocklist != undefined) {
    blocklist.searchpage.blocklist = response.blocklist;
  }
};

blocklist.searchpage.isHostLinkInBlocklist = function (hostlink) {
  if (blocklist.searchpage.blocklist.indexOf(hostlink) != -1) {
    return true;
  } else {
    return false;
  }
};

blocklist.searchpage.handleAddBlocklistFromSerachResult = function (response) {
  if (response.blocklist != undefined) {
    blocklist.searchpage.blocklist = response.blocklist;
  }
};

blocklist.searchpage.showAddBlocklistMessage = function (pattern, section) {
  let showMessage = document.createElement('div');
  showMessage.style.cssText = 'font-size:15px;padding:30px;margin:20px 0;box-sizing:border-box;background:#' + (darkTheme ? "303134" : "d8f7eb") + ';';
  showMessage.innerHTML = chrome.i18n.getMessage("completeBlocked", pattern);

  let cancelMessage = document.createElement('div');
  cancelMessage.classList.add("cancleBlock");
  cancelMessage.style.cssText = "cursor: pointer;margin-top:20px;font-size:16px;font-weight: 700; color: #" + (darkTheme ? "8ab4f8" : "0066c0") + ";";
  cancelMessage.innerHTML = chrome.i18n.getMessage("cancleBlocked", pattern);
  cancelMessage.addEventListener("click", function (e) {
    blocklist.searchpage.removePatternFromBlocklists(pattern);
    blocklist.searchpage.removeBlockMessage(e.target.parentNode);
  }, false);
  showMessage.appendChild(cancelMessage);
  let parent = section.parentNode;
  parent.insertBefore(showMessage, section);

}

blocklist.searchpage.removeBlockMessage = function (elm) {
  elm.parentNode.removeChild(elm);
}

blocklist.searchpage.removePatternFromBlocklists = function (pattern) {
  chrome.runtime.sendMessage({
    type: blocklist.common.DELETE_FROM_BLOCKLIST,
    pattern: pattern
  }, blocklist.searchpage.handleRemoveBlocklistFromSerachResult);

  blocklist.searchpage.displaySectionsFromSearchResult(pattern);
}

blocklist.searchpage.handleRemoveBlocklistFromSerachResult = function (response) {
  if (response.blocklist != undefined) {
    blocklist.searchpage.blocklist = response.blocklist;
  }
}

blocklist.searchpage.displaySectionsFromSearchResult = function (pattern) {
  blocklist.searchpage.toggleSections(pattern, "block");
}


blocklist.searchpage.deleteSectionsFromSearchResult = function (pattern) {
  blocklist.searchpage.toggleSections(pattern, "none");
};

blocklist.searchpage.toggleSections = function (pattern, display) {
  var searchResultPatterns = document.querySelectorAll(blocklist.searchpage.SEARCH_RESULT_DIV_BOX);

  for (let i = 0, length = searchResultPatterns.length; i < length; i++) {
    var searchResultPattern = searchResultPatterns[i];
    var searchResultHostLink = searchResultPattern.querySelector(blocklist.searchpage.LINK_TAG);
    if (searchResultHostLink) {
      var HostLinkHref = searchResultHostLink.getAttribute("href");
      var sectionLink = HostLinkHref.replace(blocklist.common.HOST_REGEX, '$2');
      if (pattern === sectionLink) {
        searchResultPattern.style.display = display;
      }
    }
  }
}

blocklist.searchpage.addBlocklistFromSearchResult = function (hostlink, searchresult) {
  var pattern = hostlink;
  chrome.runtime.sendMessage({
    type: blocklist.common.ADD_TO_BLOCKLIST,
    pattern: pattern
  },
    blocklist.searchpage.handleAddBlocklistFromSerachResult);
  blocklist.searchpage.deleteSectionsFromSearchResult(pattern);
  blocklist.searchpage.showAddBlocklistMessage(pattern, searchresult);
};

blocklist.searchpage.insertAddBlockLinkInSearchResult = function (searchResult, hostlink) {
  var insertLink = document.createElement('p');
  insertLink.innerHTML = chrome.i18n.getMessage("addBlocklist", hostlink);
  insertLink.style.cssText =
    "margin:0;text-decoration:underline;cursor: pointer;color:#" + (darkTheme ? "8ab4f8" : "1a0dab") + ";";
  searchResult.appendChild(insertLink);

  insertLink.addEventListener("click", function () {
    blocklist.searchpage.addBlocklistFromSearchResult(hostlink, searchResult);
  }, false);
};

blocklist.searchpage.isPwsFeatureUsed = function () {
  if (blocklist.searchpage.pws_option == "off") return false;

  const PWS_REGEX = /(&|[?])pws=0/;
  return PWS_REGEX.test(location.href);
};

blocklist.searchpage.modifySearchResults = function (parent_dom) {

  if (blocklist.searchpage.isPwsFeatureUsed()) return;

  var searchResultPatterns = parent_dom.querySelectorAll(blocklist.searchpage.SEARCH_RESULT_DIV_BOX);

  for (let i = 0, length = searchResultPatterns.length; i < length; i++) {
    var searchResultPattern = searchResultPatterns[i];
    var searchResultHostLink = searchResultPattern.querySelector(blocklist.searchpage.LINK_TAG);
    if (searchResultHostLink) {
      var HostLinkHref = searchResultHostLink.getAttribute("href");
      var HostLinkPattern = blocklist.common.getHostNameFromUrl(HostLinkHref);

      if (blocklist.searchpage.isHostLinkInBlocklist(HostLinkPattern)) {
        searchResultPattern.style.display = "none";
      } else {
        blocklist.searchpage.insertAddBlockLinkInSearchResult(
          searchResultPattern, HostLinkPattern);
      }
    }
  }
};

blocklist.searchpage.refreshBlocklist = function () {
  chrome.runtime.sendMessage({
    type: blocklist.common.GET_BLOCKLIST
  },
    blocklist.searchpage.handleGetBlocklistResponse);
};

blocklist.searchpage.getPwsOption = function () {
  chrome.runtime.sendMessage({
    type: blocklist.common.GET_PWS_OPTION_VAL
  },
    blocklist.searchpage.handleGetPwsOptionResponse);
}

blocklist.searchpage.handleGetPwsOptionResponse = function (response) {
  blocklist.searchpage.pws_option = response.pws_option;
}

blocklist.searchpage.initMutationObserver = function () {
  if (blocklist.searchpage.mutationObserver != null) return;

  blocklist.searchpage.mutationObserver = new MutationObserver(function (mutations) {
    blocklist.searchpage.modifySearchResultsAdded(mutations);
  });

  const SEARCH_RESULTS_WRAP = "div#center_col";
  let target = document.querySelector(SEARCH_RESULTS_WRAP);
  let config = { childList: true, subtree: true };
  blocklist.searchpage.mutationObserver.observe(target, config);
}

blocklist.searchpage.modifySearchResultsAdded = function (mutations) {
  for (let i = 0; i < mutations.length; i++) {
    let mutation = mutations[i];
    let nodes = mutation.addedNodes;

    if (nodes.length !== 3) continue;

    let div_tag = nodes[1];
    if (div_tag.tagName !== "DIV") continue;

    let new_srp_div = div_tag.parentNode;
    if (!(/arc-srp_([0-9]+)/).test(new_srp_div.id)) continue;

    blocklist.searchpage.modifySearchResults(new_srp_div);
  };
}

blocklist.searchpage.refreshBlocklist();
blocklist.searchpage.getPwsOption();

document.addEventListener("DOMContentLoaded", function () {
  window.darkTheme = (getComputedStyle(document.body).backgroundColor !== "rgb(255, 255, 255)");
  blocklist.searchpage.initMutationObserver();
  blocklist.searchpage.modifySearchResults(document);
}, false);
