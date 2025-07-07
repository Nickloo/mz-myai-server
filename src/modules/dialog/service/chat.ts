import { Config, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from '../entity/message';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatPromptTemplate, MessagesPlaceholder } from 'langchain/prompts';
import { BufferMemory } from 'langchain/memory';
import { RedisChatMessageHistory } from 'langchain/stores/message/ioredis';
// import { ConversationChain } from 'langchain/chains';
import { DIALOG_MODE, DIALOG_MODE_TYPE } from '../../../comm/types';
import { SystemMessage } from 'langchain/schema';
import { RunnableSequence } from 'langchain/schema/runnable';
import { Context } from '@midwayjs/koa';
import { ChatDTO } from '../dto/chat';
import { DialogEntity } from '../entity/dialog';
import { UserChatService } from '../../user/service/chat';
import { ModelService } from '../../model/service/model';
import { UserInfoService } from '../../user/service/info';
import { ChatClient, DifyClient } from '../../../libs/dify/difySdk';
import { CompletionService } from './completion';
import { PromptAppDifyEntity } from '../../promptApp/entity/appDify';
import { ModelEntity } from '../../model/entity/model';
import { UserAppsEntity } from '../../user/entity/apps';
import { TemperatureModeEnum, modelTemperatureParams } from '../../../comm/config';
import { PromptAppService } from '../../promptApp/service/apps';

/**
 * 聊天service
 */
@Provide()
export class ChatService extends BaseService {

  @InjectEntityModel(MessageEntity)
  messageEntity: Repository<MessageEntity>;

  @Inject()
  modelService: ModelService

  @Inject()
  ctx: Context

  @Inject()
  userChatService: UserChatService

  @Inject()
  userService: UserInfoService

  @Inject()
  completionService: CompletionService

  @Inject()
  appService: PromptAppService

  @Config('module.langChain.openai')
  openaiConfig: { key: string, baseURL: string }

