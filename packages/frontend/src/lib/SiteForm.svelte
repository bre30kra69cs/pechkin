<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher<{
    submit: string;
  }>();
  
  let name = '';
  let isLoading = false;
  
  async function handleSubmit() {
    if (!name.trim() || isLoading) return;
    
    isLoading = true;
    dispatch('submit', name);
    
    // Сброс формы после отправки
    name = '';
    isLoading = false;
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }
</script>

<div class="form">
  <div class="input-group">
    <input 
      type="text" 
      bind:value={name}
      on:keydown={handleKeydown}
      placeholder="Введите название сайта (например, example.com)"
      disabled={isLoading}
    />
    <button 
      class="btn-add" 
      on:click={handleSubmit}
      disabled={!name.trim() || isLoading}
    >
      {#if isLoading}
        <span class="spinner"></span>
      {:else}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      {/if}
      Добавить
    </button>
  </div>
</div>

<style>
  .form {
    padding: 16px;
    border-bottom: 1px solid #e5e5e5;
    background-color: #fafafa;
  }
  
  .input-group {
    display: flex;
    gap: 8px;
  }
  
  input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: all 0.15s;
    background: white;
  }
  
  input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  input::placeholder {
    color: #aaa;
  }
  
  .btn-add {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    background-color: #1a1a1a;
    color: white;
  }
  
  .btn-add:hover:not(:disabled) {
    background-color: #333;
  }
  
  .btn-add:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
