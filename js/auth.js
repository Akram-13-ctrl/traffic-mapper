import { auth, db, isFirebasePlaceholder } from "./firebase-config.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, deleteDoc } from "firebase/firestore";

// Seed Simulation Users in localStorage if not already present
const seedSimulationUsers = () => {
  const users = localStorage.getItem("sim_users");
  if (!users) {
    const defaultUsers = [
      {
        uid: "sim-admin-id",
        fullName: "System Administrator",
        email: "admin@safety.org",
        password: "admin123", // simulation simple check
        role: "admin",
        createdAt: new Date().toISOString()
      },
      {
        uid: "sim-user-id",
        fullName: "John Doe",
        email: "user@safety.org",
        password: "user123",
        role: "user",
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem("sim_users", JSON.stringify(defaultUsers));
  }
};
seedSimulationUsers();

// Login as Admin
export async function loginAdmin(email, password) {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (isFirebasePlaceholder) {
    // Simulation Mode
    const simUsers = JSON.parse(localStorage.getItem("sim_users") || "[]");
    const found = simUsers.find(u => (u.email || "").toLowerCase() === cleanEmail && u.password === password);
    
    if (found) {
      if (found.role === "admin") {
        localStorage.setItem("current_user", JSON.stringify(found));
        localStorage.setItem("gis_user_email", found.email);
        return found;
      } else {
        throw new Error("Access denied. This account is not registered as an administrator.");
      }
    } else {
      throw new Error("Invalid email address or password.");
    }
  }

  // Real Firebase Mode
  try {
    const userCredential = await signInWithEmailAndPassword(auth, (email || "").trim(), password);
    const user = userCredential.user;
    
    // Check role in firestore 'users' or 'admins'
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data().role === "admin") {
      const userData = userDoc.data();
      const payload = { uid: user.uid, ...userData };
      localStorage.setItem("current_user", JSON.stringify(payload));
      localStorage.setItem("gis_user_email", payload.email || user.email);
      return userData;
    } else {
      // Sign out and deny access
      await signOut(auth);
      throw new Error("Access denied. This account is not registered as an administrator.");
    }
  } catch (error) {
    throw new Error(error.message || "Failed to log in as administrator.");
  }
}

// Login as User
export async function loginUser(email, password) {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (isFirebasePlaceholder) {
    // Simulation Mode
    const simUsers = JSON.parse(localStorage.getItem("sim_users") || "[]");
    const found = simUsers.find(u => (u.email || "").toLowerCase() === cleanEmail && u.password === password);
    
    if (found) {
      localStorage.setItem("current_user", JSON.stringify(found));
      localStorage.setItem("gis_user_email", found.email);
      return found;
    } else {
      throw new Error("Invalid email address or password.");
    }
  }

  // Real Firebase Mode
  try {
    const userCredential = await signInWithEmailAndPassword(auth, (email || "").trim(), password);
    const user = userCredential.user;
    
    // Check role in firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const payload = { uid: user.uid, ...userData };
      localStorage.setItem("current_user", JSON.stringify(payload));
      localStorage.setItem("gis_user_email", payload.email || user.email);
      return userData;
    } else {
      // If user doc doesn't exist, create default user role document
      const defaultData = {
        uid: user.uid,
        fullName: user.displayName || "New User",
        email: user.email,
        role: "user",
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, defaultData);
      localStorage.setItem("current_user", JSON.stringify(defaultData));
      localStorage.setItem("gis_user_email", defaultData.email);
      return defaultData;
    }
  } catch (error) {
    throw new Error(error.message || "Failed to log in as user.");
  }
}

// Register as User
export async function registerUser(fullName, email, password) {
  if (isFirebasePlaceholder) {
    // Simulation Mode
    const simUsers = JSON.parse(localStorage.getItem("sim_users") || "[]");
    const exists = simUsers.some(u => u.email === email);
    if (exists) {
      throw new Error("This email is already registered.");
    }
    
    const newUser = {
      uid: "sim-" + Date.now(),
      fullName,
      email,
      password, // in sim we store plain password
      role: "user",
      createdAt: new Date().toISOString()
    };
    
    simUsers.push(newUser);
    localStorage.setItem("sim_users", JSON.stringify(simUsers));
    return newUser;
  }

  // Real Firebase Mode
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userData = {
      uid: user.uid,
      fullName,
      email,
      role: "user",
      createdAt: new Date().toISOString()
    };
    
    // Save in firestore
    await setDoc(doc(db, "users", user.uid), userData);
    return userData;
  } catch (error) {
    throw new Error(error.message || "Registration failed.");
  }
}

// Forgot Password
export async function resetPassword(email) {
  if (isFirebasePlaceholder) {
    // Simulation mode success trigger
    return true;
  }
  
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw new Error(error.message || "Error while resetting password.");
  }
}

// Get Logged In User
export function getCurrentUser() {
  const user = localStorage.getItem("current_user");
  return user ? JSON.parse(user) : null;
}

// Log Out
export async function logout() {
  const currentUser = getCurrentUser();
  const role = currentUser?.role;

  localStorage.removeItem("current_user");
  localStorage.removeItem("gis_user_email");
  if (!isFirebasePlaceholder && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase signout error:", err);
    }
  }

  if (role === "admin") {
    window.location.href = "admin-login.html";
  } else if (role === "user") {
    window.location.href = "user-login.html";
  } else {
    window.location.href = "index.html";
  }
}

