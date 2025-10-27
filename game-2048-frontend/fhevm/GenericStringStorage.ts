export interface GenericStringStorage {
  getItem(key: string): string | Promise<string | null> | null;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

export class GenericStringInMemoryStorage implements GenericStringStorage {
  #store = new Map<string, string>();

  getItem(key: string): string | Promise<string | null> | null {
    return this.#store.has(key) ? this.#store.get(key)! : null;
  }
  setItem(key: string, value: string): void | Promise<void> {
    this.#store.set(key, value);
  }
  removeItem(key: string): void | Promise<void> {
    this.#store.delete(key);
  }
}

export class GenericStringLocalStorage implements GenericStringStorage {
  #storage: Storage;

  constructor(storage: Storage) {
    this.#storage = storage;
  }

  getItem(key: string): string | null {
    return this.#storage.getItem(key);
  }

  setItem(key: string, value: string): void {
    this.#storage.setItem(key, value);
  }

  removeItem(key: string): void {
    this.#storage.removeItem(key);
  }
}
