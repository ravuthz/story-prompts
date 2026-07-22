import * as idb from "idb";

const DB_NAME = "storyboard_images_db";
const STORE_NAME = "images";
const DB_VERSION = 1;

async function getDb() {
  return idb.openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export const imageStorage = {
  async saveImage(id: string, file: File | Blob): Promise<void> {
    const db = await getDb();
    await db.put(STORE_NAME, file, id);
  },
  
  async getImage(id: string): Promise<Blob | undefined> {
    const db = await getDb();
    return db.get(STORE_NAME, id);
  },
  
  async deleteImage(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(STORE_NAME, id);
  },
  
  async getImageUrl(id: string): Promise<string | null> {
    const blob = await this.getImage(id);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  }
};