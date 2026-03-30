import {
	addDays,
	differenceInDays,
	format,
	isBefore,
	parseISO,
} from "date-fns";

export const formatDate = (dateString: string, formatStr = "PP") => {
	try {
		return format(parseISO(dateString), formatStr);
	} catch (e) {
		return dateString;
	}
};

export const getDaysRemaining = (paydate: string): number => {
	try {
		const payDate = parseISO(paydate);
		const today = new Date();
		const diff = differenceInDays(payDate, today);
		return diff >= 0 ? diff : 0;
	} catch (e) {
		return 0;
	}
};

export const getConnectionStatus = (
	enabled: boolean,
	isActive: boolean,
	paydate: string,
) => {
	if (!enabled) return "disabled";
	if (!isActive) return "expired";
	const daysRemaining = getDaysRemaining(paydate);
	if (daysRemaining <= 0) return "expired";
	return "active";
};

export const getStatusColor = (status: "active" | "expired" | "disabled") => {
	switch (status) {
		case "active":
			return "success";
		case "expired":
			return "warning";
		case "disabled":
			return "error";
	}
};
