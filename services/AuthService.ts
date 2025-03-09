// services/AuthService.ts

// Define a type for our simplified localStorage
interface SimpleStorage {
  _data: Record<string, string>;
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
  clear(): void;
}

// Create a namespace to avoid conflicts with the actual window.localStorage
declare global {
  var appStorage: SimpleStorage;
}

export const initializeStorage = () => {
  // Initialize storage if it doesn't exist in the global scope
  if (!global.appStorage) {
    global.appStorage = {
      _data: {},
      setItem(key: string, value: string) {
        this._data[key] = value;
      },
      getItem(key: string) {
        return this._data[key] || null;
      },
      removeItem(key: string) {
        delete this._data[key];
      },
      clear() {
        this._data = {};
      },
    };

    // Initialize with a test user
    const testUsers = [
      {
        name: "test1",
        email: "tellisrolwin",
        password: "3#_s8/_aXSpV5Sf",
      },
      {
        name: "test2",
        email: "test",
        password: "test",
      },
    ];

    global.appStorage.setItem("users", JSON.stringify(testUsers));
  }
};

// Add this to check if user is logged in
export const isAuthenticated = () => {
  return global.appStorage?.getItem("isLoggedIn") === "true";
};

// Logout functionality
export const logout = () => {
  global.appStorage?.removeItem("isLoggedIn");
  global.appStorage?.removeItem("currentUser");
};
