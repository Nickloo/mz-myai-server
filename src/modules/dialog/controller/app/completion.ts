import { CoolController, BaseController } from '@cool-midway/core';
import { MessageEntity } from '../../entity/message';
import { Body, Inject, Post } from '@midwayjs/core';
import { Validate } from '@midwayjs/validate';
import { Context } from '@midwayjs/koa';
import { CompletionService } from '../../service/completion';
import { CompletionDTO } from '../../dto/completion';

/**
 * 描述
 */
@CoolController({
  api: [],
  entity: MessageEntity,
})
export class AppCompletionController extends BaseController {

  @Inject()
  ctx: Context

  @Inject()
  completionService: CompletionService

  /**
   * 发送聊天消息Stream
   */
  @Post('/stream')
  @Validate()
  async chatStream(@Body() body: CompletionDTO) {
    this.setSSEHeader()
    this.ctx.res.statusCode = 200
    await this.completionService.completionStreamDify(body)
  }

  @Post('/stopTask', { summary: '停止文本生成任务' })
  async stopChatTask(@Body('taskId') taskId: string) {
    const userId = this.ctx.user.id.toString()
    const res = await this.completionService.stopTask(taskId, userId)
    return this.ok(res.data)
  }

  public setSSEHeader() {
    this.ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })
  }
}
