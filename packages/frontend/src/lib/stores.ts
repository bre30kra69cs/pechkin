import { writable } from 'svelte/store';
import type { Site } from './types';

function createMockDelay(ms: number = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Моковые данные
const mockSites: Site[] = [
  { id: '1', name: 'example.com', createdAt: new Date('2024-01-15') },
  { id: '2', name: 'github.com', createdAt: new Date('2024-02-20') },
  { id: '3', name: 'stackoverflow.com', createdAt: new Date('2024-03-10') },
];

function createSitesStore() {
  const { subscribe, set, update } = writable<Site[]>([]);

  return {
    subscribe,
    
    // GET /api/sites - получить все сайты
    async fetchAll(): Promise<Site[]> {
      await createMockDelay();
      set([...mockSites]);
      return [...mockSites];
    },
    
    // POST /api/sites - создать сайт
    async create(name: string): Promise<Site> {
      await createMockDelay();
      const newSite: Site = {
        id: generateId(),
        name: name.trim(),
        createdAt: new Date()
      };
      mockSites.push(newSite);
      update(sites => [...sites, newSite]);
      return newSite;
    },
    
    // PUT /api/sites/:id - обновить сайт
    async update(id: string, name: string): Promise<Site | null> {
      await createMockDelay();
      const index = mockSites.findIndex(s => s.id === id);
      if (index === -1) return null;
      
      mockSites[index] = { ...mockSites[index], name: name.trim() };
      update(sites => sites.map(s => s.id === id ? mockSites[index] : s));
      return mockSites[index];
    },
    
    // DELETE /api/sites/:id - удалить сайт
    async delete(id: string): Promise<boolean> {
      await createMockDelay();
      const index = mockSites.findIndex(s => s.id === id);
      if (index === -1) return false;
      
      mockSites.splice(index, 1);
      update(sites => sites.filter(s => s.id !== id));
      return true;
    }
  };
}

export const sites = createSitesStore();
