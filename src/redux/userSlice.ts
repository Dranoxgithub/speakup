import {
  ActionReducerMapBuilder,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { firebaseAuth } from "../Firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "@firebase/auth";

import { RootState } from "./store";

export interface UserState {
  id: string;
  email: string;
  refreshToken: string;
  profilePic: string;
  displayName: string;
  totalAllowedLength: number;
  totalUsedLength: number;
}

interface UserInfo {
  email: string;
  password: string;
}

const initialState: UserState = {
  id: "",
  email: "",
  refreshToken: "",
  profilePic: "",
  displayName: "",
  totalAllowedLength: NaN,
  totalUsedLength: NaN,
};

export const userLoginThunk = createAsyncThunk(
  "user/login",
  async (userLoginInfo: UserInfo) => {
    try {
      const response = await signInWithEmailAndPassword(
        firebaseAuth,
        userLoginInfo.email,
        userLoginInfo.password
      );
      console.log(`User id: ${response.user.refreshToken}`);

      return response;
    } catch (error: any) {
      return Promise.reject(error.message);
    }
  }
);

export const userSignupThunk = createAsyncThunk(
  "user/signup",
  async (userLoginInfo: UserInfo) => {
    try {
      const response = await createUserWithEmailAndPassword(
        firebaseAuth,
        userLoginInfo.email,
        userLoginInfo.password
      );
      return response;
    } catch (error: any) {
      return Promise.reject(error.message);
    }
  }
);

function createLoginExtraReducers(builder: ActionReducerMapBuilder<UserState>) {
  builder.addCase(userLoginThunk.pending, (_) => {
    console.log("User Login pending1.");
  });

  builder.addCase(
    userLoginThunk.fulfilled,
    (state: UserState, action: PayloadAction<any>) => {
      state.id = action.payload.user.localId;
      state.refreshToken = action.payload.user.refreshToken;
      console.log(`User Login success. ${JSON.stringify(action.payload)}`);
    }
  );

  builder.addCase(userLoginThunk.rejected, (_, action) => {
    console.log(`Sdk User Login error. ${action.payload}`);
  });
}

function createSignupExtraReducers(
  builder: ActionReducerMapBuilder<UserState>
) {
  builder.addCase(userSignupThunk.pending, (_) => {
    console.log("User Signup pending.");
  });

  builder.addCase(
    userSignupThunk.fulfilled,
    (state: UserState, action: PayloadAction<any>) => {
      state.id = action.payload.user.localId;
      state.refreshToken = action.payload.user.refreshToken;
      console.log(`User Signup success. ${JSON.stringify(action.payload)}`);
    }
  );

  builder.addCase(userSignupThunk.rejected, (_, action) => {
    console.log(`Sdk User Signup error. ${action.payload}`);
  });
}

export const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    setUserId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
      console.log("Successfully set user id to " + state.id);
    },
    setUserEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
      console.log("Successfully set user email to " + state.email);
    },
    setUserProfilePic: (state, action: PayloadAction<string>) => {
      state.profilePic = action.payload;
      console.log(`Successfully set user profile pic to ${state.profilePic}`)
    },
    setUserDisplayName: (state, action: PayloadAction<string>) => {
      state.displayName = action.payload;
      console.log(`Successfully set user display name to ${state.displayName}`)
    },
    setUserTotalAllowedLength: (state, action: PayloadAction<number>) => {
      state.totalAllowedLength = action.payload;
      console.log(`Successfully set user total allowed length to ${state.totalAllowedLength}`)
    },
    setUserTotalUsedLength: (state, action: PayloadAction<number>) => {
      state.totalUsedLength = action.payload;
      console.log(`Successfully set user total used length to ${state.totalUsedLength}`)
    },
  },
  extraReducers: (builder) => {
    createLoginExtraReducers(builder);
    createSignupExtraReducers(builder);
  },
});

export const { 
  setUserId, 
  setUserEmail, 
  setUserDisplayName, 
  setUserProfilePic, 
  setUserTotalAllowedLength, 
  setUserTotalUsedLength,
} = userSlice.actions;

export const getUserState = ({ user }: RootState) => user;

export const getUserId = ({ user }: RootState) => user.id;
export const getUserEmail = ({ user }: RootState) => user.email;
export const getUserProfilePic = ({ user }: RootState) => user.profilePic;
export const getUserDisplayName = ({ user }: RootState) => user.displayName;
export const getUserTotalAllowedLength = ({ user }: RootState) => user.totalAllowedLength;
export const getUserTotalUsedLength = ({ user }: RootState) => user.totalUsedLength;

export default userSlice.reducer;
