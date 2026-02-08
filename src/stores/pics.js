import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useImagesStore = defineStore('images', () => {
  const pics = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchImagenes = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch('https://picsum.photos/v2/list?page=1&limit=30')
      
      if (!response.ok) throw new Error('Error')
      
      const data = await response.json()
      pics.value = data
    } catch (err) {
      error.value = "No se pudieron cargar los personajes."
      console.error("Error cargando personajes:", err)
    } finally {
      loading.value = false
    }
  }

  return {
    pics,
    loading,
    error,
    fetchImagenes
  }
})