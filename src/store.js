"use strict";

// Attempt to create a new shortcode pointing to given `url`.
// Returns false if `code` is already in use.
exports.create = function *(db, code, url) {
  const result = yield db.hsetnx(code, "url", url);
  const created = result === 1;

  if (created) {
    // Init shortcode stats
    db.hmset(code, {
      startDate: (new Date()).toISOString(),
      redirectCount: 0
    });
  }

  return created;
};

// Get URL for given `code` if it exists, or null.
exports.find = function *(db, code) {
  const url = yield db.hget(code, "url");

  if (url) {
    // Update shortcode stats
    db.batch()
      .hset(code, "lastSeenDate", (new Date()).toISOString())
      .hincrby(code, "redirectCount", 1)
      .exec();
  }

  return url;
};

// Get stats object for given `code` if it exists, or null.
exports.stats = function *(db, code) {
  const stats = yield db.hgetall(code);

  return stats;
};
