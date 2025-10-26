// --- ADMIN LOGIN SYSTEM ---
async function login(username, password) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: username, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("authToken", data.token);
      console.log("%c✅ Успішний вхід як адмін!", "color:green;font-weight:bold;");
      location.reload();
    } else {
      console.error("❌ Помилка входу:", data.message || "невідома причина");
    }
  } catch (err) {
    console.error("Помилка запиту:", err);
  }
}

function logout() {
  localStorage.removeItem("authToken");
  console.log("%c🚪 Ви вийшли з акаунта", "color:orange;font-weight:bold;");
  location.reload();
}

// --- Коли сторінка завантажується ---
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  fetch("/api/health")
    .then(() => {
      // Кнопка "Додати новину" (на головній)
      const container = document.querySelector("main");
      if (container && !document.getElementById("add-news-btn")) {
        const btn = document.createElement("button");
        btn.id = "add-news-btn";
        btn.textContent = "➕ Додати новину";
        btn.className =
          "fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition";
        btn.onclick = () => openNewsEditor();
        document.body.appendChild(btn);
      }

      // Кнопки "Редагувати" і "Видалити" (на сторінці article.html)
      const articleEl = document.querySelector("article");
      if (articleEl && !document.getElementById("edit-news-btn")) {
        const controls = document.createElement("div");
        controls.className = "mt-6 flex gap-4";

        const editBtn = document.createElement("button");
        editBtn.id = "edit-news-btn";
        editBtn.textContent = "✏️ Редагувати";
        editBtn.className = "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700";
        editBtn.onclick = () => editArticle();

        const delBtn = document.createElement("button");
        delBtn.id = "delete-news-btn";
        delBtn.textContent = "🗑️ Видалити";
        delBtn.className = "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700";
        delBtn.onclick = () => deleteArticle();

        controls.append(editBtn, delBtn);
        articleEl.appendChild(controls);
      }
    })
    .catch(() => localStorage.removeItem("authToken"));
});

// --- Редагування новини ---
function editArticle() {
  const id = new URLSearchParams(window.location.search).get("id");
  const title = document.getElementById("article-title")?.textContent || "";
  const imageEl = document.getElementById("article-image");
  const image = imageEl ? imageEl.src : "";
  const content = document.getElementById("article-content")?.innerHTML || "";
  openNewsEditor(id, title, content, image);
}

      // Кнопка "Управління записами" (на головній та сторінці appointment.html)
      const isHomePage = window.location.pathname === "/" || window.location.pathname.endsWith("index.html");
      const isAppointmentPage = window.location.pathname.includes("appointment.html");
      
      if ((isHomePage || isAppointmentPage) && !document.getElementById("appointments-admin-btn")) {
        const appointmentsBtn = document.createElement("button");
        appointmentsBtn.id = "appointments-admin-btn";
        appointmentsBtn.textContent = "📋 Записи";
        appointmentsBtn.className =
          "fixed bottom-24 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition z-40";
        appointmentsBtn.onclick = () => {
          window.location.href = "/patients/admin_appointments.html";
        };
        document.body.appendChild(appointmentsBtn);
      }

