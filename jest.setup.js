// Skip react-native-gesture-handler setup for now

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => false,
  }),
}));

// Mock expo-image
jest.mock("expo-image", () => ({
  Image: "Image",
}));

// Mock contexts
jest.mock("./contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { type: "developer", name: "Test User" },
    logout: jest.fn(),
  }),
}));

jest.mock("./contexts/ProfileContext", () => ({
  useProfile: () => ({
    profile: { fotoUri: null },
  }),
}));

// Mock API
jest.mock("./services/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));
