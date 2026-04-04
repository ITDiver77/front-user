import { z } from "zod";

export const loginSchema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z
		.string()
		.min(1, "Password is required")
		.max(72, "Password cannot exceed 72 characters"),
	rememberMe: z.boolean().default(false),
});

export const registerSchema = z
	.object({
		username: z.string().min(3, "Username must be at least 3 characters"),
		password: z
			.string()
			.min(6, "Password must be at least 6 characters")
			.max(72, "Password cannot exceed 72 characters"),
		confirmPassword: z
			.string()
			.min(1, "Please confirm your password")
			.max(72, "Password cannot exceed 72 characters"),
		telegramId: z.string().optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const forgotPasswordSchema = z.object({
	username: z.string().min(1, "Username is required"),
});

export const resetPasswordSchema = z
	.object({
		token: z.string().min(1, "Token is required"),
		newPassword: z
			.string()
			.min(6, "Password must be at least 6 characters")
			.max(72, "Password cannot exceed 72 characters"),
		confirmPassword: z
			.string()
			.min(1, "Please confirm your password")
			.max(72, "Password cannot exceed 72 characters"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const changePasswordSchema = z
	.object({
		oldPassword: z
			.string()
			.min(1, "Current password is required")
			.max(72, "Password cannot exceed 72 characters"),
		newPassword: z
			.string()
			.min(6, "New password must be at least 6 characters")
			.max(72, "Password cannot exceed 72 characters"),
		confirmPassword: z
			.string()
			.min(1, "Please confirm your new password")
			.max(72, "Password cannot exceed 72 characters"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const newConnectionSchema = z.object({
	serverName: z.string().min(1, "Server selection is required"),
	months: z
		.number()
		.int()
		.min(1, "At least 1 month")
		.max(36, "Maximum 36 months"),
	connectionName: z.string().optional(),
	autoRenew: z.boolean().default(true),
});

export const changeServerSchema = z.object({
	newServerName: z.string().min(1, "Server selection is required"),
});

export const paymentInitiationSchema = z.object({
	months: z
		.number()
		.int()
		.min(1, "At least 1 month")
		.max(36, "Maximum 36 months"),
	paymentMethod: z.string().optional(),
});

export const emailSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.email("Please enter a valid email address"),
});
