var Robot = function (rules) {
  rules = rules || []
  this.rules = this.sort(rules)
  this.rules = this.parseRegexp(this.rules)
}

Robot.prototype = {
  parseRegexp: function (rules) {
    rules = JSON.parse(JSON.stringify(rules))
    rules.forEach(function (rule) {
      if (!rule.keywords) {
        return
      }
      rule.keywords = rule.keywords.map(function (item) {
        if (typeof item === 'string') {
          return new RegExp(item.replace(/\//g, ''), 'i')
        }
        return item
      })
    })
    return rules
  },
  sort: function (rules) {
    rules.concat().sort(function (a, b) {
      return b.seq - a.seq
    })
    return rules
  },
  handle: function (client, message, req, res, next) {
    var isReply = false
    this.rules.forEach(function (rule) {
      if (isReply) {
        return
      }
      rule.keywords.forEach(function (item) {
        if (isReply) {
          return
        }
        if (item.test(message.Content)) {
          client.sendText(message.FromUserName, rule.reply.content)
          isReply = true
        }
      })
    })
    if (!isReply) {
      next()
    }
  },
  updateRules: function (rules) {
    this.rules = this.sort(rules)
    this.rules = this.parseRegexp(this.rules)
  }
}

module.exports = Robot