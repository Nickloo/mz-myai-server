import { CoolController, BaseController, CoolUrlTag, TagTypes, CoolTag } from '@cool-midway/core';
import { Body, Config, Get, Inject, Post, Query } from '@midwayjs/core';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, AIMessage } from "langchain/schema";
import { RunnableSequence } from "langchain/schema/runnable";
import { BufferMemory, BufferWindowMemory, ChatMessageHistory } from "langchain/memory";
import { ChatPromptTemplate, MessagesPlaceholder, PromptTemplate } from "langchain/prompts";
import { ConversationChain, LLMChain } from "langchain/chains";
import { RedisChatMessageHistory } from "langchain/stores/message/ioredis";
import { Context } from '@midwayjs/koa';
// import { SearxngSearch } from "@langchain/community/tools/searxng_search";

/**
 * 描述
 */
@CoolUrlTag()
@CoolController()
export class AppLangChainController extends BaseController {

  @Inject()
  ctx: Context

  @Config('module.langChain.openai')
  openaiConfig: { key: string, baseURL: string }

  /**
   * 测试LangChain聊天
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/test')
  async test() {
    console.log(process.version)
    // const openai = new OpenAI({openAIApiKey: 'sk-xxx', base})
    // const response = await openai.generate(["Tell me a joke."])
    // return response
    const chat = new ChatOpenAI({ openAIApiKey: this.openaiConfig.key }, { baseURL: this.openaiConfig.baseURL })
    const response = await chat.call([
      new HumanMessage('你是谁？'),
    ])
    console.log(response)
    this.ctx.res.statusCode = 200
    // return this.ok(response)
    this.ctx.res.write(JSON.stringify(response), cb => {
      console.log('write done')

    })
    this.ctx.res.end()
  }

  @Post('/sse')
  @CoolTag(TagTypes.IGNORE_TOKEN)
  async handleSSE(@Body('str') str: string) {
    // 设置 SSE 相关的头信息
    this.ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })
    const chat = new ChatOpenAI(
      {
        // temperature: 0,
        openAIApiKey: this.openaiConfig.key,
        modelName: 'gpt-3.5-turbo',
        streaming: true,
      },
      { baseURL: this.openaiConfig.baseURL }
    )
    const stream = await chat.stream([
      new HumanMessage(str),
    ])
    this.ctx.res.statusCode = 200;
    // chat.call
    // 发送消息到客户端的函数
    const sendEvent = (data: any) => {
      this.ctx.res.write(`data:${JSON.stringify(data)}\n\n`)
    }
    for await (const chunk of stream) {
      console.log(chunk)
      sendEvent(chunk)
    }
    this.ctx.res.write(`data:[DONE]\n\n`)

    // 如果客户端断开连接，则清除定时器
    this.ctx.req.on('close', () => {
      this.ctx.res.end()
    })

    // return this.ctx.res.end()

    // 需要保持请求打开，不要调用 ctx.body 或 ctx.end
    // return new Promise(() => {}) // 返回一个永不resolve的Promise以保持连接
  }

  /**
   * 测试langchain的memory
   */
  @Post('/memory')
  @CoolTag(TagTypes.IGNORE_TOKEN)
  async memory(@Body('str') str = '你好') {
    const chat = new ChatOpenAI(
      { openAIApiKey: this.openaiConfig.key, modelName: 'gpt-3.5-turbo', },
      { baseURL: this.openaiConfig.baseURL })
    const chatPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.",
      ],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ]);

    const memory = new BufferMemory({
      chatHistory: new RedisChatMessageHistory({
        sessionId: '123', // Or some other unique identifier for the conversation
        sessionTTL: 300, // 5 minutes, omit this parameter to make sessions never expire
        url: "redis://localhost:6379", // Default value, override with your own instance's URL
      }),
      memoryKey: "history",
      returnMessages: true,
    })

    const chain = new ConversationChain({
      // memory: new BufferMemory({ returnMessages: true, memoryKey: "history" }),
      memory: memory,
      prompt: chatPrompt,
      llm: chat,
      verbose: true,
    });

    const response = await chain.call({ input: str })
    return this.ok(response)
  }

  @Post('/memorysse')
  @CoolTag(TagTypes.IGNORE_TOKEN)
  async memorysse(@Body('str') str = '你好') {
    // 设置SSE header信息
    this.setSSEHeader()
    // 初始化chat model
    const chat = new ChatOpenAI(
      { openAIApiKey: this.openaiConfig.key, modelName: 'gpt-3.5-turbo', },
      { baseURL: this.openaiConfig.baseURL })
    const chatPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.",
      ],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ]);

    const memory = new BufferMemory({
      chatHistory: new RedisChatMessageHistory({
        sessionId: '123', // Or some other unique identifier for the conversation
        sessionTTL: 300, // 5 minutes, omit this parameter to make sessions never expire
        url: "redis://localhost:6379", // Default value, override with your own instance's URL
      }),
      memoryKey: "history",
      returnMessages: true,
    })

    // const chain = new ConversationChain({
    //   // memory: new BufferMemory({ returnMessages: true, memoryKey: "history" }),
    //   memory: memory,
    //   prompt: chatPrompt,
    //   llm: chat,
    //   verbose: true,
    // });
    const chain = RunnableSequence.from([
      {
        input: (initialInput) => initialInput.input,
        memory: () => memory.loadMemoryVariables({}),
      },
      {
        input: (previousOutput) => previousOutput.input,
        history: (previousOutput) => previousOutput.memory.history,
      },
      chatPrompt,
      chat,
    ]);

    // const response = await chain.call({ input: str })
    const stream = await chain.stream({ input: str })
    // const stream = await chat.stream(str)
    this.ctx.res.statusCode = 200
    // chat.call
    // 发送消息到客户端的函数
    const sendEvent = (data: any) => {
      this.ctx.res.write(`data:${JSON.stringify(data)}\n\n`)
    }
    for await (const chunk of stream) {
      console.log(chunk)
      sendEvent(chunk)
    }
    this.ctx.res.write(`data:[DONE]\n\n`)

    // 如果客户端断开连接，则清除定时器
    this.ctx.req.on('close', () => {
      this.ctx.res.end()
    })

    // return this.ok(response)
  }

  @Post('/sse2')
  @CoolTag(TagTypes.IGNORE_TOKEN)
  async handleSSE2(@Body('str') str: string) {
    // 设置 SSE 相关的头信息
    this.baseCtx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    const chat = new ChatOpenAI({ openAIApiKey: this.openaiConfig.key }, { baseURL: this.openaiConfig.baseURL })
    const stream = await chat.stream([
      new HumanMessage(str),
    ])
    // 发送消息到客户端的函数
    const sendEvent = (data: string) => {
      this.baseCtx.res.write(`${data}`, 'utf-8')
    }

    // stream.


  }

  setSSEHeader() {
    this.ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })
  }
}
