document.addEventListener("DOMContentLoaded", () => {
  loadFeed()
})

async function loadFeed() {
  try {
    const response = await fetch("/api/home/")
    if (!response.ok) throw new Error("Erro ao buscar feed")

    const data = await response.json()

    renderPosts(data.posts)

  } catch (error) {
    console.error(error)
    document.getElementById("home").innerHTML =
      "<p style='text-align:center'>Erro ao carregar feed</p>"
  }
}

function renderPosts(posts) {
  const feed = document.getElementById("home")
  feed.innerHTML = ""

  if (!posts || posts.length === 0) {
    feed.innerHTML = `
      <p style="text-align:center;color:var(--muted-foreground)">
        Nenhum post encontrado.
      </p>`
    return
  }

  posts.forEach(post => {
    console.log("AUTHOR PHOTO:", post.author_photo)
    const postEl = document.createElement("article")
    postEl.className = "post-card"

    postEl.innerHTML = `
      <!-- Header -->
      <header class="post-header">
    <div class="post-author">
        ${
        post.author_photo
            ? `<img class="post-avatar" src="${post.author_photo}" alt="${post.author_username}">`
            : `<div class="post-avatar placeholder"></div>`
        }
        <div class="post-author-info">
        <span class="post-author-name">
            ${post.author_username}
        </span>
        </div>
    </div>
        </header>   

      <!-- Media -->
      ${renderMedia(post)}

      <!-- Content -->
      <div class="post-content">
        <p class="post-likes">${post.likes_count} curtidas</p>
        <p class="post-text">${post.text || ""}</p>
        <time class="post-time">${formatDate(post.created_at)}</time>
      </div>
    `

    feed.appendChild(postEl)
  })
}

function renderMedia(post) {
  const images = post.imagens || []
  const videos = post.videos || []

  if (!images.length && !videos.length) return ""

  let mediaHTML = `<div class="post-media">`

  images.forEach(src => {
    mediaHTML += `
      <img src="${src}" alt="Imagem do post" loading="lazy">
    `
  })

  videos.forEach(src => {
    mediaHTML += `
      <video controls muted loop preload="metadata">
        <source src="${src}" type="video/mp4">
      </video>
    `
  })

  mediaHTML += `</div>`

  return mediaHTML
}

function formatDate(dateString) {
  if (!dateString) return ""

  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })
}
