import { openDB } from "https://cdn.jsdelivr.net/npm/idb@7/+esm";

function isIndexedDBAvailable() {
  try {
    return !!window.indexedDB;
  } catch (error) {
    console.error("IndexedDB n'est pas disponible sur ce navigateur:", error);
    return false;
  }
}

class IndexedDBCache {
  constructor() {
    if (IndexedDBCache.instance) return IndexedDBCache.instance;

    if (!isIndexedDBAvailable()) {
      console.warn("IndexedDB n'est pas disponible, le cache ne fonctionnera pas.");
      return;
    }

    this.dbPromise = openDB("GameAssetCache", 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("models")) db.createObjectStore("models");
        if (!db.objectStoreNames.contains("textures")) db.createObjectStore("textures");
        if (!db.objectStoreNames.contains("sounds")) db.createObjectStore("sounds");
        if (!db.objectStoreNames.contains("json")) db.createObjectStore("json");
      },
    });

    IndexedDBCache.instance = this;
    return this;
  }

  async saveFile(storeName, key, data) {
    if (!this.dbPromise) return;
    try {
        const db = await this.dbPromise;
        await db.put(storeName, data, key);
        console.debug(`Sauvegarde réussie dans IndexedDB: ${storeName} → ${key}`);
    } catch (error) {
        console.error(`Erreur lors de la sauvegarde de "${key}" dans "${storeName}"`, error);
    }
}


  async getFile(storeName, key) {
    if (!this.dbPromise) return null;
    try {
      const db = await this.dbPromise;
      return await db.get(storeName, key);
    } catch (error) {
      console.error(`Erreur lors de la récupération de "${key}" dans "${storeName}" :`, error);
      return null;
    }
  }

  async removeFile(storeName, key) {
    if (!this.dbPromise) return;
    try {
      const db = await this.dbPromise;
      await db.delete(storeName, key);
    } catch (error) {
      console.error(`Erreur lors de la suppression de "${key}" dans "${storeName}" :`, error);
    }
  }

  async clearCache(storeName) {
    if (!this.dbPromise) return;
    try {
      const db = await this.dbPromise;
      await db.clear(storeName);
    } catch (error) {
      console.error(`Erreur lors du vidage du cache "${storeName}" :`, error);
    }
  }
}

export const CacheDB = new IndexedDBCache();
