"use server";

import { headers } from "next/headers";

export interface CurrentUser {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Get the current user from the request headers.
 * The proxy middleware injects user info into x-user header.
 */
export async function currentUser(): Promise<CurrentUser | null> {
    try {
        const headersList = await headers();
        const userHeader = headersList.get('x-user');
        
        if (!userHeader) {
            return null;
        }
        
        const user = JSON.parse(userHeader) as CurrentUser;
        return user;
    } catch (error) {
        console.error('Error parsing user from headers:', error);
        return null;
    }
}