// Get Users List (Real Firestore or Simulation)
export async function getUsersList() {
  if (isFirebasePlaceholder) {
    return JSON.parse(localStorage.getItem("sim_users") || "[]");
  }

  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ uid: doc.id, ...doc.data() });
    });
    return list;
  } catch (error) {
    throw new Error(error.message || "Gagal mendapatkan senarai pengguna dari Firestore.");
  }
}

// Update User Role (Real Firestore or Simulation)
export async function updateUserRole(uid, targetRole, email = "") {
  const normalizedUid = String(uid || "").trim();
  const normalizedEmail = String(email || "").trim().toLowerCase();

  let simUsers = JSON.parse(localStorage.getItem("sim_users") || "[]");
  const index = simUsers.findIndex(u => {
    const uUid = String(u.uid || "").trim();
    const uEmail = String(u.email || "").trim().toLowerCase();
    return (normalizedUid && uUid === normalizedUid) || (normalizedEmail && uEmail === normalizedEmail);
  });

  if (index !== -1) {
    simUsers[index].role = targetRole;
    localStorage.setItem("sim_users", JSON.stringify(simUsers));

    const current = getCurrentUser();
    if (current && (current.uid === normalizedUid || (current.email && current.email.toLowerCase() === normalizedEmail))) {
      current.role = targetRole;
      localStorage.setItem("current_user", JSON.stringify(current));
    }
  }

  if (!isFirebasePlaceholder && db && uid) {
    try {
      const userDocRef = doc(db, "users", uid);
      await updateDoc(userDocRef, { role: targetRole });
    } catch (fbErr) {
      console.warn("Firestore update role error:", fbErr);
    }
  }

  window.dispatchEvent(new CustomEvent("users_updated"));
  return true;
}

// Delete User Account (Real Firestore or Simulation)
export async function deleteUserAccount(uid, email = "") {
  const normalizedUid = String(uid || "").trim();
  const normalizedEmail = String(email || "").trim().toLowerCase();

  let simUsers = JSON.parse(localStorage.getItem("sim_users") || "[]");
  const beforeCount = simUsers.length;
  simUsers = simUsers.filter(u => {
    const uUid = String(u.uid || "").trim();
    const uEmail = String(u.email || "").trim().toLowerCase();
    if (normalizedUid && uUid === normalizedUid) return false;
    if (normalizedEmail && uEmail === normalizedEmail) return false;
    return true;
  });

  localStorage.setItem("sim_users", JSON.stringify(simUsers));

  // If deleted account happens to be stored in current_user session, clear it
  const current = getCurrentUser();
  if (current && (current.uid === normalizedUid || (current.email && current.email.toLowerCase() === normalizedEmail))) {
    localStorage.removeItem("current_user");
    localStorage.removeItem("gis_user_email");
  }

  if (!isFirebasePlaceholder && db && uid) {
    try {
      await deleteDoc(doc(db, "users", uid));
    } catch (fbErr) {
      console.warn("Firestore delete user error:", fbErr);
    }
    try {
      await deleteDoc(doc(db, "admins", uid));
    } catch (fbErr2) {
      console.warn("Firestore delete admin doc error:", fbErr2);
    }
  }

  window.dispatchEvent(new CustomEvent("users_updated"));
  return true;
}

// Create New Admin Account (by logged-in administrator)
export async function createAdminAccount({ fullName, email, password, agency, phone }) {
  if (isFirebasePlaceholder || !auth || !db) {
    const simUsers = JSON.parse(localStorage.getItem("sim_users") || "[]");
    if (simUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with this email address already exists.");
    }
    const newAdmin = {
      uid: "admin-" + Date.now(),
      fullName,
      email,
      password: password || "admin123",
      role: "admin",
      agency: agency || "JKR (Public Works)",
      phone: phone || "",
      createdAt: new Date().toISOString()
    };
    simUsers.push(newAdmin);
    localStorage.setItem("sim_users", JSON.stringify(simUsers));
    window.dispatchEvent(new CustomEvent("users_updated"));
    return newAdmin;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const adminData = {
      uid: user.uid,
      fullName,
      email,
      role: "admin",
      agency: agency || "JKR (Public Works)",
      phone: phone || "",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "users", user.uid), adminData);
    await setDoc(doc(db, "admins", user.uid), { email, role: "Admin", agency });
    window.dispatchEvent(new CustomEvent("users_updated"));
    return adminData;
  } catch (error) {
    throw new Error(error.message || "Failed to create administrator account.");
  }
}

// Update Logged-in Admin Profile
export async function updateAdminProfile({ fullName, agency, phone }) {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error("No user is currently logged in.");

  const updated = {
    ...currentUser,
    fullName: fullName || currentUser.fullName,
    agency: agency || currentUser.agency || "JKR (Public Works)",
    phone: phone || currentUser.phone || ""
  };

  localStorage.setItem("current_user", JSON.stringify(updated));

  if (isFirebasePlaceholder || !db) {
    const simUsers = JSON.parse(localStorage.getItem("sim_users") || "[]");
    const idx = simUsers.findIndex(u => u.uid === currentUser.uid || u.email === currentUser.email);
    if (idx !== -1) {
      simUsers[idx] = { ...simUsers[idx], ...updated };
      localStorage.setItem("sim_users", JSON.stringify(simUsers));
    }
  } else {
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        fullName: updated.fullName,
        agency: updated.agency,
        phone: updated.phone
      });
    } catch (err) {
      console.warn("Firestore profile update error:", err);
    }
  }

  window.dispatchEvent(new CustomEvent("user_profile_updated"));
  return updated;
}
