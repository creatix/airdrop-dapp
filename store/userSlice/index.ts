import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AppState } from "../rootReducer";
import { CreateUser, LeaderboardUsers, Quest, SignupStepCompleted, User } from "@/lib/types";
import { fetchLeaderboard, fetchTwitterAuthUrl, fetchUser, postAuthenticateUser, postComingSoonSubscribe, postCreateUser } from "@/lib/api";
import { RootState } from "../store";
import { Address } from "viem";

const initUser: User = {
  id: "",
  walletAddress: "",
  twitterAccountId: "",
  points: 0,
  referralCode: "",
  leaderboardPosition: 0,
  pointsLastUpdatedAt: "",
  walletAgeInDays: 0,
}

const initQuest: Quest = {
  title: "",
  point: "",
  description: "",
  image: "",
  isActive: false,
  button: "",
  link: "",
  completed: false,
}

const initSignupStepCompleted: SignupStepCompleted = {
  1: false,
  2: false,
  3: false,
}

export interface UserStateType {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  isCreating: boolean;
  isRetrieving: boolean;
  isLeaderboardUsersLoading: boolean;
  isGeneratingTwitterAuthUrl: boolean;
  isSubmittingComingSoonSubscribe: boolean;
  totalSignupStepCompleted: number;
  isUser: boolean;
  isHydrated: boolean;
  isQuestModalOpen: boolean;
  selectedQuest: Quest;
  currentComponent: string;
  signupStepCompleted: SignupStepCompleted;
  connectWalletLocation: string;
  inviteCode: string;
  accessToken: string;
  user: User;
  leaderboardUsers: LeaderboardUsers;
  lastLeaderboardUserId: string;
  isLeaderboardUsersFinished: boolean;
  twitterAuthUrl: string;
  isSubmittedComingSoonSubscribe: boolean;
  isErrorSubmittingComingSoonSubscribe: boolean;
}

const INIT_STATE: UserStateType = {
  isAuthenticating: false,
  isAuthenticated: false,
  isCreating: false,
  isRetrieving: false,
  isLeaderboardUsersLoading: false,
  isGeneratingTwitterAuthUrl: false,
  isSubmittingComingSoonSubscribe: false,
  isUser: false,
  totalSignupStepCompleted: 0,
  isHydrated: false,
  isQuestModalOpen: false,
  selectedQuest: initQuest,
  currentComponent: "landing",
  signupStepCompleted: initSignupStepCompleted,
  connectWalletLocation: "",
  inviteCode: "",
  accessToken: "",
  user: initUser,
  leaderboardUsers: [],
  lastLeaderboardUserId: "",
  isLeaderboardUsersFinished: false,
  twitterAuthUrl: "",
  isSubmittedComingSoonSubscribe: false,
  isErrorSubmittingComingSoonSubscribe: false,
};

export const authenticate = createAsyncThunk(
  "USER/AUTHENTICATE",
  async ({
    eoaAddress,
  }: {
    eoaAddress: Address;
  }) => {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const authenticatedUser = await postAuthenticateUser(eoaAddress);
        if (authenticatedUser?.jwt) {
          resolve(authenticatedUser.jwt);
        } else {
          reject();
        }
      } catch (error) {
        console.error(error);
        reject();
      }
    });
  }
);

export const create = createAsyncThunk<
  any,
  {
    createUserDetail: CreateUser;
  },
  { state: RootState }
>(
  "USER/CREATE",
  async ({
    createUserDetail,
  }: {
    createUserDetail: CreateUser;
  },
    thunkAPI
  ) => {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const state = thunkAPI.getState();
        const userState: UserStateType = state.user;
        const createdUser = await postCreateUser(createUserDetail, userState.accessToken);
        if (createdUser?.id) {
          resolve(createdUser);
        } else {
          reject();
        }
      } catch (error: any) {
        if (error?.response?.status === 400) {
          thunkAPI.dispatch(retrieve());
        }
        console.error(error);
        reject();
      }
    });
  }
);

export const retrieve = createAsyncThunk<
  any,
  undefined,
  { state: RootState }
>(
  "USER/RETRIEVE",
  async (
    _,
    thunkAPI
  ) => {
    function redirectToSignupPage(userState: UserStateType) {
      if (userState.currentComponent === "landing" && userState.connectWalletLocation === "navbar") {
        thunkAPI.dispatch(setConnectWalletLocation(""));
        thunkAPI.dispatch(setCurrentComponent("signup"));
      }
    }

    return new Promise<any>(async (resolve, reject) => {
      const state = thunkAPI.getState();
      const userState: UserStateType = state.user;
      try {

        const fetchedUser = await fetchUser(userState.accessToken);
        if (fetchedUser?.id) {
          resolve(fetchedUser);
        } else {
          redirectToSignupPage(userState);
          reject();
        }
      } catch (error) {
        redirectToSignupPage(userState);
        console.error(error);
        reject();
      }
    });
  }
);

