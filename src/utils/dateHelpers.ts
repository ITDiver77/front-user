import {
	format,
	isValid,
	parseISO,
	startOfDay,
} from "date-fns";

export const formatDate = (dateString: string, formatStr = "PP") => {
	try {
		const parsed = parseISO(dateString);
		if (isValid(parsed)) {
			return format(parsed, formatStr);
		}
		const fallback = new Date(dateString);
		if (isValid(fallback)) {
			return format(fallback, formatStr);
		}
		return dateString;
	} catch (e) {
		return dateString;
	}
};

export const parseDate = (dateString: string): Date | null => {
	try {
		const parsed = parseISO(dateString);
		if (isValid(parsed)) {
			return parsed;
		}
		const fallback = new Date(dateString);
		if (isValid(fallback)) {
			return fallback;
		}
		return null;
	} catch (e) {
		return null;
	}
};

export const getDaysRemaining = (paydate: string): number => {
	try {
		const payDate = parseDate(paydate);
		if (!payDate) return 0;
		const today = startOfDay(new Date());
		const payDateNormalized = startOfDay(payDate);
		const diffTime = payDateNormalized.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays >= 0 ? diffDays : 0;
	} catch (e) {
		return 0;
	}
};

export const getConnectionStatus = (
	enabled: boolean,
	isActive: boolean,
	paydate: string,
	graceDate: string | null = null,
) => {
	if (!enabled) return "disabled";
	if (!isActive) return "expired";
	if (graceDate !== null && graceDate !== undefined) return "grace";
	const payDate = parseDate(paydate);
	const now = new Date();
	if (payDate && payDate > now) return "active";
	return "expired";
};

export const getStatusColor = (status: "active" | "expired" | "disabled" | "grace") => {
	switch (status) {
		case "active":
			return "success";
		case "grace":
			return "info";
		case "expired":
			return "warning";
		case "disabled":
			return "error";
	}
};
