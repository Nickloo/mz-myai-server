interface qrCodeTicketResponse {
  ticket: string;
  expire_seconds: number;
  url: string;
  errcode?: number;
  errmsg?: string;
}

// 扫描带参数二维码事件
interface scanEventData {
  ToUserName: string[];
  FromUserName: string[];
  CreateTime: string[];
  MsgType: string[];
  Event: string[];
  EventKey: string[];
  Ticket: string[];
}
// 微信用户信息(含unionid)
interface wxUserInfoResponse {
  subscribe: number;
  openid: string;
  language: string;
  subscribe_time: number;
  unionid: string;
  remark: string;
  groupid: number;
  tagid_list: number[];
  subscribe_scene: string;
  qr_scene: number;
  qr_scene_str: string;
}