export const fetchLeaderboardUsers = createAsyncThunk<
  any,
  {
    queryParams: Record<string, string>;
  },
  { state: RootState }
>(
  "USER/FETCH_LEADERBOARD_USERS",
  async ({
    queryParams,
  }: {
    queryParams: Record<string, string>;
  },
    thunkAPI
  ) => {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const state = thunkAPI.getState();
        const userState: UserStateType = state.user;
        const leaderboard = await fetchLeaderboard(queryParams, userState.accessToken);
        resolve(leaderboard.users);
      } catch (error) {
        console.error(error);
        reject();
      }
    });
  }
);

export const generateTwitterAuthUrl = createAsyncThunk<
  any,
  undefined,
  { state: RootState }
>(
  "USER/GENERATE_TWITTER_AUTH_URL",
  async (
    _,
    thunkAPI
  ) => {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const state = thunkAPI.getState();
        const userState: UserStateType = state.user;
        const generatedTwitterAuthUrl = await fetchTwitterAuthUrl(userState.accessToken);
        resolve(generatedTwitterAuthUrl.authUrl);
      } catch (error) {
        console.error(error);
        reject();
      }
    });
  }
);

export const submitComingSoonSubscribe = createAsyncThunk(
  "USER/SUBMIT_COMING_SOON_SUBSCRIBE",
  async ({
    email,
  }: {
    email: string;
  }) => {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const submittedComingSoonSubscribe = await postComingSoonSubscribe(email);
        resolve(submittedComingSoonSubscribe);
      } catch (error) {
        console.error(error);
        reject();
      }
    });
  }
);

