var EventEmitter = require('events')
var querystring = require('querystring')
var urlParser = require('url')
var https = require('https')
var Encrypt = require('wechat-encrypt')
var xmlParser = new require('xml2js').Parser({
  explicitArray: false,
  explicitRoot: false
})

var Robot = function (options) {
  if (typeof options.getAccessToken !== 'function') {
    throw new TypeError('constructor() require getAccessToken function')
  }
  if (typeof options.onError == 'function') {
    this.on('error', options.onError)
  }
  this.encrypt = new Encrypt({
    appId: options.appId,
    encodingAESKey: options.encodingAESKey,
    token: options.token
  })
  this.getAccessToken = options.getAccessToken
  this.rules = options.rules || []
  this.sortRule()
  this.rules = this.parseRegexp(this.rules)
}

Robot.prototype = Object.create(EventEmitter.prototype)

var proto = {
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
  sortRule: function () {
    this.rules.sort(function (a, b) {
      return b.seq - a.seq
    })
  },
  handle: function (req, res, next) {
    next()
    var buffers = []
    var parseXmlCallback = function (err, result) {
      if (err) {
        return this.emit('error', err)
      }
      if (result.Encrypt) {
        var xml = this.encrypt.decode(result.Encrypt)
        return xmlParser.parseString(xml, parseXmlCallback.bind(this))
      }
      if (result.MsgType !== 'text') {
        return
      }
      var openId = result.FromUserName
      var content = result.Content
      var matches = this.match(content)
      var callback = function (err) {
        if (err) {
          this.emit('error', err)
        }
        matches.length > 0 && this.send(openId, matches.shift(), callback.bind(this))
      }
      this.send(openId, matches.shift(), callback.bind(this))
    }
    var onEnd = function () {
      var body = Buffer.concat(buffers).toString()
      xmlParser.parseString(body, parseXmlCallback.bind(this))
    }
    req.on('data', buffers.push.bind(buffers)).on('end', onEnd.bind(this))
  },
  middlewarify: function () {
    return this.handle.bind(this)
  },
  send: function (openId, item, callback) {
    var options = {
      touser: openId,
      msgtype: item.type || 'text'
    }
    switch(item.type) {
      default:
      case 'text':
        options.text = {
          content: item.content
        }
        break
      case 'image':
        options.image = {
          media_id: item.content
        }
    }
    this.sendMsg(options, callback)
  },
  match: function (text) {
    let reply = []
    this.rules.forEach(function (item) {
      return item.keywords.some(function (item2) {
        if (item2.test(text)) {
          reply.push(item.reply)
          return true
        }
      })
    })
    return reply
  },
  updateRules: function (rules) {
    this.rules = rules
    this.sortRule()
    this.rules = this.parseRegexp(this.rules)
  },
  sendMsg: function(options, callback) {
    var url = 'https://api.weixin.qq.com/cgi-bin/message/custom/send'
    var body = JSON.stringify(options)
    var requestCallback = function (res) {
      var buffers = []
      res.on('data', buffers.push.bind(buffers)).on('end', function () {
        var result = JSON.parse(Buffer.concat(buffers))
        if (result.errcode !== 0) {
          callback(new Error(result.errmsg))
        }
        callback()
      })
    }
    var getAccessTokenCallback = function(accessToken) {
      var query = {
        access_token: accessToken
      }
      var newUrl = url + '?' + querystring.stringify(query)
      var newOptions = urlParser.parse(newUrl)
      Object.assign(newOptions, {
        method: 'post',
        headers: {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(body)
        }
      })
      var req = https.request(newOptions, requestCallback)
      req.on('error', callback)
      req.write(body)
      req.end()
    }
    this.getAccessToken(getAccessTokenCallback.bind(this))
  }
}

Object.assign(Robot.prototype, proto)

module.exports = Robot