import { auth } from './config'
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth'


export const registrarUsuario = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return { ok: true, usuario: userCredential.user }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

export const loginUsuario = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { ok: true, usuario: userCredential.user }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

export const cerrarSesion = async () => {
  try {
    await signOut(auth)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

export const enviarEmailVerificacion = async (usuarioActual = null) => {
    try {
        const usuario = usuarioActual || auth.currentUser
        if (!usuario) throw new Error('Usuario no encontrado')

        if (usuario.emailVerified) {
            console.log('Email ya verificado')
            return { ok: true, mensaje: 'Email ya verificado' }
        }

        await sendEmailVerification(usuario, {
            url: 'http://localhost:5173/'
        })

        console.log('Email de verificación enviado')
        return { ok: true, mensaje: 'Email de verificación enviado' }

    } catch (error) {
        console.error('Error al enviar el correo de verificación:', error)
        return { ok: false, error: error.message }
    }
}
