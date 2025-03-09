// global.d.ts
declare global {
  var currentUser: {
    id: number;
    name: string;
    email: string;
  } | null; // Define the structure of currentUser

  var isLoggedIn: boolean;

  var appStorage: any; // Keep appStorage if it's still needed
}

export {}; // This is needed to make it a module
