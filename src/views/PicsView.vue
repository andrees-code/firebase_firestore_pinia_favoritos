<template>
  <div class="app-container">
    <nav class="navbar">
      <div class="nav-content">
        <h1 class="logo">PICS<span>VIEW</span></h1>

        <div class="nav-actions">
          <RouterLink class="btn-nav btn-secondary" to="/favoritos">
            <span class="icon">♥</span> Mis Favoritos
          </RouterLink>
          <button class="btn-nav btn-outline" @click="logout">Cerrar Sesión</button>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <div v-if="store.loading" class="status-message">
        <div class="spinner"></div>
        <p>Explorando la galería...</p>
      </div>

      <div v-else-if="store.error" class="status-message error">
        <p>⚠️ {{ store.error }}</p>
      </div>

      <ul v-else class="card-grid">
        <li v-for="pic in store.pics" :key="pic.id" class="grid-item">
          <div class="card">
            <div class="image-wrapper">
              <img :src="pic.download_url" :alt="pic.author" loading="lazy" />
              <div class="overlay">
                <button
                  @click="favStore.toggleFavorito(pic.id)"
                  class="fav-badge"
                  :class="{ 'is-active': favStore.esFavorito(pic.id) }"
                >
                  {{ favStore.esFavorito(pic.id) ? '❤️' : '🤍' }}
                </button>
              </div>
            </div>

            <div class="card-info">
              <p class="author-label">Fotógrafo</p>
              <h3 class="author-name">{{ pic.author }}</h3>

              <button
                @click="favStore.toggleFavorito(pic.id)"
                class="btn-action"
                :class="{ 'btn-active': favStore.esFavorito(pic.id) }"
              >
                {{ favStore.esFavorito(pic.id) ? 'Quitar de favoritos' : 'Añadir a favoritos' }}
              </button>
            </div>
          </div>
        </li>
      </ul>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { useImagesStore } from '../stores/pics'
import { useFavoritosStore } from '../stores/añadirFavoritos'

const store = useImagesStore()
const favStore = useFavoritosStore()
const auth = getAuth()
const router = useRouter()

const logout = async () => {
  try {
    await signOut(auth)
    favStore.favoritos = []
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error.message)
  }
}

onMounted(() => {
  store.fetchImagenes()

  onAuthStateChanged(auth, (user) => {
    if (user) {
      favStore.cargarFavoritos(user.uid)
    } else {
      favStore.favoritos = []
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
$white: #ffffff
$danger: #ef4444

.app-container
  min-height: 100vh
  background-color: $bg-body
  font-family: 'Inter', system-ui, -apple-system, sans-serif

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

  .logo
    font-size: 1.5rem
    font-weight: 800
    letter-spacing: -1px
    color: $text-main
    span
      color: $primary

  .nav-actions
    display: flex
    gap: 1rem

.btn-nav
  padding: 0.6rem 1.2rem
  border-radius: 8px
  font-weight: 600
  font-size: 0.9rem
  transition: all 0.2s ease
  text-decoration: none
  display: flex
  align-items: center
  cursor: pointer

  &.btn-secondary
    background: $primary
    color: white
    &:hover
      background: $primary-dark
      transform: translateY(-1px)

  &.btn-outline
    background: transparent
    border: 1px solid #e2e8f0
    color: $text-light
    &:hover
      background: #fee2e2
      color: $danger
      border-color: #fca5a5

// --- GRID ---
.main-content
  max-width: 1200px
  margin: 2rem auto
  padding: 0 1rem

.card-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))
  gap: 2rem
  list-style: none
  padding: 0

// --- CARDS ---
.card
  background: $white
  border-radius: 16px
  overflow: hidden
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.03)
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  height: 100%
  display: flex
  flex-direction: column

  &:hover
    transform: translateY(-8px)
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1)

  .image-wrapper
    position: relative
    height: 220px
    overflow: hidden

    img
      width: 100%
      height: 100%
      object-fit: cover
      transition: transform 0.5s ease

    .overlay
      position: absolute
      top: 10px
      right: 10px

  &:hover img
    transform: scale(1.05)

  .card-info
    padding: 1.25rem
    display: flex
    flex-direction: column
    flex-grow: 1

    .author-label
      font-size: 0.75rem
      text-transform: uppercase
      color: $text-light
      margin-bottom: 0.25rem
      font-weight: 600

    .author-name
      font-size: 1.1rem
      color: $text-main
      margin-bottom: 1.25rem
      font-weight: 700

.fav-badge
  background: rgba($white, 0.9)
  border: none
  width: 35px
  height: 35px
  border-radius: 50%
  cursor: pointer
  display: flex
  align-items: center
  justify-content: center
  box-shadow: 0 2px 10px rgba(0,0,0,0.1)
  transition: all 0.2s

  &:hover
    transform: scale(1.1)
  &.is-active
    background: $white

.btn-action
  width: 100%
  padding: 0.75rem
  border-radius: 10px
  border: 1px solid #e2e8f0
  background: white
  font-weight: 600
  color: $text-main
  cursor: pointer
  margin-top: auto
  transition: all 0.2s

  &:hover
    border-color: $primary
    color: $primary
    background: #f5f3ff

  &.btn-active
    background: #fff1f2
    border-color: #fda4af
    color: $danger
    &:hover
      background: $danger
      color: white

  @keyframes spin
  from
    transform: rotate(0deg)
  to
    transform: rotate(360deg)
.status-message
  text-align: center
  padding: 4rem
  color: $text-light

  .spinner
    width: 40px
    height: 40px
    border: 3px solid #e2e8f0
    border-top-color: $primary
    border-radius: 50%
    margin: 0 auto 1rem
    animation: spin 1s linear infinite
</style>
