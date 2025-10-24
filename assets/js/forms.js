document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('appointment-form');
  const feedback = document.getElementById('form-feedback');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    feedback.innerHTML = '<p class="p-4 bg-green-50 text-green-700 rounded-md font-semibold">Дякуємо! Запит відправлено. Ми зателефонуємо вам найближчим часом.</p>';
    form.reset();
  });
});
