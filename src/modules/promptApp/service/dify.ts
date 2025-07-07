import { ALL, Config, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import axios from 'axios';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { PromptAppDifyEntity } from '../entity/appDify';
import { CoolFile } from '@cool-midway/file';
import { v1 as uuid } from 'uuid';
import { merge } from 'lodash';
@Provide()
export class PromptDifyService extends BaseService {
  @Inject()
  file: CoolFile;

  @InjectEntityModel(PromptAppDifyEntity)
  promptAppEntity: Repository<PromptAppDifyEntity>;

  @Config(ALL)
  config;

  /**
   * 批量添加应用
   * @param list - 要添加的列表
   * @param difyToken - dify token
   */
  async addList(list: any[], difyToken: string, difyBaseUrl?: string) {
    let baseUrl = difyBaseUrl || this.config.dify.host;
    let difyList = [];
    let errorList = [];
    // mode对照
    let modeMap = {
      1: 'chat',
      2: 'completion',
    };
    for (let index = 0; index < list.length; index++) {
      const appData = list[index];
      // 上传icon
      if (appData.isDownloadIcon) {
        appData.icon = await this.file.downAndUpload(
          appData.icon,
          uuid() + '.png'
        );
      }

      try {
        if (appData.difyData) {
          let difyAuthorization = `Bearer ${difyToken}`;
          console.log('开始创建dify应用', appData.difyData.name);
          // 创建应用
          let difyRes = await axios({
            method: 'post',
            headers: {
              Authorization: difyAuthorization,
            },
            url: `${baseUrl}/console/api/apps`,
            data: {
              name: appData.difyData.name,
              icon: appData.difyData.icon || '🤖',
              icon_background: appData.difyData.icon_background || '#FFEAD5',
              mode: appData.difyData.mode || modeMap[appData.type],
            },
          });

          let modelConfig = merge({}, difyRes.data.model_config, {
            ...appData.difyData.modelConfig,
            pre_prompt:
              appData.difyData.modelConfig.pre_prompt || appData.prePrompt,
          });
          modelConfig.user_input_form =
            appData.difyData.modelConfig.user_input_form ||
            [
              // {
              //   'text-input': {
              //     label: 'title',
              //     variable: 'title',
              //     required: true,
              //     max_length: 48,
              //     default: '',
              //   },
              // },
            ];
          console.log('开始更新dify应用', difyRes.data.id, modelConfig);
          // 更新应用
          await axios({
            method: 'post',
            headers: {
              Authorization: difyAuthorization,
            },
            url: `${baseUrl}/console/api/apps/${difyRes.data.id}/model-config`,
            data: modelConfig,
          });

          console.log('开始生成api密钥', difyRes.data.id);
          // 生成api密钥
          let apiKeyRes = await axios({
            method: 'post',
            headers: {
              Authorization:
                `Bearer ${difyToken}`,
            },
            url: `${baseUrl}/console/api/apps/${difyRes.data.id}/api-keys`,
          });

          appData.difyAppId = difyRes.data.id;
          appData.appSecret = apiKeyRes.data.token;
          difyList.push(difyRes.data);
        }
        console.log('开始保存应用');
        await this.promptAppEntity.save(appData);
      } catch (error) {
        console.log('创建失败', error);
        errorList.push({ appData, error });
      }
    }
    return { difyList, errorList };
  }

  async syncAppFromOther(params: any) {
    let res = await axios.get(params.url);
    return res.data.data.list;
  }

  async getAppFromOther(params: any) {
    let res = await axios.get(params.url);
    return res.data.data.list;
  }

  // 代理
  async proxy(options: {
    token: string;
    method: string;
    headers?: any;
    url: string;
    data?: any;
    params?: any;
  }) {
    let res = await axios({
      headers: {
        Authorization: `Bearer ${options.token}`,
        ...(options.headers || {}),
      },
      method: options.method,
      url: this.config.dify.host + options.url,
      data: options.data || {},
      params: options.params || {},
    });
    return res.data;
  }
}
