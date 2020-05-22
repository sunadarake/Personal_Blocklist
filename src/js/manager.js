blocklist.manager = {};

blocklist.manager.handleDeleteBlocklistResponse = function (response) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'refresh'
    });
  })
};

blocklist.manager.handleAddBlocklistResponse = function (response) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'refresh'
    });
  })
};

blocklist.manager.createBlocklistPattern = function (pattern) {
  let patRow = $(
    '<div style="display:flex;font-size:16px;margin:10px 0;padding:5px 0;border-bottom:1px solid #f2f2f2;"></div>');
  let patRowDeleteButton = $('<div class="isBlocked" style="margin-right: 15px;"></div>');
  let span = $('<span style="color:#1a0dab;margin:0;text-decoration:underline;cursor: pointer;">' +
    chrome.i18n.getMessage('removeUrlFromBlocklist') +
    '</span>');

  patRowDeleteButton.append(span);
  patRowDeleteButton.appendTo(patRow);

  let patRowHostName = $(
    '<div>' + pattern + '<div>');
  patRowHostName.appendTo(patRow);

  patRowDeleteButton.on("click", function () {
    let btn = $(this);

    if (btn.hasClass("isBlocked")) {
      chrome.runtime.sendMessage({
        type: blocklist.common.DELETE_FROM_BLOCKLIST,
        pattern: pattern
      },
        blocklist.manager.handleDeleteBlocklistResponse);

      btn.removeClass("isBlocked");
      span.html(
        '<span style="color:#1a0dab;margin:0;text-decoration:underline;cursor: pointer;">' +
        chrome.i18n.getMessage('blockThisUrl') +
        '</span>');

    } else {
      chrome.runtime.sendMessage({
        type: blocklist.common.ADD_TO_BLOCKLIST,
        pattern: pattern
      },
        blocklist.manager.handleAddBlocklistResponse);

      btn.addClass("isBlocked");
      span.html(
        '<span style="color:#1a0dab;margin:0;text-decoration:underline;cursor: pointer;">' +
        chrome.i18n.getMessage('removeUrlFromBlocklist') +
        '</span>');

    }
  });
  return patRow;
}

blocklist.manager.handleAddBlocklistResponse = function (response) {
  chrome.runtime.sendMessage({
    type: blocklist.common.GET_BLOCKLIST
  },
    blocklist.manager.handleRefreshResponse);
}

blocklist.manager.hideCurrentHost = function (pattern) {
  chrome.runtime.sendMessage({
    'type': blocklist.common.ADD_TO_BLOCKLIST,
    'pattern': pattern
  },
    blocklist.manager.handleAddBlocklistResponse);
  $("#current-blocklink").html(
    '<p style="background:#dff0d8;color:#3c763d;padding:10px;">' +
    chrome.i18n.getMessage('alreadlyBlocked', pattern) +
    '</p>');
}

blocklist.manager.addBlockCurrentHostLink = function (blocklistPatterns) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    let pattern = blocklist.common.getHostNameFromUrl(tabs[0].url);

    if (blocklistPatterns.indexOf(pattern) == -1) {
      $('#current-blocklink').html(
        '<a href="#"> ' +
        chrome.i18n.getMessage("addBlocklist", pattern) +
        '</a>');
      $('#current-blocklink').click(function () {
        blocklist.manager.hideCurrentHost(pattern);
      });
    } else {
      $("#current-blocklink").html(
        '<p style="background:#dff0d8;color:#3c763d;padding:10px;">' +
        chrome.i18n.getMessage('completeBlocked', pattern) +
        '</p>');
    };
  });
}

blocklist.manager.handleRefreshBlockListResponse = function (response) {
  $("#manager-pattern-list").show('fast');

  let length = response.blocklist.length,
    listDiv = $('#manager-pattern-list');
  listDiv.empty();

  if (response.blocklist != undefined && length > 0) {
    blocklist.manager.addBlockCurrentHostLink(response.blocklist);

    for (let i = 0; i < length; i++) {
      var patRow = blocklist.manager.createBlocklistPattern(response.blocklist[i]);
      patRow.appendTo(listDiv);
    }
  } else {
    blocklist.manager.addBlockCurrentHostLink([]);
  }
}

blocklist.manager.refresh = function () {
  chrome.runtime.sendMessage({
    type: blocklist.common.GET_BLOCKLIST
  },
    blocklist.manager.handleRefreshBlockListResponse);
};

blocklist.manager.handleRefreshConfigResponse = function (response) {
  if (!response.configList)
    return;

  let length = response.configList.length;

  for (let i = 0; i < length; i++) {
    $("#"+response.configList[i].name).prop(
      response.configList[i].attribute,
      response.configList[i].value)
  }
}

blocklist.manager.refreshConfigs = function () {
  chrome.runtime.sendMessage({
    type: blocklist.common.GET_CONFIG
  },
    blocklist.manager.handleRefreshConfigResponse);
};

