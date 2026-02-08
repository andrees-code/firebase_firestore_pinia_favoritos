import { db } from './config';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';


export const guardarPerfilUsuario = async (usuarioId, datosPerfil) => {
  try {
    const docRef = doc(db, 'usuarios', usuarioId);
    if (!datosPerfil.favoritos) datosPerfil.favoritos = [];
    await setDoc(docRef, datosPerfil, { merge: true });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};


export const obtenerPerfilUsuario = async (usuarioId) => {
  try {
    const docRef = doc(db, 'usuarios', usuarioId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ok: true, perfil: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { ok: false, error: "No existe el usuario" };
    }
  } catch (error) {
    return { ok: false, error: error.message };
  }
};


export const agregarFavorito = async (usuarioId, itemId) => {
  try {
    const docRef = doc(db, 'usuarios', usuarioId);
    await updateDoc(docRef, {
      favoritos: arrayUnion(String(itemId))
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};


export const quitarFavorito = async (usuarioId, itemId) => {
  try {
    const docRef = doc(db, 'usuarios', usuarioId);
    await updateDoc(docRef, {
      favoritos: arrayRemove(String(itemId))
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};