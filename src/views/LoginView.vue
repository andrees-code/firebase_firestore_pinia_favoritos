<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="logo">PICS<span>VIEW</span></h1>
        <h2>{{ esInicioSesion ? 'Bienvenido de nuevo' : 'Crea tu cuenta' }}</h2>
        <p class="subtitle">
          {{
            esInicioSesion
              ? 'Ingresa tus credenciales para acceder'
              : 'Únete a nuestra comunidad de fotógrafos'
          }}
        </p>
      </div>

      <form @submit.prevent="manejarEnvio" class="auth-form">
        <div class="input-group">
          <label>Correo Electrónico</label>
          <input v-model="correo" type="email" placeholder="nombre@correo.com" required />
        </div>

        <div class="input-group">
          <label>Contraseña</label>
          <input v-model="clave" type="password" placeholder="••••••••" required />
        </div>

        <transition name="fade">
          <div v-if="!esInicioSesion" class="input-group">
            <label>Confirmar Contraseña</label>
            <input v-model="confirmarClave" type="password" placeholder="••••••••" required />
          </div>
        </transition>

        <transition name="fade">
          <p v-if="mensajeError" class="error-badge">{{ mensajeError }}</p>
        </transition>

        <button type="submit" :disabled="cargando" class="btn-submit">
          <span v-if="cargando" class="mini-spinner"></span>
          {{ cargando ? 'Procesando...' : esInicioSesion ? 'Iniciar Sesión' : 'Registrarse' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>
          {{ esInicioSesion ? '¿Aún no tienes cuenta?' : '¿Ya eres miembro?' }}
          <button @click="alternarModo" class="btn-toggle">
            {{ esInicioSesion ? 'Regístrate gratis' : 'Inicia sesión aquí' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registrarUsuario, loginUsuario, enviarEmailVerificacion } from '../firebase/auth'
import { guardarPerfilUsuario } from '../firebase/usuarios'

const enrutador = useRouter()
const esInicioSesion = ref(true)
const correo = ref('')
const clave = ref('')
const confirmarClave = ref('')
const cargando = ref(false)
const mensajeError = ref('')

const traducirErrorFirebase = (errorMensaje) => {
  const match = errorMensaje.match(/\(([^)]+)\)/)
  const codigoError = match ? match[1] : errorMensaje

  const errores = {
    'auth/email-already-in-use': 'Este correo ya está registrado.',
    'auth/invalid-email': 'El correo no es válido.',
    'auth/user-not-found': 'No existe una cuenta con este correo.',
    'auth/wrong-password': 'La contraseña es incorrecta.',
    'auth/weak-password': 'La contraseña es muy débil.',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
    'auth/invalid-credential': 'Credenciales incorrectas.',
  }
  return errores[codigoError] || 'Error al intentar acceder.'
}

const alternarModo = () => {
  esInicioSesion.value = !esInicioSesion.value
  mensajeError.value = ''
  confirmarClave.value = ''
}

const manejarEnvio = async () => {
  cargando.value = true
  mensajeError.value = ''

  try {
    if (esInicioSesion.value) {
      const respuesta = await loginUsuario(correo.value, clave.value)
      if (!respuesta.ok) throw new Error(respuesta.error)
      enrutador.push('/')
    } else {
      if (clave.value !== confirmarClave.value) {
        mensajeError.value = 'Las contraseñas no coinciden.'
        cargando.value = false
        return
      }
      const respuesta = await registrarUsuario(correo.value, clave.value)
      if (!respuesta.ok) throw new Error(respuesta.error)
      await guardarPerfilUsuario(respuesta.usuario.uid, {
        email: correo.value,
        rol: 'usuario',
        fechaRegistro: new Date(),
      })
      enviarEmailVerificacion(respuesta.usuario)
      alert('¡Cuenta creada! Verifica tu correo.')
      enrutador.push('/')
    }
  } catch (error) {
    mensajeError.value = traducirErrorFirebase(error.message)
  } finally {
    cargando.value = false
  }
}
</script>

<style lang="sass">
$primary: #6366f1
$primary-dark: #4f46e5
$text-main: #1e293b
$text-light: #64748b
$danger: #ef4444
$bg-app: #f8fafc

.auth-container
  min-height: 100vh
  display: flex
  align-items: center
  justify-content: center
  background: radial-gradient(circle at top left, #eef2ff 0%, #f8fafc 100%)
  padding: 20px

.auth-card
  background: white
  padding: 2.5rem
  border-radius: 24px
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)
  width: 100%
  max-width: 440px
  border: 1px solid rgba(0,0,0,0.03)

.auth-header
  text-align: center
  margin-bottom: 2rem

  .logo
    font-size: 1.5rem
    font-weight: 800
    color: $text-main
    margin-bottom: 1rem
    span
      color: $primary

  h2
    font-size: 1.25rem
    color: $text-main
    font-weight: 700
    margin: 0

  .subtitle
    color: $text-light
    font-size: 0.9rem
    margin-top: 0.5rem

.auth-form
  display: flex
  flex-direction: column
  gap: 1.25rem

.input-group
  display: flex
  flex-direction: column
  gap: 0.4rem

  label
    font-size: 0.75rem
    font-weight: 700
    color: $text-light
    text-transform: uppercase
    letter-spacing: 0.5px

  input
    padding: 0.8rem 1rem
    border: 1px solid #e2e8f0
    border-radius: 12px
    font-size: 1rem
    transition: all 0.2s
    background: #fdfdfd

    &:focus
      outline: none
      border-color: $primary
      box-shadow: 0 0 0 4px rgba($primary, 0.1)

.btn-submit
  background: $primary
  color: white
  padding: 0.9rem
  border: none
  border-radius: 12px
  font-size: 1rem
  font-weight: 600
  cursor: pointer
  transition: all 0.2s
  margin-top: 1rem
  display: flex
  align-items: center
  justify-content: center
  gap: 0.5rem

  &:hover
    background: $primary-dark
    transform: translateY(-1px)
    box-shadow: 0 4px 12px rgba($primary, 0.2)

  &:disabled
    opacity: 0.7
    cursor: not-allowed

.error-badge
  background: #fef2f2
  color: $danger
  padding: 0.75rem
  border-radius: 10px
  font-size: 0.85rem
  text-align: center
  border: 1px solid #fee2e2

.auth-footer
  margin-top: 2rem
  text-align: center
  padding-top: 1.5rem
  border-top: 1px solid #f1f5f9

  p
    font-size: 0.9rem
    color: $text-light

  .btn-toggle
    background: none
    border: none
    color: $primary
    font-weight: 700
    cursor: pointer
    margin-left: 4px
    padding: 0
    font-size: 0.9rem
    &:hover
      text-decoration: underline

.fade-enter-active, .fade-leave-active
  transition: opacity 0.3s ease

.fade-enter-from, .fade-leave-to
  opacity: 0

.mini-spinner
  width: 18px
  height: 18px
  border: 2px solid rgba(255,255,255,0.3)
  border-top-color: white
  border-radius: 50%
  animation: spin 0.8s linear infinite

@keyframes spin
  from
    transform: rotate(0deg)
  to
    transform: rotate(360deg)
</style>
