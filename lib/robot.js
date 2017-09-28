var Robot = function (rules) {
  rules = rules || []
  this.rules = this.sort(rules)
  this.rules = this.parseRegexp(this.rules)
  this.handle = this._handle.bind(this)
}

Robot.prototype = {
  parseRegexp: function (rules) {
    return rules.filter(function (rule) {
      if (!Array.isArray(rule.keywords)) {
        return false
      }
      rule.keywords = rule.keywords.map(function (item) {
        if (typeof item === 'string') {
          return new RegExp(item.replace(/\//g, ''), 'i')
        }
        return item
      })
      return true
    })
  },
  sort: function (rules) {
    rules.concat().sort(function (a, b) {
      return b.seq - a.seq
    })
    return rules
  },
  _handle: function (message, req, res, next) {
    const text = message.Content
    const reply = this.match(text)
    if (!reply) {
      return next()
    }
    res.reply(reply)
  },
  match: function (text) {
    let reply = null
    this.rules.some(function (item) {
      return item.keywords.some(function (item2) {
        if (item2.test(text)) {
          reply = item.reply
          return true
        }
      })
    })
    return reply
  },
  updateRules: function (rules) {
    this.rules = this.sort(rules)
    this.rules = this.parseRegexp(this.rules)
  }
}

module.exports = Robot