import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAuth } from 'firebase/auth'
import { 
  obtenerPerfilUsuario, 
  agregarFavorito, 
  quitarFavorito 
} from '../firebase/usuarios' 

export const useFavoritosStore = defineStore('favoritos', () => {
  const favoritosIds = ref([])
  const cargando = ref(false)
  const auth = getAuth()

  const cargarFavoritos = async (usuarioId) => {
    if (!usuarioId) return
    cargando.value = true
    const res = await obtenerPerfilUsuario(usuarioId)
    if (res.ok) {
      favoritosIds.value = res.perfil.favoritos || []
    }
    cargando.value = false
  }

  const toggleFavorito = async (itemId) => {
    const user = auth.currentUser
    const idString = String(itemId)

    if (!user) {
      alert("Debes iniciar sesión para guardar favoritos.")
      return
    }

    if (!user.emailVerified) {
      alert("⚠️ Acción bloqueada: Por favor, verifica tu correo electrónico para poder guardar favoritos.")
      return
    }

    const existe = favoritosIds.value.includes(idString)

    if (existe) {
      favoritosIds.value = favoritosIds.value.filter(id => id !== idString)
      const res = await quitarFavorito(user.uid, idString)
      if (!res.ok) await cargarFavoritos(user.uid)
    } else {
      favoritosIds.value.push(idString)
      const res = await agregarFavorito(user.uid, idString)
      if (!res.ok) await cargarFavoritos(user.uid)
    }
  }

  const esFavorito = (itemId) => favoritosIds.value.includes(String(itemId))

  return {
    favoritosIds,
    cargando,
    cargarFavoritos,
    toggleFavorito,
    esFavorito
  }
})