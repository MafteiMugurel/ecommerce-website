// Utilizatorul autentificat, așa cum îl vede aplicația
// (corespunde cu `User` din Firebase Auth: uid, displayName, email).
export interface User {
  uid: string
  displayName: string
  email: string
  createdAt: string
}
