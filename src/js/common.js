let blocklist = {};

blocklist.common = {};

blocklist.common.GET_BLOCKLIST = 'getBlocklist';
blocklist.common.ADD_TO_BLOCKLIST = 'addToBlocklist';
blocklist.common.ADD_LIST_TO_BLOCKLIST = 'addListToBlocklist';
blocklist.common.DELETE_FROM_BLOCKLIST = 'deleteFromBlocklist';
blocklist.common.GET_CONFIG = 'getConfig';
blocklist.common.SAVE_CONFIG = 'saveConfig';

blocklist.common.HOST_REGEX = new RegExp(
  '^https?://(www[.])?([0-9a-zA-Z.-]+).*$');

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
