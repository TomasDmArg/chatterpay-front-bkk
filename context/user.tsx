'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { connectWithChatterPay, verifyConnection } from '@/utils/auth';

/**
 * Interface representing the base user information
 */
interface User {
    id: string;
    status: 'verified' | 'pending';
    channelUserId: string;
}

/**
 * Interface representing the authentication state
 */
interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
}

/**
 * Interface representing the authentication context value
 */
interface AuthContextValue extends AuthState {
    /**
     * Initiates the login process with ChatterPay
     * @param channelUserId - The user's channel ID (phone number)
     * @param appName - The application name for ChatterPay
     */
    login: (channelUserId: string, appName?: string) => Promise<void>;

    /**
     * Verifies the OTP code sent to the user
     * @param channelUserId - The user's channel ID (phone number)
     * @param code - The verification code
     */
    verifyCode: (channelUserId: string, code: string) => Promise<void>;

    /**
     * Logs out the current user
     */
    logout: () => void;
}

/**
 * Props for the AuthProvider component
 */
interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Authentication provider component that manages auth state
 */
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
    const router = useRouter();
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        user: null,
    });

    /**
     * Check for existing authentication on mount
     */
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('auth_token');

                if (!token) {
                    setState((prev) => ({ ...prev, isLoading: false }));
                    return;
                }

                // Here you would typically validate the token with your backend
                const user = JSON.parse(localStorage.getItem('user') || 'null');

                setState({
                    isAuthenticated: true,
                    isLoading: false,
                    user,
                });

                router.push('/dashboard');
            } catch (error) {
                console.error('Auth check failed:', error);
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        };

        checkAuth();
    }, []);

    const login = useCallback(async (channelUserId: string, appName = 'ChatterPay Store') => {
        try {
            const response = await connectWithChatterPay(channelUserId.replace("54", "549"), appName);

            if (response.status === 'success') {
                // Store temporary auth state for verification
                sessionStorage.setItem('temp_channel_user_id', channelUserId);
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }, []);

    const verifyCode = useCallback(async (channelUserId: string, code: string) => {
        try {
            const response = await verifyConnection(channelUserId.replace("54", "549"), code);

            if (response.status === 'success') {
                const { access_token, user } = response.data;

                localStorage.setItem('auth_token', access_token);
                localStorage.setItem('user', JSON.stringify(user));

                const { id, status } = user;

                setState({
                    isAuthenticated: true,
                    isLoading: false,
                    user: {
                        channelUserId,
                        id, 
                        status
                    },
                });

                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Code verification failed:', error);
            throw error;
        }
    }, [router]);

    const logout = useCallback(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');

        setState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
        });

        router.push('/login');
    }, [router]);

    const value = useMemo(
        () => ({
            ...state,
            login,
            verifyCode,
            logout,
        }),
        [state, login, verifyCode, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access the authentication context
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

/**
 * HOC to protect routes that require authentication
 */
export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>,
): React.FC<P> {
    return function WithAuthComponent(props: P) {
        const { isAuthenticated, isLoading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!isLoading && !isAuthenticated) {
                router.push('/login');
            }
        }, [isLoading, isAuthenticated, router]);

        if (isLoading) {
            return <div>Loading...</div>; // Consider using a proper loading component
        }

        return isAuthenticated ? <WrappedComponent {...props} /> : null;
    };
}