document.addEventListener("DOMContentLoaded", async () => {
  const table = document.getElementById("appointments-table");
  const tbody = document.getElementById("appointments-body");
  const loading = document.getElementById("loading");
  const logoutBtn = document.getElementById("logout-btn");
  const token = localStorage.getItem("authToken");

  if (!token) {
    alert("❌ Ви не авторизовані!");
    location.href = "/";
    return;
  }

  logoutBtn.onclick = () => {
    localStorage.removeItem("authToken");
    location.href = "/";
  };

  try {
    const res = await fetch("/api/appointments", {
      headers: { Authorization: "Bearer " + token },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Не вдалося отримати записи");
    }

    loading.classList.add("hidden");
    table.classList.remove("hidden");
    tbody.innerHTML = "";

    data.forEach((a) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2 text-center">${a.id}</td>
        <td class="border p-2">${a.full_name}</td>
        <td class="border p-2">${a.phone}</td>
        <td class="border p-2">${a.department || "—"}</td>
        <td class="border p-2">${a.appointment_date}</td>
        <td class="border p-2">${a.comment || "—"}</td>
        <td class="border p-2 text-center">${a.status}</td>
        <td class="border p-2 text-center">
          <select class="border rounded p-1 text-sm bg-white">
            <option value="new" ${a.status === "new" ? "selected" : ""}>Новий</option>
            <option value="confirmed" ${a.status === "confirmed" ? "selected" : ""}>Підтверджено</option>
            <option value="cancelled" ${a.status === "cancelled" ? "selected" : ""}>Скасовано</option>
          </select>
        </td>
      `;

      // Обробка зміни статусу
      const select = tr.querySelector("select");
      select.addEventListener("change", async () => {
        const newStatus = select.value;
        try {
          const update = await fetch(`/api/appointments/${a.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ status: newStatus }),
          });

          if (update.ok) {
            tr.querySelector("td:nth-child(7)").textContent = newStatus;
          } else {
            alert("❌ Не вдалося оновити статус");
          }
        } catch (err) {
          console.error(err);
          alert("⚠️ Помилка з’єднання");
        }
      });

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    loading.textContent = "❌ Помилка завантаження записів";
  }
});
