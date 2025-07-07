import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from '../entity/document';

/**
 * 描述
 */
@Provide()
export class DocumentService extends BaseService {
  @InjectEntityModel(DocumentEntity)
  documentEntity: Repository<DocumentEntity>;

  /**
   * 描述
   */
  async infoByKey(key) {
    return await this.documentEntity.findOne({ where: { key } });
  }
}
