const API_URL = "https://jsonplaceholder.typicode.com/posts";

const GET_URL = `${API_URL}?_limit=5`;
const POST_URL = API_URL;

const loadBtn = document.getElementById("loadBtn");
const postsList = document.getElementById("postsList");
const postForm = document.getElementById("postForm");
const titleInput = document.getElementById("title");
const bodyInput = document.getElementById("body");
const createBtn = document.getElementById("createBtn");
const messagesEl = document.getElementById("messages");


function showMessage(text, type = "info") {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  return div;
}

function clearMessages() {
  messagesEl.textContent = "";
}

function setBusy(isBusy, { load = false, create = false } = {}) {
  if (load) {
    loadBtn.disabled = isBusy;
    loadBtn.textContent = isBusy ? "Загрузка…" : "Загрузить публикации";
  }
  if (create) {
    createBtn.disabled = isBusy;
    createBtn.textContent = isBusy ? "Отправка…" : "Создать публикацию";
  }
}

function createPostElement(title, body, meta) {
  const article = document.createElement("article");
  article.className = "post";

  const h3 = document.createElement("h3");
  h3.textContent = title;

  const p = document.createElement("p");
  p.textContent = body;

  article.appendChild(h3);
  article.appendChild(p);

  if (meta) {
    const small = document.createElement("p");
    small.textContent = meta;
    small.style.marginTop = "8px";
    small.style.fontSize = "12px";
    small.style.color = "#718096";
    article.appendChild(small);
  }

  return article;
}

async function loadPosts() {
  clearMessages();
  setBusy(true, { load: true });
  showMessage("Загрузка публикаций…", "info");

  try {
    const response = await fetch(GET_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const posts = await response.json();

    if (!Array.isArray(posts)) {
      throw new Error("Неожиданный формат ответа: ожидался массив.");
    }

    postsList.textContent = "";
    posts.forEach((post) => {
      postsList.appendChild(
        createPostElement(post.title, post.body, `ID: ${post.id}`)
      );
    });

    clearMessages();
    showMessage(`Загружено публикаций: ${posts.length}. HTTP: 200`, "success");
  } catch (error) {
    clearMessages();
    showMessage(
      `Не удалось загрузить публикации: ${error.message}. Попробуйте ещё раз.`,
      "error"
    );
    console.error("Ошибка загрузки:", error);
  } finally {
    setBusy(false, { load: true });
  }
}

async function createPost(event) {
  event.preventDefault();

  clearMessages();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    showMessage("Введите заголовок публикации. HTTP: 400", "error");
    titleInput.focus();
    return;
  }
  if (!body) {
    showMessage("Введите текст публикации. HTTP: 400", "error");
    bodyInput.focus();
    return;
  }

  setBusy(true, { create: true });
  showMessage("Отправка публикации…", "info");

  const payload = { title, body, userId: 1 };

  try {
    const response = await fetch(POST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const created = await response.json();

    clearMessages();
    showMessage(
      `Публикация успешно создана! ID: ${created.id}. HTTP: 201`,
      "success"
    );

    postsList.prepend(
      createPostElement(
        created.title,
        created.body,
        `ID: ${created.id}`
      )
    );

    postForm.reset();
    titleInput.focus();
  } catch (error) {
    clearMessages();
    showMessage(
      `Не удалось создать публикацию: ${error.message}. Попробуйте ещё раз.`,
      "error"
    );
    console.error("Ошибка создания:", error);
  } finally {
    setBusy(false, { create: true });
  }
}

loadBtn.addEventListener("click", loadPosts);
postForm.addEventListener("submit", createPost);