blocklist.manager.clickImportButton = function () {

  $("#io-head").text(chrome.i18n.getMessage('import'));

  let submitArea = $("#submit-area");
  submitArea.off('click');
  submitArea.text(chrome.i18n.getMessage("save"));
  $("#io-desc").text(chrome.i18n.getMessage('importDescription'));
  $("#io-text").val('');
  submitArea.on("click", function () {
    let pattern = $("#io-text").val();
    blocklist.manager.handleImportButton(pattern);
  });

  $("#io-area").css('display', 'block');
  $("#second_floor").toggleClass('second_floor-open');
};


blocklist.manager.handleImportButton = function (pattern) {
  chrome.runtime.sendMessage({
    type: blocklist.common.ADD_LIST_TO_BLOCKLIST,
    pattern: pattern
  },
    blocklist.manager.handleImportButtonResult);
}

blocklist.manager.handleImportButtonResult = function (response) {
  let showMessage = document.createElement('p');
  showMessage.style.cssText = 'background:#dff0d8;color:#3c763d;padding:10px;';
  showMessage.innerHTML = chrome.i18n.getMessage("completeAllBlocked");

  $('#submit-area').after(showMessage);

  setTimeout(function () {
    showMessage.style.visibility = "hidden";
  }, 1000);

  blocklist.manager.refresh();
}

blocklist.manager.clickExportButton = function () {
  chrome.runtime.sendMessage({
    type: blocklist.common.GET_BLOCKLIST
  },
    blocklist.manager.handleExportButton);
};

blocklist.manager.handleExportButton = function (response) {

  $("#io-head").text(chrome.i18n.getMessage('export'));

  $('#io-desc').text(chrome.i18n.getMessage('exportDescription'));
  let ioText = $("#io-text");
  let blocklist = response.blocklist;

  ioText.val('');
  for (let i = 0, length = blocklist.length; i < length; i++) {
    ioText.val(ioText.val() + blocklist[i] + "\n");
  }

  let submitArea = $("#submit-area");
  submitArea.off('click');
  submitArea.text(chrome.i18n.getMessage('copy'));
  submitArea.click(function () {
    ioText.select();
    document.execCommand('copy');
  });

  $("#io-area").css('display', 'block');
  $("#second_floor").toggleClass('second_floor-open');
}

blocklist.manager.clickConfigButton = function () {
  $("#PWS_config").text(chrome.i18n.getMessage('PWS_config'));

  let save_btn = $("#save_configs");
  save_btn.text(chrome.i18n.getMessage("save"));
  save_btn.on("click", function () {
    // Put saving configs here
    let configs = [];
    configs.push({
      name: 'PWS',
      attribute: 'checked',
      value: $("#PWS").prop('checked')
    });

    blocklist.manager.handleConfigButton(configs);
  });

  $("#config-area").css('display', 'block');
  $("#second_floor").toggleClass('second_floor-open');
};

blocklist.manager.handleConfigButton = function (configs) {
  chrome.runtime.sendMessage({
      type: blocklist.common.SAVE_CONFIG,
      configList: configs
    },
      blocklist.manager.handleConfigButtonResult);
};

blocklist.manager.handleConfigButtonResult = function (response) {
  let showMessage = document.createElement('p');
  showMessage.style.cssText = 'background:#dff0d8;color:#3c763d;padding:10px;';
  showMessage.innerHTML = chrome.i18n.getMessage("completeSaveConfig");

  $('#save_configs').after(showMessage);

  setTimeout(function () {
    showMessage.style.visibility = "hidden";
  }, 1000);
}

blocklist.manager.localizeHeader = function() {
  let blockListHeader = $("#blockListHeader");
  blockListHeader.html(chrome.i18n.getMessage("blockListHeader"));
}

blocklist.manager.createIoButton = function () {

  let export_btn = $("#export");
  export_btn.text(chrome.i18n.getMessage("export"));
  export_btn.on("click", function () {
    blocklist.manager.clickExportButton();
  });

  let import_btn = $("#import");
  import_btn.text(chrome.i18n.getMessage("import"));
  import_btn.on("click", function () {
    blocklist.manager.clickImportButton();
  });

  let config_btn = $("#config");
  config_btn.text(chrome.i18n.getMessage("config"));
  config_btn.on("click", function () {
    blocklist.manager.clickConfigButton();
  });
}

blocklist.manager.createBackButton = function () {
  $("#back").text(chrome.i18n.getMessage("back"))
  $("#back").on("click", function () {
    $("#second_floor").toggleClass('second_floor-open');

    // collapse all child div
    $("#second_floor").children(":not(#back)")
                      .each(
                        function(i, childDiv) {
                          $(this).css('display', 'none');
                        })
  });
}

document.addEventListener('DOMContentLoaded', function () {
  blocklist.manager.refresh();
  blocklist.manager.refreshConfigs();
  blocklist.manager.localizeHeader();
  blocklist.manager.createIoButton();
  blocklist.manager.createBackButton();
});
