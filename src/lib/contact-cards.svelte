<script lang="ts"></script>

<div class="card-grid">
  <a class="button" target="_blank" href="https://repo.weareonhire.com">
    <div class="card-item margin-trim-block">
      <p>
        <svg width="32" height="32">
          <use href="#icon-github" />
        </svg>
      </p>
      <div class="margin-trim-block">
        <h3 class="text-heading-5">Contribute</h3>
      </div>
      <p class="subtle">Help us build weareonhire!</p>
      <p>View on GitHub</p>
    </div>
  </a>
  <a class="button" target="_blank" href="https://chat.weareonhire.com">
    <div class="card-item margin-trim-block">
      <p>
        <svg width="32" height="32">
          <use href="#icon-discord" />
        </svg>
      </p>
      <div class="margin-trim-block">
        <h3 class="text-heading-5">Join the Community</h3>
      </div>
      <p class="subtle">Chat, ask questions, and share ideas.</p>
      <p>Join Discord</p>
    </div>
  </a>
  <a class="button" target="_blank" href="https://social.weareonhire.com">
    <div class="card-item margin-trim-block">
      <p>
        <svg width="32" height="32">
          <use href="#icon-bluesky" />
        </svg>
      </p>
      <div class="margin-trim-block">
        <h3 class="text-heading-5">Stay Updated</h3>
      </div>
      <p class="subtle">Get the latest updates and announcements.</p>
      <p>Follow on Bluesky</p>
    </div>
  </a>
</div>

<style>
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .card-grid {
    display: grid;
    gap: var(--space-8);
    @media (max-width: 767px) {
      grid-template-columns: 1fr;
    }
  }

  .card-item {
    text-align: center;
    padding: var(--space-4);
  }
</style>