  /**
   * 流式聊天
   * 默认使用gpt3.5模型
   * v1版仅支持ChatGPT
   */
  async chatStreamV1(params: ChatDTO) {
    const { modelId, content = '', dialogId } = params
    const { name: modelName } = await ModelEntity.findOneBy({ id: modelId })
    // const model = await 
    const userId = this.ctx.user.id
    // 校验用户对话权限
    await this.userChatService.checkChatQuota(userId, 1)
    // 存上用户message
    await this.messageEntity.save({
      content,
      dialogId,
      type: 1,
      userId,
      senderId: userId,
      senderType: 1,
    })
    const chat = new ChatOpenAI(
      { openAIApiKey: this.openaiConfig.key, modelName },
      { baseURL: this.openaiConfig.baseURL })
    const chatPrompt = ChatPromptTemplate.fromMessages([
      new SystemMessage('你是麦子科技旗下的AI聊天机器人妙言AI，可以叫你小妙，你需要帮助用户回答各种问题，用人类的语气'),
      [
        "system",
        "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.",
      ],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ]);

    // 记住最新的几条
    // TODO：优化记忆策略
    const memory = new BufferMemory({
      chatHistory: new RedisChatMessageHistory({
        sessionId: dialogId, // Or some other unique identifier for the conversation
        // sessionTTL: 300, // 5 minutes, omit this parameter to make sessions never expire
        url: "redis://localhost:6379", // Default value, override with your own instance's URL
      }),
      memoryKey: "history",
      returnMessages: true,
    })
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
    ])
    // 存AI回答
    let AIOutput = ''
    const inputValue = { input: content }
    // const response = await chain.call({ input: str })
    // 流式请求
    const stream = await chain.stream(inputValue)
    for await (const chunk of stream) {
      // console.log(chunk)
      this.sendMsgToClient(chunk)
      AIOutput += chunk.content
    }
    await memory.saveContext(inputValue, {
      output: AIOutput,
    });
    // 存上AI message
    await this.messageEntity.save({
      content: AIOutput,
      dialogId,
      type: 1,
      userId,
      senderId: null, // bot
      senderType: 2,
    })
    // update dialog lastestMessage
    await DialogEntity.update({ id: dialogId }, { lastestMessage: AIOutput.substring(0, 30) })
    this.sendEndMsgToClient()
    // 获取模型消耗的电量
    const dianliang = await this.modelService.getModelDianliang(modelId)
    // 减去用户聊天消耗电量
    await this.userService.deductUserDianliang(userId, dianliang)
  }

  /**
   * 通过Dify_api的流式chat
   * 主聊天逻辑
   * 默认是妙言AIapp
   * 24.1.5 支持传递模型创意度
   * @param params 
   */
  async chatStreamDify(params: ChatDTO) {
    const { modelId, content = '', dialogId, appId, temperatureMode } = params
    let appInfo: PromptAppDifyEntity
    if (appId) {
      appInfo = await PromptAppDifyEntity.findOneBy({ id: appId })
      if (!appInfo) throw new Error('app不存在')
    } else {
      appInfo = await PromptAppDifyEntity.findOneBy({ isDefault: 1 })
    }
    const modelInfo = await this.modelService.getModelInfo(modelId)
    if (modelInfo.status == 0) throw new Error('模型不存在')
    // 获取合并的modelConfig
    const modelConfig = this.mergeModelConfig(modelInfo, temperatureMode)
    // const modelConfig = await this.completionService.getModelConfig(modelId, appInfo.id, DIALOG_MODE.CHAT)
    const userId = this.ctx.user.id
    // 校验用户对话权限
    await this.userChatService.checkChatQuota(userId, modelId)
    // 调用Dify的API
    const { appSecret } = appInfo
    const chatClient = new ChatClient(appSecret)
    const response = await chatClient.createChatMessage({}, content, userId, true, dialogId, modelConfig)
    const stream = response.data;
    let responseStr = ''
    for await (const chunk of stream) {
      // 将buffer转成string
      // str = 'data: {"event": "message", "task_id": "0120a8f7-a856-4620-8139-48a63f3e2373", "id": "709b22e6-f611-48ec-8dd5-578a06f395d1", "answer": "", "created_at": 1700726466, "conversation_id": "670766d8-c6e5-42e7-af4a-c834e88246f3"}\n\n'
      let str = chunk.toString()
      responseStr += str
      this.ctx.res.write(str)
    }
    const { AIOutput, conversation_id } = this.getOutputAndCid(responseStr)
    // 存上用户message
    await this.messageEntity.save({
      content, dialogId: conversation_id, type: 1, userId, senderId: userId, senderType: 1,
      appType: DIALOG_MODE_TYPE.CHAT, appId: appInfo.id, modelName: modelConfig.model.name
    })
    // 存上AI message
    await this.messageEntity.save({
      content: AIOutput, dialogId: conversation_id, type: 1, userId, senderId: null, senderType: 2,
      appType: DIALOG_MODE_TYPE.CHAT, appId: appInfo.id, modelName: modelConfig.model.name, dianliang: modelInfo.dianliang
    })
    const lastestMessage = this.getLastMessage(AIOutput) // 取30个字

    // if no conversation_id, create a new dialog
    if (!dialogId) {
      const title = content.substring(0, 30)
      await DialogEntity.save({
        id: conversation_id, title, type: 1, userId, appId: appInfo.id,
        lastestMessage
      })
    }
    // update myApps lastestMessage
    UserAppsEntity.update({ appId: appInfo.id, userId }, { lastestMessage, lastestDialogId: dialogId })
    // update dialog lastestMessage
    DialogEntity.update({ id: dialogId }, { lastestMessage })
    // this.sendEndMsgToClient()
    // 获取模型消耗的电量
    const dianliang = modelInfo.dianliang
    // 减去用户聊天消耗电量
    await this.userService.deductUserDianliang(userId, dianliang)
  }

  async stopTask(taskId: string, userId: string) {
    const appSecret = await this.appService.getDefaultAppSecret()
    const chatClient = new ChatClient(appSecret)
    return await chatClient.stopChat(taskId, userId)
  }

  async saveUserAIMessage(userMsg: string, aiMessage: string, dialogId) {

  }

  sendMsgToClient(data: any) {
    this.ctx.res.write(`data:${JSON.stringify(data)}\n\n`)
  }

  sendMsgToClient2(data: any) {
    this.ctx.res.write(data)
  }

  sendEndMsgToClient() {
    this.ctx.res.write(`OK`)
    this.ctx.res.end()
  }

  getOutputAndCid(responseStr: string) {
    // 跟进换行符\n\n分割responseStr
    const responseArr = responseStr.split('\n\n')
    let AIOutput = ''
    let conversation_id = ''
    // 循环解析responseStr
    for (let i = 0; i < responseArr.length; i++) {
      let str = responseArr[i]
      // 取data:后面的json
      if (str.startsWith('data:')) {
        const jsonStr = str.substring(5).trim() // 去掉'data:'并去除两端空白字符
        const jsonData = JSON.parse(jsonStr)
        if (jsonData.event === 'message') { // event can be 'message' or 'message_end'
          // 在这里处理收到的JSON数据
          AIOutput += jsonData.answer
          conversation_id = jsonData.conversation_id
        }
      }
    }
    return { AIOutput, conversation_id }
  }

  /**
   * 去掉空行，然后取30个字
   * @param output 
   * @returns 
   */
  getLastMessage(output: string) {
    return output.replace(/\n/g, '').substring(0, 30)
    // return output.trim().substring(0, 30)
  }

  mergeModelConfig(modelInfo: ModelEntity, temperatureMode: TemperatureModeEnum) {
    const temperatureParams = this.getModelTemperatureParams(temperatureMode)
    // 合并模型config
    return {
      model: {
        provider: modelInfo.provider,
        name: modelInfo.name,
        mode: DIALOG_MODE.CHAT,
        completion_params: {
          ...temperatureParams
          // max_token由dify合并
        }
      }
    }
  }

  /**
   * 获取模型温度配置
   * @param mode 
   */
  getModelTemperatureParams(mode: TemperatureModeEnum) {
    const params = modelTemperatureParams[mode]
    return params || modelTemperatureParams["balance"]
  }

  async suggested(message_id: string, userId?: string) {
    const appSecret = await this.appService.getDefaultAppSecret();
    const chatClient = new ChatClient(appSecret);
    return chatClient.suggested(message_id, userId);
  }

}
