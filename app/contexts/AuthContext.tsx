//! context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useReducer } from "react";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "../utils/api";
import { AuthState, LoginPayload, User } from "@/types/auth";

type Action = 
   | { type: 'RESTORE'; payload: Partial<AuthState> }
   | { type: "LOGIN"; payload: { user: User; accessToken: string; refreshToken: string } }
   | { type: 'LOGOUT' }
   | { type: "REFRESH"; payload: { accessToken: string } };

const initialState: AuthState = {
    isReady: false,
    isAuth: false,
    accessToken: null,
    refreshToken: null,
    user: null,
}

function authReducer(state: AuthState, action: Action): AuthState {
    switch (action.type) {
        case "RESTORE": 
            return { ...state, ...action.payload, isReady: true };
        case "LOGIN":
            return {
                ...state,
                isAuth: true,
                user: action.payload.user,
                accessToken: action.payload.accessToken,
                refreshToken: action.payload.refreshToken,
                isReady: true,
            };
        case "LOGOUT":
            return {
                ...state,
                isReady: true,
                isAuth: false,
                accessToken: null,
                refreshToken: null,
                user: null,
            };
        case "REFRESH":
            return {
                ...state,
                accessToken: action.payload.accessToken,
            };
        default:
            return state;
    }
}

type AuthContextProps = {
    auth: AuthState;
    login: (p: LoginPayload) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<string | null>;
};

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [auth, dispatch] = useReducer(authReducer, initialState);

    // handle error in apiFetch
    const handleError = (title: string, err: any) => {
        const msg = err?.response?.data?.message || err.message || "Unknown error";
        // error alert have to show here, but we don't have access to Alert in this context. So we can just log it for now.
        throw err;
    }

    useEffect(() => {
        (async () => {
            const [access, refresh, rawUser] = await Promise.all([
                SecureStore.getItemAsync("accessToken"),
                SecureStore.getItemAsync("refreshToken"),
                SecureStore.getItemAsync("user"),
            ]);

            if (access && refresh && rawUser) {
                const user = JSON.parse(rawUser) as User;
                dispatch({
                    type: 'RESTORE',
                    payload: {
                        accessToken: access, refreshToken: refresh, user, isAuth: true
                    }
                })
            }
        })();
    },[]);

    // persistence token user 
    const persist = async (user: User, access: string, refresh: string) => {
        await Promise.all([
            SecureStore.setItemAsync('accessToken', access),
            SecureStore.setItemAsync('refreshToken', refresh),
            SecureStore.setItemAsync("user", JSON.stringify(user))
        ]);
    };

    // core actions
    const login = async (payload: LoginPayload) => {
        try {
            const data = await apiFetch<{ accessToken: string; user: User; refreshToken?: string }>('/auth/login', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const refreshTokenValue = data.refreshToken ?? '';
            await persist(data.user, data.accessToken, refreshTokenValue);
            dispatch({
                type: "LOGIN",
                payload: {
                    user: data.user,
                    accessToken: data.accessToken,
                    refreshToken: refreshTokenValue,
                }
            });
        } catch (error) {
            handleError('Login failed', error);
        }
    };

    const logout = async () => {
        await Promise.all([
            SecureStore.deleteItemAsync('accessToken'),
            SecureStore.deleteItemAsync('refreshToken'),
            SecureStore.deleteItemAsync('user'),
        ]);

        dispatch({ type: 'LOGOUT' });
    };

    const refreshToken = async (): Promise<string | null> => {
        const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
        return storedRefreshToken;
    };

    return (
        <AuthContext.Provider
           value={{
            auth,
            login,
            logout,
            refreshToken,
           }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// Hooks for the authentication
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error(" useAuth must be used within AuthProvider");
    return ctx;
}