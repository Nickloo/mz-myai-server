# 开发的一些杂记

如何处理新建消息？
目前dify没有新建对话，在新建一个空对话时，会返回一个conversation_id

Dify的chat最少传参

```js
{
    "content": "最好的的10款pc游戏",
    "dialogId": "",
    "modelConfig": {
        "pre_prompt": "请将以下文本翻译为{{target_language}}:\n{{query}}\n翻译:",
        "model": {
            "provider": "openai",
            "name": "gpt-4",
            "mode": "chat",
            "completion_params": {
                "temperature": 0.5
            }
        }
    },
    "contentType": "1"
}
```

pre_prompt 必须带这个字段
