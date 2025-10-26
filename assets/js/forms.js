document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("appointment-form");
  const feedback = document.getElementById("form-feedback");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const department = form.department.value.trim();
    const message = form.message.value.trim();

    if (!name || !phone || !department) {
      feedback.textContent = "⚠️ Будь ласка, заповніть усі обов’язкові поля!";
      feedback.className = "text-red-600 mt-3";
      return;
    }

    // Ставимо дату поточного дня
    const today = new Date().toISOString().split("T")[0];

    const payload = {
      full_name: name,
      phone,
      department,
      appointment_date: today,
      comment: message,
    };

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        feedback.innerHTML = "✅ Дякуємо! Запис успішно створено.";
        feedback.className = "text-green-600 mt-3";
        form.reset();
      } else {
        feedback.textContent = "❌ Помилка: " + (data.message || "невідома причина");
        feedback.className = "text-red-600 mt-3";
      }
    } catch (err) {
      feedback.textContent = "⚠️ Не вдалося надіслати запит: " + err.message;
      feedback.className = "text-red-600 mt-3";
    }
  });
});
