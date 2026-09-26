// Mobile nav dropdown toggle
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      menu.classList.toggle('hidden');
    });
  }

  // Confirm before submitting any delete form
  document.querySelectorAll('.confirm-delete').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      const name = form.getAttribute('data-name') || 'this item';
      if (!confirm('Are you sure you want to delete ' + name + '? This cannot be undone.')) {
        e.preventDefault();
      }
    });
  });

  // Auto-dismiss flash messages after a few seconds
  document.querySelectorAll('.flash').forEach(function (el) {
    setTimeout(function () {
      el.style.transition = 'opacity 0.5s';
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 500);
    }, 4000);
  });
});
