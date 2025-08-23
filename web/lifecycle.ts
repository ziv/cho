export interface ModuleInit {
  init(): Promise<void>;
}

export interface ModuleMount {
  mount(): Promise<void>;
}
