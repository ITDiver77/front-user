import { z } from "zod";

const passwordMinLength = 8;

const passwordRules = {
	uppercase: /[A-Z]/,
	lowercase: /[a-z]/,
	number: /[0-9]/,
};

export const passwordSchema = z
	.string()
	.min(
		passwordMinLength,
		`Password must be at least ${passwordMinLength} characters`,
	)
	.max(72, "Password cannot exceed 72 characters")
	.regex(
		passwordRules.uppercase,
		"Password must contain at least one uppercase letter",
	)
	.regex(
		passwordRules.lowercase,
		"Password must contain at least one lowercase letter",
	)
	.regex(passwordRules.number, "Password must contain at least one number");

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
		username: z
			.string()
			.min(3, "Username must be at least 3 characters")
			.max(20, "Username cannot exceed 20 characters")
			.regex(
				/^[a-zA-Z0-9_]+$/,
				"Username can only contain English letters, numbers, and underscores",
			),
		password: passwordSchema,
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

export const emailRegistrationSchema = z
	.object({
		username: z
			.string()
			.min(3, "Username must be at least 3 characters")
			.max(20, "Username cannot exceed 20 characters")
			.regex(
				/^[a-zA-Z0-9_]+$/,
				"Username can only contain English letters, numbers, and underscores",
			),
		email: z.string().email("Please enter a valid email address"),
		password: passwordSchema,
		confirmPassword: z
			.string()
			.min(1, "Please confirm your password")
			.max(72, "Password cannot exceed 72 characters"),
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
		newPassword: passwordSchema,
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
		newPassword: passwordSchema,
		confirmPassword: z
			.string()
			.min(1, "Please confirm your new password")
			.max(72, "Password cannot exceed 72 characters"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const newPasswordSchema = z
	.object({
		newPassword: passwordSchema,
		confirmPassword: z
			.string()
			.min(1, "Please confirm your password")
			.max(72, "Password cannot exceed 72 characters"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const profileSchema = z.object({
	firstName: z
		.string()
		.max(50, "First name cannot exceed 50 characters")
		.optional(),
	lastName: z
		.string()
		.max(50, "Last name cannot exceed 50 characters")
		.optional(),
	displayName: z
		.string()
		.max(50, "Display name cannot exceed 50 characters")
		.optional(),
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
