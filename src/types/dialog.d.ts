interface ModelConfig {
  model: {
    provider: string
    name: string
    mode: string
    completion_params: {
      temperature: number
    }
  }
}


