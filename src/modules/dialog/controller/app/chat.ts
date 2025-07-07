import { CoolController, BaseController } from '@cool-midway/core';
import { MessageEntity } from '../../entity/message';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { ChatService } from '../../service/chat';
import { Validate } from '@midwayjs/validate';
import { ChatDTO } from '../../dto/chat';
import { Context } from '@midwayjs/koa';

/**
 * 描述
 */
@CoolController({
  api: [],
  entity: MessageEntity,
})
export class AppChatController extends BaseController {

  @Inject()
  ctx: Context

  @Inject()
  chatService: ChatService

  /**
   * 发送聊天消息Stream
   */
  @Post('/stream')
  @Validate()
  async chatStream(@Body() body: ChatDTO) {
    this.setSSEHeader()
    this.ctx.res.statusCode = 200
    await this.chatService.chatStreamDify(body)
  }

  @Post('/stopTask', { summary: '停止聊天任务' })
  async stopChatTask(@Body('taskId') taskId: string) {
    const userId = this.ctx.user.id.toString()
    const res = await this.chatService.stopTask(taskId, userId)
    return this.ok(res.data)
  }

  /**
   * 发送聊天消息Stream
   */
  @Get('/suggested')
  async suggested(@Query('messageId') messageId: string) {
    const userId = this.ctx.user.id.toString()
    let res = await this.chatService.suggested(messageId, userId);
    return this.ok(res.data);
  }

  setSSEHeader() {
    this.ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })
  }
}
