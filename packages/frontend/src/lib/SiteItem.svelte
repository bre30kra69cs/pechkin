<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Site } from './types';
  
  export let site: Site;
  
  const dispatch = createEventDispatcher<{
    edit: Site;
    delete: string;
  }>();
  
  let isEditing = false;
  let editName = site.name;
  
  function startEdit() {
    editName = site.name;
    isEditing = true;
  }
  
  function cancelEdit() {
    isEditing = false;
    editName = site.name;
  }
  
  function saveEdit() {
    if (editName.trim()) {
      dispatch('edit', { ...site, name: editName.trim() });
    }
    isEditing = false;
  }
  
  function handleDelete() {
    dispatch('delete', site.id);
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }
</script>

<div class="site-item">
  {#if isEditing}
    <div class="edit-mode">
      <input 
        type="text" 
        bind:value={editName}
        on:keydown={handleKeydown}
        placeholder="Название сайта"
      />
      <button class="btn-save" on:click={saveEdit}>Сохранить</button>
      <button class="btn-cancel" on:click={cancelEdit}>Отмена</button>
    </div>
  {:else}
    <div class="view-mode">
      <span class="site-name">{site.name}</span>
      <span class="site-date">{site.createdAt.toLocaleDateString('ru-RU')}</span>
      <div class="actions">
        <button class="btn-edit" on:click={startEdit} title="Редактировать">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="btn-delete" on:click={handleDelete} title="Удалить">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .site-item {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e5e5;
    transition: background-color 0.15s;
  }
  
  .site-item:hover {
    background-color: #fafafa;
  }
  
  .site-item:last-child {
    border-bottom: none;
  }
  
  .view-mode {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .site-name {
    flex: 1;
    font-size: 14px;
    color: #1a1a1a;
  }
  
  .site-date {
    font-size: 12px;
    color: #888;
  }
  
  .actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.15s;
  }
  
  .site-item:hover .actions {
    opacity: 1;
  }
  
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
    background: transparent;
    color: #666;
  }
  
  button:hover {
    background-color: #f0f0f0;
  }
  
  .btn-delete:hover {
    background-color: #fee;
    color: #d32f2f;
  }
  
  .edit-mode {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .edit-mode input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s;
  }
  
  .edit-mode input:focus {
    border-color: #3b82f6;
  }
  
  .btn-save {
    width: auto;
    padding: 8px 16px;
    background-color: #3b82f6;
    color: white;
  }
  
  .btn-save:hover {
    background-color: #2563eb;
  }
  
  .btn-cancel {
    width: auto;
    padding: 8px 16px;
  }
</style>
