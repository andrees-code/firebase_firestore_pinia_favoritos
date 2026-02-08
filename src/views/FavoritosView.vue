<template>
  <div class="app-container">
    <nav class="navbar">
      <div class="nav-content">
        <div class="brand">
          <h1 class="logo">PICS<span>FAVS</span></h1>
          <span class="badge-status">Colección Privada</span>
        </div>

        <div class="nav-actions">
          <RouterLink class="btn-nav btn-home" to="/">
            <span class="icon">←</span> Volver al Home
          </RouterLink>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <div v-if="store.loading || favStore.cargando" class="status-container">
        <div class="spinner"></div>
        <p>Sincronizando tus favoritos...</p>
      </div>

      <div v-else-if="picsFavoritas.length === 0" class="empty-state">
        <div class="empty-icon">📂</div>
        <h2>Parece que está vacío</h2>
        <p>Aún no has guardado ninguna joya visual. ¡Explora la galería y añade tus preferidas!</p>
        <RouterLink class="btn-cta" to="/">Explorar Imágenes</RouterLink>
      </div>

      <ul v-else class="card-grid">
        <li v-for="pic in picsFavoritas" :key="pic.id" class="grid-item">
          <div class="card">
            <div class="image-wrapper">
              <img :src="pic.download_url" :alt="pic.author" loading="lazy" />
              <div class="overlay">
                <div class="fav-heart">❤️</div>
              </div>
            </div>

            <div class="card-info">
              <p class="author-label">Fotógrafo</p>
              <h3 class="author-name">{{ pic.author }}</h3>

              <button @click="favStore.toggleFavorito(pic.id)" class="btn-remove">
                <span>Eliminar de favoritos</span>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </main>

    <footer v-if="picsFavoritas.length > 0" class="footer-note">
      <p>Imágenes guardadas {{ picsFavoritas.length }}</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useImagesStore } from '../stores/pics'
import { useFavoritosStore } from '../stores/añadirFavoritos'

const store = useImagesStore()
const favStore = useFavoritosStore()
const auth = getAuth()

const picsFavoritas = computed(() => {
  return store.pics.filter((pic) => favStore.esFavorito(pic.id))
})

onMounted(() => {
  if (store.pics.length === 0) {
    store.fetchImagenes()
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      favStore.cargarFavoritos(user.uid)
    }
  })
})
</script>

<style lang="sass">
$primary: #6366f1
$primary-dark: #4f46e5
$bg-body: #f8fafc
$text-main: #1e293b
$text-light: #64748b
$danger: #ef4444
$white: #ffffff

.app-container
  min-height: 100vh
  background-color: $bg-body
  font-family: 'Inter', sans-serif

.navbar
  position: sticky
  top: 0
  z-index: 100
  background: rgba($white, 0.8)
  backdrop-filter: blur(12px)
  border-bottom: 1px solid rgba(0,0,0,0.05)
  padding: 0.75rem 2rem

  .nav-content
    max-width: 1200px
    margin: 0 auto
    display: flex
    justify-content: space-between
    align-items: center

  .brand
    display: flex
    align-items: center
    gap: 1rem

  .logo
    font-size: 1.5rem
    font-weight: 800
    margin: 0
    color: $text-main
    span
      color: $primary

  .badge-status
    background: #e0e7ff
    color: $primary
    padding: 0.2rem 0.6rem
    border-radius: 6px
    font-size: 0.7rem
    font-weight: 700

.btn-nav
  padding: 0.6rem 1.2rem
  border-radius: 8px
  font-weight: 600
  text-decoration: none
  transition: all 0.2s

  &.btn-home
    background: $text-main
    color: white
    &:hover
      background: #000
      transform: translateX(-3px)

.main-content
  max-width: 1200px
  margin: 2rem auto
  padding: 0 1.5rem

.card-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))
  gap: 2.5rem
  list-style: none
  padding: 0

.card
  background: $white
  border-radius: 20px
  overflow: hidden
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05)
  transition: transform 0.3s ease
  &:hover
    transform: translateY(-5px)

  .image-wrapper
    position: relative
    height: 240px
    img
      width: 100%
      height: 100%
      object-fit: cover

    .overlay
      position: absolute
      top: 10px
      right: 10px

    .fav-heart
      background: white
      width: 35px
      height: 35px
      border-radius: 50%
      display: flex
      align-items: center
      justify-content: center
      box-shadow: 0 2px 5px rgba(0,0,0,0.1)

  .card-info
    padding: 1.5rem
    .author-label
      font-size: 0.7rem
      color: $text-light
      text-transform: uppercase
    .author-name
      font-size: 1.2rem
      font-weight: 700
      margin: 0.2rem 0 1.5rem

.btn-remove
  width: 100%
  padding: 0.8rem
  border-radius: 12px
  border: 1px solid #fee2e2
  background: #fff1f2
  color: $danger
  font-weight: 600
  cursor: pointer
  transition: all 0.2s
  &:hover
    background: $danger
    color: white

.empty-state
  text-align: center
  padding: 5rem 1rem
  background: white
  border-radius: 24px
  border: 2px dashed #e2e8f0
  .empty-icon
    font-size: 4rem
  .btn-cta
    display: inline-block
    background: $primary
    color: white
    padding: 0.8rem 2rem
    border-radius: 10px
    text-decoration: none
    margin-top: 1rem

.status-container
  text-align: center
  padding: 5rem
  .spinner
    width: 40px
    height: 40px
    border: 3px solid #e2e8f0
    border-top-color: $primary
    border-radius: 50%
    margin: 0 auto 1rem
    animation: spin 1s linear infinite

@keyframes spin
  from
    transform: rotate(0deg)
  to
    transform: rotate(360deg)
</style>
