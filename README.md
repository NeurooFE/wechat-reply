# wechat-reply

微信关键字自动回复。

### Usage

```bash
npm install @neuroo_fe/wechat-reply -S
```

```javascript
const app = require('express')()
const Reply = require('@neuroo_fe/wechat-reply')
const options = {
  appId: '',
  encodingAESKey: '',
  token: '',
  rules: [
    {
      keywords: ['包含', '^匹配开头', '匹配结尾$', '^全匹配$', '模糊.*匹配。?'],
      reply: {
        type: 'text',
        content: '回复内容1'
      }
    }
  ],
  getAccessToken (callback) {
    callback(access_token)
  },
  onError (err) {
    console.error(err)
  }
}
const reply = new Reply(options)

app.post('/wechat', reply.middlewarify())
```

### options 对象属性

| 名称             | 类型       | 必填   | 描述                  |
| -------------- | -------- | ---- | ------------------- |
| appId          | String   | 是    | 微信公众号appId          |
| encodingAESKey | String   | 是    | 微信公众号encodingAESKey |
| token          | String   | 是    | 微信公众号token          |
| rules          | Array    | 否    | [规则数组](#rules)      |
| getAccessToken | Function | 是    | 获取微信access_token函数  |
| onError        | Function | 否    | 错误处理函数              |

### rules

| 名称       | 类型     | 必填   | 描述                                      |
| -------- | ------ | ---- | --------------------------------------- |
| keywords | Array  | 是    | 字符串数组。用于生成`RegExp`对象,因此内容需符合`RegExp`规则。 |
| reply    | Object | 是    | [回复内容](#reply)                          |
| seq      | Number | 否    | 规则优先级。值越大越靠前。                           |
| name     | String | 否    | 规则名称                                    |

### reply

| 名称      | 类型     | 必填   | 描述                        |
| ------- | ------ | ---- | ------------------------- |
| type    | String | 是    | 回复内容的格式。支持`text`、`image`。 |
| content | String | 是    | 回复的内容。                    |

### 方法

#### Middlewarify

导出中间件函数。

```
app.post('/wechat', reply.middlewarify())
```

#### updateRules

`updateRules(rules)` 更新规则。传入新的规则列表会完全覆盖旧的规则。

### [参数](#rules)

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