// --- Видалення новини ---
async function deleteArticle() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!confirm("Видалити цю новину?")) return;

  const token = localStorage.getItem("authToken");
  const res = await fetch(`/api/news/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  });

  if (res.ok) {
    alert("✅ Новину видалено!");
    location.href = "/";
  } else {
    alert("❌ Не вдалося видалити.");
  }
}

// --- Єдиний редактор (створення / редагування) ---
function openNewsEditor(id = null, titleVal = "", contentVal = "", imageVal = "") {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto p-4";

  // Екрануємо HTML для безпеки
  const escapeHtml = (str) => str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  overlay.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl relative">
      <h2 class="text-2xl font-bold mb-5 text-gray-800">
        ${id ? "✏️ Редагувати новину" : "📰 Створити новину"}
      </h2>

      <!-- Заголовок -->
      <label class="block mb-2 font-medium text-gray-700">Заголовок</label>
      <input id="news-title" type="text" value="${escapeHtml(titleVal)}" placeholder="Введіть заголовок"
        class="w-full border border-gray-300 p-2 mb-5 rounded focus:ring-2 focus:ring-blue-500 outline-none">

      <!-- Основне зображення -->
      <label class="block mb-2 font-medium text-gray-700">Основне зображення</label>
      <div class="flex items-center gap-2 mb-3">
        <input id="news-image-url" type="text" value="${escapeHtml(imageVal)}" placeholder="URL або виберіть файл"
          class="flex-1 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
        <input id="news-image-file" type="file" accept="image/*" class="hidden">
        <button type="button" id="select-file-btn" class="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300 text-sm">
          📁 Обрати
        </button>
      </div>

      <div class="w-full mb-5 text-center">
        <img id="image-preview" src="${imageVal ? escapeHtml(imageVal) : ""}" alt=""
          class="max-h-64 mx-auto rounded shadow ${imageVal ? "" : "hidden"} object-contain">
      </div>

      <!-- Текст -->
      <label class="block mb-2 font-medium text-gray-700">Текст новини</label>
      <div id="editor" class="border rounded mb-5 min-h-[300px]"></div>

      <!-- Кнопки -->
      <div class="flex justify-end gap-3 mt-6">
        <button type="button" id="save-news" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          💾 ${id ? "Оновити" : "Зберегти"}
        </button>
        <button type="button" id="cancel-news" class="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400">❌ Відмінити</button>
      </div>

      <button type="button" id="close-editor" class="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Завантаження Quill
  const quillScript = document.createElement("script");
  quillScript.src = "https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.min.js";
  document.head.appendChild(quillScript);

  const quillStyle = document.createElement("link");
  quillStyle.rel = "stylesheet";
  quillStyle.href = "https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.snow.css";
  document.head.appendChild(quillStyle);

  quillScript.onload = () => {
    const quill = new Quill("#editor", {
      theme: "snow",
      placeholder: "Введіть текст новини...",
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
      },
    });

    if (contentVal) quill.root.innerHTML = contentVal;

    // === Зображення ===
    const imageInput = overlay.querySelector("#news-image-url");
    const fileInput = overlay.querySelector("#news-image-file");
    const fileBtn = overlay.querySelector("#select-file-btn");
    const preview = overlay.querySelector("#image-preview");

    fileBtn.onclick = () => fileInput.click();

    fileInput.onchange = () => {
      const file = fileInput.files[0];
      if (!file) return;
      
      // Перевірка розміру (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("❌ Файл занадто великий! Максимум 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        imageInput.value = reader.result;
        preview.src = reader.result;
        preview.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    };

    imageInput.oninput = () => {
      const val = imageInput.value.trim();
      if (val) {
        preview.src = val;
        preview.classList.remove("hidden");
      } else {
        preview.classList.add("hidden");
      }
    };

    // === Кнопки ===
    overlay.querySelector("#cancel-news").onclick = () => overlay.remove();
    overlay.querySelector("#close-editor").onclick = () => overlay.remove();

    overlay.querySelector("#save-news").onclick = async () => {
      const title = document.getElementById("news-title").value.trim();
      const image = document.getElementById("news-image-url").value.trim();
      const content = quill.root.innerHTML.trim();
      const token = localStorage.getItem("authToken");

      if (!title || !content) {
        alert("⚠️ Введіть заголовок і текст!");
        return;
      }

      const payload = { 
        title, 
        content, 
        image: image || null,
        is_published: true 
      };

      try {
        const res = await fetch(`/api/news${id ? "/" + id : ""}`, {
          method: id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok) {
          alert(id ? "✅ Новину оновлено!" : "✅ Новину створено!");
          overlay.remove();
          location.reload();
        } else {
          alert("❌ Помилка: " + (data.message || "невідома"));
        }
      } catch (err) {
        alert("❌ Запит не вдався: " + err.message);
      }
    };
  };
}