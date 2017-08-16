# wechat-reply

微信关键字自动回复。

### Usage

```bash
npm install @neuroo_fe/wechat-reply -S
```

```javascript
const app = require('express')()
const wechat = require('wechat')
const Reply = require('@neuroo_fe/wechat-reply')
const reply = new Reply([
  {
    name: '规则1',
    keywords: ['包含', '^匹配开头', '匹配结尾$', '^全匹配$', '模糊.*匹配。?'],
    seq: 0,
    reply: {
      type: 'text',
      content: '回复内容1'
    }
  }
])

const config = {
  appId: '',
  encodingAESKey: '',
  token: ''
}

app.use(wechat(config).text(reply.handle).middlewarify())
```

> 目前仅支持回复文本，且依赖`wechat`包。

### 方法

- [Reply](#reply)
- [handle](#handle)
- [updateRules](#updaterules)

#### Reply

`new Reply([rules])` 构造函数。传入数组。

##### rules 内对象属性

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| name | String | 是 | 规则名称 |
| keywords | Array | 是 | 字符串数组。用于生成`RegExp`对象,因此内容需符合RegExp规则。 |
| seq | Number | 是 | 规则优先级。值越小越靠前。 |
| reply | Object | 是 | 包含回复内容和格式的对象。 |

##### reply 对象属性

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| type | String | 是 | 回复内容的格式。目前仅支持`text`。 |
| content | String | 是 | 回复的文本内容。 |

#### handle

`handle(message, req, res, next)` 处理函数。传入`wechat`模块的`text()`方法回调内的参数列表。

```javascript
const config = {
  appId: '',
  encodingAESKey: '',
  token: ''
}

app.use(wechat(config).text(reply.handle).middlewarify())
```

#### updateRules

`updateRules(rules)` 更新自动回复内的规则。传入新的规则列表会完全覆盖旧的规则。

##### 参数

同构造函数一样。

```javascript
const Reply = require('@neuroo_fe/wechat-reply')
const reply = new Reply()
reply.updateRules([
  {
    name: '新规则',
    ...
  }
])
```