const userSlice = createSlice({
  name: "USER_STATE",
  initialState: INIT_STATE,
  reducers: {
    setIsQuestModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isQuestModalOpen = action.payload
    },
    setSelectedQuest: (state, action: PayloadAction<Quest>) => {
      state.selectedQuest = action.payload
    },
    setCurrentComponent: (state, action: PayloadAction<string>) => {
      state.currentComponent = action.payload
    },
    setSignupStepCompleted: (state, action: PayloadAction<{ key: number, value: boolean }>) => {
      state.signupStepCompleted[action.payload.key] = action.payload.value
      localStorage.setItem("airdrop-signupStepCompleted", JSON.stringify(state.signupStepCompleted));
    },
    setConnectWalletLocation: (state, action: PayloadAction<string>) => {
      state.connectWalletLocation = action.payload
    },
    setInviteCode: (state, action: PayloadAction<string>) => {
      state.inviteCode = action.payload
      localStorage.setItem("airdrop-inviteCode", action.payload);
    },
    setTotalSignupStepCompleted: (state) => {
      let totalSteps = 0;
      for(let property in state.signupStepCompleted) {
        if(state.signupStepCompleted[property]) {
          totalSteps += 1
        }
      }
      state.totalSignupStepCompleted = totalSteps;
      localStorage.setItem("airdrop-totalSignupStepCompleted", JSON.stringify(totalSteps));
    },
    setLeaderboardUsers: (state, action: PayloadAction<LeaderboardUsers>) => {
      state.leaderboardUsers = action.payload
      localStorage.setItem("airdrop-leaderboardUsers", JSON.stringify(action.payload));
    },
    setLogout: (state) => {
      state.inviteCode = "";
      state.accessToken = "";
      state.isAuthenticated = false;
      state.isUser = false;
      state.user = initUser;
      state.leaderboardUsers = [];
      state.lastLeaderboardUserId = "";
      state.isLeaderboardUsersFinished = false;
      state.totalSignupStepCompleted = 0;
      state.signupStepCompleted = initSignupStepCompleted;
      localStorage.removeItem("airdrop-inviteCode");
      localStorage.removeItem("airdrop-accessToken");
      localStorage.removeItem("airdrop-isUser");
      localStorage.removeItem("airdrop-user");
      localStorage.removeItem("airdrop-leaderboardUsers");
      localStorage.removeItem("airdrop-lastLeaderboardUserId");
      localStorage.removeItem("airdrop-isLeaderboardUsersFinished");
      localStorage.removeItem("airdrop-totalSignupStepCompleted");
      localStorage.removeItem("airdrop-signupStepCompleted");
    },
    setHydrate: (state) => {
      const inviteCode = localStorage.getItem("airdrop-inviteCode");
      const accessToken = localStorage.getItem("airdrop-accessToken");
      const isUser = localStorage.getItem("airdrop-isUser");
      const user = localStorage.getItem("airdrop-user");
      const leaderboardUsers = localStorage.getItem("airdrop-leaderboardUsers");
      const lastLeaderboardUserId = localStorage.getItem("airdrop-lastLeaderboardUserId");
      const isLeaderboardUsersFinished = localStorage.getItem("airdrop-isLeaderboardUsersFinished");
      const totalSignupStepCompleted = localStorage.getItem("airdrop-totalSignupStepCompleted");
      const signupStepCompleted = localStorage.getItem("airdrop-signupStepCompleted");
      state.inviteCode = inviteCode ?? "";
      state.accessToken = accessToken ?? "";
      state.isAuthenticated = !!accessToken;
      state.isUser = isUser ? JSON.parse(isUser) : false;
      state.user = user ? JSON.parse(user) : initUser;
      state.leaderboardUsers = leaderboardUsers ? JSON.parse(leaderboardUsers) : [];
      state.lastLeaderboardUserId = lastLeaderboardUserId ?? "";
      state.isLeaderboardUsersFinished = isLeaderboardUsersFinished ? JSON.parse(isLeaderboardUsersFinished) : false;
      state.totalSignupStepCompleted = totalSignupStepCompleted ? JSON.parse(totalSignupStepCompleted) : false;
      state.signupStepCompleted = signupStepCompleted ? JSON.parse(signupStepCompleted) : initSignupStepCompleted;
      state.isHydrated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(authenticate.pending, (state) => {
        state.isAuthenticating = true;
      })
      .addCase(authenticate.fulfilled, (state, action) => {
        state.isAuthenticating = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload;
        localStorage.setItem("airdrop-accessToken", action.payload);
      })
      .addCase(authenticate.rejected, (state) => {
        state.isAuthenticating = false;
      })
      .addCase(create.pending, (state) => {
        state.isCreating = true;
      })
      .addCase(create.fulfilled, (state, action) => {
        state.isCreating = false;
        state.isUser = true;
        state.user = action.payload;
        localStorage.setItem("airdrop-isUser", "true");
        localStorage.setItem("airdrop-user", JSON.stringify(action.payload));
      })
      .addCase(create.rejected, (state) => {
        state.isCreating = false;
      })
      .addCase(retrieve.pending, (state) => {
        state.isRetrieving = true;
      })
      .addCase(retrieve.fulfilled, (state, action) => {
        state.isRetrieving = false;
        state.isUser = true;
        state.user = action.payload;
        localStorage.setItem("airdrop-isUser", "true");
        localStorage.setItem("airdrop-user", JSON.stringify(action.payload));
      })
      .addCase(retrieve.rejected, (state) => {
        state.isRetrieving = false;
      })
      .addCase(fetchLeaderboardUsers.pending, (state) => {
        state.isLeaderboardUsersLoading = true;
      })
      .addCase(fetchLeaderboardUsers.fulfilled, (state, action) => {
        state.isLeaderboardUsersLoading = false;
        if (action.payload.length) {
          const leaderboardUsers = [...state.leaderboardUsers, ...action.payload];
          const lastLeaderboardUserId = action.payload[action.payload.length - 1].id

          state.leaderboardUsers = leaderboardUsers
          state.lastLeaderboardUserId = lastLeaderboardUserId;

          localStorage.setItem("airdrop-leaderboardUsers", JSON.stringify(leaderboardUsers));
          localStorage.setItem("airdrop-lastLeaderboardUserId", lastLeaderboardUserId);
        } else {
          state.isLeaderboardUsersFinished = true;
          localStorage.setItem("airdrop-isLeaderboardUsersFinished", "true");
        }
      })
      .addCase(fetchLeaderboardUsers.rejected, (state) => {
        state.isLeaderboardUsersLoading = false;
      })
      .addCase(generateTwitterAuthUrl.pending, (state) => {
        state.isGeneratingTwitterAuthUrl = true;
      })
      .addCase(generateTwitterAuthUrl.fulfilled, (state, action) => {
        state.isGeneratingTwitterAuthUrl = false;
        state.twitterAuthUrl = action.payload;
      })
      .addCase(generateTwitterAuthUrl.rejected, (state) => {
        state.isGeneratingTwitterAuthUrl = false;
      })
      .addCase(submitComingSoonSubscribe.pending, (state) => {
        state.isSubmittingComingSoonSubscribe = true;
      })
      .addCase(submitComingSoonSubscribe.fulfilled, (state, action) => {
        state.isSubmittingComingSoonSubscribe = false;
        state.isSubmittedComingSoonSubscribe = true;
      })
      .addCase(submitComingSoonSubscribe.rejected, (state) => {
        state.isSubmittingComingSoonSubscribe = false;
        state.isErrorSubmittingComingSoonSubscribe = true;
      })
  },
});

export const selectUserSlice = (state: AppState): UserStateType => state.user;

export const {
  setIsQuestModalOpen,
  setSelectedQuest,
  setCurrentComponent,
  setSignupStepCompleted,
  setConnectWalletLocation,
  setInviteCode,
  setTotalSignupStepCompleted,
  setLeaderboardUsers,
  setLogout,
  setHydrate
} = userSlice.actions;

export default userSlice.reducer;
