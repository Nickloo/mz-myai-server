import { Config, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from '../entity/message';
import { ModelService } from '../../model/service/model';
import { Context } from '@midwayjs/koa';
import { UserChatService } from '../../user/service/chat';
import { UserInfoService } from '../../user/service/info';
import { ChatClient, CompletionClient } from '../../../libs/dify/difySdk';
import { ChatService } from './chat';
import { CompletionDTO } from '../dto/completion';
import { PromptAppService } from '../../promptApp/service/apps';
import { ModelEntity } from '../../model/entity/model';
import { DIALOG_MODE } from '../../../comm/types';
import { CoolCache } from '@cool-midway/core';

/**
 * 文本补全
 */
@Provide()
export class CompletionService extends BaseService {
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
  chatService: ChatService

  @Inject()
  appService: PromptAppService

  @Config('module.langChain.openai')
  openaiConfig: { key: string, baseURL: string }

  /**
   * 文本生成steam
   */
  async completionStreamDify(params: CompletionDTO) {
    const { appId, modelId, inputs, temperatureMode } = params
    // const modelConfig = await this.getModelConfig(modelId, appId, DIALOG_MODE.COMPLETION)
    const modelInfo = await this.modelService.getModelInfo(modelId)
    if (modelInfo.status == 0) throw new Error('模型不存在')
    // 获取合并的modelConfig
    const modelConfig = this.chatService.mergeModelConfig(modelInfo, temperatureMode)
    const appSecret = await this.appService.getAppSecret(appId)
    // const model = await 
    const userId = this.ctx.user.id
    // 校验用户对话权限
    await this.userChatService.checkChatQuota(userId, 1)
    const content = JSON.stringify(inputs)
    // 存上用户message
    await this.messageEntity.save({
      content, type: 1, userId, senderId: userId, senderType: 1, appType: 2, appId,
      modelName: modelConfig.model.name
    })
    // 调用Dify的API
    const chatClient = new CompletionClient(appSecret)
    const response = await chatClient.createCompletionMessage(inputs, userId, true, modelConfig)
    const stream = response.data;
    let responseStr = ''
    for await (const chunk of stream) {
      let str = chunk.toString()
      responseStr += str
      this.ctx.res.write(str)
    }
    const { AIOutput } = this.chatService.getOutputAndCid(responseStr)
    // 存上AI message
    await this.messageEntity.save({
      content: AIOutput, type: 1, userId, senderId: null, senderType: 2, appType: 2, appId,
      modelName: modelConfig.model.name
    })
    // 获取模型消耗的电量
    const dianliang = modelInfo.dianliang
    // 减去用户聊天消耗电量
    await this.userService.deductUserDianliang(userId, dianliang)
  }

  /**
   * 组合modelConfig
   * 组合dify的app param和 model
   * model是模型name和创造性的一些参数
   */
  @CoolCache(60)
  async getModelConfig(modelId: number, appId: string, mode: DIALOG_MODE) {
    const appInfo = await this.appService.info(appId)
    const appConfig = appInfo.appConfig
    // 获取model name provider
    const modelInfo = await ModelEntity.findOneBy({ id: modelId, status: 1 })
    if (!modelInfo) throw Error('模型不存在')
    const { name, provider } = modelInfo
    return {
      model: {
        provider,
        name,
        mode,
        completion_params: {
          temperature: 0.5
        }
      },
      ...appConfig
    }
  }

  async stopTask(taskId: string, userId: string) {
    const appSecret = await this.appService.getDefaultAppSecret()
    const chatClient = new ChatClient(appSecret)
    return await chatClient.stopCompletion(taskId, userId)
  }

  /**
   * 为了后面能拿到appInfo，节省请求次数
   * @param modelId 
   * @param appId 
   * @returns 
   */
  async getModelConfigAndAppInfo(modelId: number, appId: string, mode: DIALOG_MODE) {
    const appInfo = await this.appService.info(appId)
    const modelConfig = await this.getModelConfig(modelId, appId, mode)
    return { modelConfig, appInfo }
  }
}
