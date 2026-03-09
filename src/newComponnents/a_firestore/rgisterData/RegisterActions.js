import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from '../../FbConfig.js'
import { collection, doc, setDoc, getDocs, getDoc, addDoc, updateDoc } from "firebase/firestore";

const updateProfileUser = (docId) => {
  updateProfile(auth.currentUser, {
    docId: docId,
    photoURL: ''
  }).then(() => {
    console.log ('Profile updated!')
  }).catch((error) => {
    console.log (error)
  });
}

export const signUp = async (props) => {
  const { email, password, userName, userRole, actions } = props;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    actions?.setAlert?.('newUser');
    return user; // מחזיר את המשתמש
  } catch (error) {
    console.error("Sign up error", error);
    throw error; // מעביר את השגיאה למי שקרא
  }
}

export const signIn = async (props) => {
  const { email, password } = props;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Sign in error", error);
    throw error;
  }
}

export const signOut = (actions) => {
  auth.signOut().then(() => {
    actions.setNavTo('')
  }).catch((error) => {

  })
}
