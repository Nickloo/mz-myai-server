import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ModelEntity } from '../entity/model';

/**
 * 描述
 */
@Provide()
export class ModelService extends BaseService {

  @InjectEntityModel(ModelEntity)
  modelEntity: Repository<ModelEntity>;

  /**
   * 获取模型消耗的电量
   */
  async getModelDianliang(modelId: number) {
    const model = await this.modelEntity.findOneBy({ id: modelId })
    if (!model) throw new Error('模型不存在')
    return model.dianliang
  }

  async getModelInfo(modelId: number) {
    const model = await this.modelEntity.findOneBy({ id: modelId })
    if (!model) throw new Error('模型不存在')
    return model
  }
}
