import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
// export const BASE_URL = "https://api.dify.ai/v1";
// export const BASE_URL = "http://107.150.102.219:5001/v1";
// export const BASE_URL = "http://127.0.0.1:5001/v1";
// export const BASE_URL = "http://107.150.102.219/v1";
// export const BASE_URL = "http://api.dify.miaoyanai.com/v1";
export const BASE_URL = "http://127.0.0.1:8088/v1";

export interface Route {
  method: string;
  url: (params?: any) => string;
}

export const routes: Record<string, Route> = {
  application: {
    method: "GET",
    url: () => `/parameters`,
  },
  feedback: {
    method: "POST",
    url: (message_id) => `/messages/${message_id}/feedbacks`,
  },
  createCompletionMessage: {
    method: "POST",
    url: () => `/completion-messages`,
  },
  createChatMessage: {
    method: "POST",
    url: () => `/chat-messages`,
  },
  getConversationMessages: {
    method: "GET",
    url: () => `/messages`,
  },
  getConversations: {
    method: "GET",
    url: () => `/conversations`,
  },
  renameConversation: {
    method: "PATCH",
    url: (conversation_id) => `/conversations/${conversation_id}`,
  },
  deleteConversation: {
    method: "DELETE",
    url: (conversation_id) => `/conversations/${conversation_id}`,
  },
  fileUpload: {
    method: "POST",
    url: () => `/files/upload`,
  },
  stopChat: {
    method: "POST",
    url: (task_id) => `/chat-messages/${task_id}/stop`,
  },
  stopCompletion: {
    method: "POST",
    url: (task_id) => `/completion-messages/${task_id}/stop`,
  },
  suggested: {
    method: 'GET',
    url: message_id => `/messages/${message_id}/suggested`,
  }
};

export class DifyClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  updateApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async sendRequest<T>(
    method: string,
    endpoint: string,
    data: any = null,
    params: any = null,
    stream = false,
    headerParams: any = {}
  ): Promise<AxiosResponse<T>> {
    const headers: AxiosRequestConfig["headers"] = {
      ...{
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      ...headerParams
    };

    const url = `${this.baseUrl}${endpoint}`;
    let response: AxiosResponse<T>;
    if (stream) {
      response = await axios({
        method,
        url,
        data,
        params,
        headers,
        responseType: "stream",
      });
    } else {
      response = await axios({
        method,
        url,
        data,
        params,
        headers,
        responseType: "json",
      });
    }

    return response;
  }

  messageFeedback(message_id: string, rating: number, user: string) {
    const data = {
      rating,
      user,
    };
    return this.sendRequest(
      routes.feedback.method,
      routes.feedback.url(message_id),
      data
    );
  }

  getApplicationParameters(user: string) {
    const params = { user };
    return this.sendRequest<AppConfig>(
      routes.application.method,
      routes.application.url(),
      null,
      params
    );
  }

  fileUpload(data: any) {
    return this.sendRequest(
      routes.fileUpload.method,
      routes.fileUpload.url(),
      data,
      null,
      false,
      {
        "Content-Type": 'multipart/form-data'
      }
    );
  }
}

export class CompletionClient extends DifyClient {
  createCompletionMessage(inputs: any, user: string, stream = false, modelConfig: ModelConfig, files: any = null) {
    const data = {
      inputs,
      user,
      response_mode: stream ? "streaming" : "blocking",
      files,
      model_config: modelConfig,
      is_override_config: false
    };
    return this.sendRequest<any>(
      routes.createCompletionMessage.method,
      routes.createCompletionMessage.url(),
      data,
      null,
      stream
    );
  }
}

export class ChatClient extends DifyClient {
  createChatMessage(inputs: any, query: string, user: string, stream = false, conversation_id: string | null = null, model_config: any, files: any = null) {
    const data = {
      inputs,
      query,
      user,
      response_mode: stream ? "streaming" : "blocking",
      files,
      conversation_id: conversation_id || '',
      model_config,
      is_override_config: false // 不覆盖difyapp的config
    };

    return this.sendRequest<any>(
      routes.createChatMessage.method,
      routes.createChatMessage.url(),
      data,
      null,
      stream
    );
  }

  getConversationMessages(
    user: string,
    conversation_id: string = "",
    first_id: string | null = null,
    limit: number | null = null
  ) {
    const params: any = { user };

    if (conversation_id) params.conversation_id = conversation_id;

    if (first_id) params.first_id = first_id;

    if (limit) params.limit = limit;

    return this.sendRequest(
      routes.getConversationMessages.method,
      routes.getConversationMessages.url(),
      null,
      params
    );
  }

  getConversations(user: string, first_id: string | null = null, limit: number | null = null, pinned: boolean | null = null) {
    const params: any = { user, first_id: first_id, limit, pinned };
    return this.sendRequest(
      routes.getConversations.method,
      routes.getConversations.url(),
      null,
      params
    );
  }

  renameConversation(conversation_id: string, name: string, user: string) {
    const data = { name, user };
    return this.sendRequest(
      routes.renameConversation.method,
      routes.renameConversation.url(conversation_id),
      data
    );
  }

  deleteConversation(conversation_id: string, user: string) {
    const data = { user };
    return this.sendRequest(
      routes.deleteConversation.method,
      routes.deleteConversation.url(conversation_id),
      data
    );
  }

  stopChat(task_id: string, user: string) {
    const data = { user };
    return this.sendRequest(
      routes.stopChat.method,
      routes.stopChat.url(task_id),
      data
    );
  }

  stopCompletion(task_id: string, user: string) {
    const data = { user };
    return this.sendRequest(
      routes.stopCompletion.method,
      routes.stopCompletion.url(task_id),
      data
    );
  }

  suggested(message_id: string,) {
    return this.sendRequest(
      routes.suggested.method,
      routes.suggested.url(message_id),
    );
  }
}

export interface AppConfig {
  opening_statement: string;
  suggested_questions: string[];
  suggested_questions_after_answer: {
    enabled: boolean;
  };
  speech_to_text: {
    enabled: boolean;
  };
  retriever_resource: {
    enabled: boolean;
  };
  more_like_this: {
    enabled: boolean;
  };
  user_input_form: {
    select: {
      label: string;
      variable: string;
      required: boolean;
      options: string[];
      default: string;
    };
    paragraph: {
      label: string;
      variable: string;
      required: boolean;
      default: string;
    };
  }[];
  sensitive_word_avoidance: {
    enabled: boolean;
    type: string;
    configs: any[];
  };
  file_upload: {
    image: {
      enabled: boolean;
      number_limits: number;
      detail: string;
      transfer_methods: string[];
    };
  };
  system_parameters: {
    image_file_size_limit: string;
  };
  pre_prompt: string;
  prompt_type: string;
  chat_prompt_config: any;
  completion_prompt_config: any
}

export class RequestClient extends DifyClient {

}