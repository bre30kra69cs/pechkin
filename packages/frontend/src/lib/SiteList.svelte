<script lang="ts">
  import { onMount } from 'svelte';
  import { sites } from './stores';
  import SiteForm from './SiteForm.svelte';
  import SiteItem from './SiteItem.svelte';
  import type { Site } from './types';
  
  let isLoading = true;
  let error: string | null = null;
  
  onMount(async () => {
    try {
      await sites.fetchAll();
    } catch (e) {
      error = 'Ошибка загрузки данных';
    } finally {
      isLoading = false;
    }
  });
  
  async function handleAdd(e: CustomEvent<string>) {
    try {
      await sites.create(e.detail);
    } catch (e) {
      error = 'Ошибка создания сайта';
    }
  }
  
  async function handleEdit(e: CustomEvent<Site>) {
    try {
      await sites.update(e.detail.id, e.detail.name);
    } catch (e) {
      error = 'Ошибка обновления сайта';
    }
  }
  
  async function handleDelete(e: CustomEvent<string>) {
    try {
      await sites.delete(e.detail);
    } catch (e) {
      error = 'Ошибка удаления сайта';
    }
  }
</script>

<div class="container">
  <header class="header">
    <div class="header-content">
      <h1>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        Scraping Sites
      </h1>
      <span class="count">{$sites.length} сайтов</span>
    </div>
  </header>
  
  <main class="main">
    <div class="card">
      <SiteForm on:submit={handleAdd} />
      
      {#if isLoading}
        <div class="loading">
          <div class="spinner"></div>
          <span>Загрузка...</span>
        </div>
      {:else if error}
        <div class="error">{error}</div>
      {:else if $sites.length === 0}
        <div class="empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          <p>Нет сайтов для скрэпинга</p>
          <span>Добавьте первый сайт с помощью формы выше</span>
        </div>
      {:else}
        <div class="list">
          {#each $sites as site (site.id)}
            <SiteItem 
              {site} 
              on:edit={handleEdit}
              on:delete={handleDelete}
            />
          {/each}
        </div>
      {/if}
    </div>
  </main>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background-color: #f5f5f5;
    color: #1a1a1a;
    line-height: 1.5;
  }
  
  .container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: white;
    border-bottom: 1px solid #e5e5e5;
    padding: 16px 24px;
  }
  
  .header-content {
    max-width: 640px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  h1 {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
  }
  
  h1 svg {
    color: #3b82f6;
  }
  
  .count {
    font-size: 13px;
    color: #888;
    background: #f5f5f5;
    padding: 4px 10px;
    border-radius: 12px;
  }
  
  .main {
    flex: 1;
    padding: 24px;
    display: flex;
    justify-content: center;
  }
  
  .card {
    width: 100%;
    max-width: 640px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px;
    color: #888;
  }
  
  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #e5e5e5;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .error {
    padding: 16px;
    color: #d32f2f;
    background: #fee;
    text-align: center;
  }
  
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px;
    color: #888;
    text-align: center;
  }
  
  .empty svg {
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .empty p {
    font-size: 15px;
    font-weight: 500;
    color: #555;
    margin-bottom: 4px;
  }
  
  .empty span {
    font-size: 13px;
  }
  
  .list {
    min-height: 400px;
  }
</style>
