import type { Variants } from "framer-motion";

export const pageVariants: Variants = {
	initial: {
		opacity: 0,
		y: 10,
	},
	animate: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.25,
			ease: "easeOut",
		},
	},
	exit: {
		opacity: 0,
		y: -10,
		transition: {
			duration: 0.2,
			ease: "easeIn",
		},
	},
};

export const cardVariants: Variants = {
	initial: {
		opacity: 0,
		scale: 0.95,
		y: 20,
	},
	animate: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			duration: 0.3,
			ease: "easeOut",
		},
	},
	hover: {
		y: -4,
		boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
		transition: {
			duration: 0.2,
			ease: "easeOut",
		},
	},
	tap: {
		scale: 0.98,
		transition: {
			duration: 0.1,
		},
	},
};

export const staggerContainer: Variants = {
	animate: {
		transition: {
			staggerChildren: 0.08,
		},
	},
};

export const staggerItem: Variants = {
	initial: {
		opacity: 0,
		y: 20,
	},
	animate: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
			ease: "easeOut",
		},
	},
};

export const modalVariants: Variants = {
	initial: {
		opacity: 0,
		scale: 0.9,
		y: 20,
	},
	animate: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			duration: 0.2,
			ease: "easeOut",
			type: "spring",
			damping: 25,
			stiffness: 300,
		},
	},
	exit: {
		opacity: 0,
		scale: 0.9,
		y: 20,
		transition: {
			duration: 0.15,
			ease: "easeIn",
		},
	},
};

export const backdropVariants: Variants = {
	initial: {
		opacity: 0,
	},
	animate: {
		opacity: 1,
		transition: {
			duration: 0.2,
		},
	},
	exit: {
		opacity: 0,
		transition: {
			duration: 0.15,
		},
	},
};

export const buttonVariants: Variants = {
	initial: {
		scale: 1,
	},
	hover: {
		scale: 1.02,
		transition: {
			duration: 0.15,
		},
	},
	tap: {
		scale: 0.98,
		transition: {
			duration: 0.1,
		},
	},
};

export const iconButtonVariants: Variants = {
	initial: {
		scale: 1,
	},
	hover: {
		scale: 1.1,
		transition: {
			duration: 0.15,
		},
	},
	tap: {
		scale: 0.9,
		transition: {
			duration: 0.1,
		},
	},
};

export const fadeInVariants: Variants = {
	initial: {
		opacity: 0,
	},
	animate: {
		opacity: 1,
		transition: {
			duration: 0.3,
		},
	},
	exit: {
		opacity: 0,
		transition: {
			duration: 0.2,
		},
	},
};

export const slideUpVariants: Variants = {
	initial: {
		opacity: 0,
		y: 30,
	},
	animate: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.4,
			ease: "easeOut",
		},
	},
	exit: {
		opacity: 0,
		y: -20,
		transition: {
			duration: 0.2,
		},
	},
};

export const scaleVariants: Variants = {
	initial: {
		scale: 0,
		opacity: 0,
	},
	animate: {
		scale: 1,
		opacity: 1,
		transition: {
			duration: 0.3,
			type: "spring",
			damping: 20,
			stiffness: 300,
		},
	},
	exit: {
		scale: 0,
		opacity: 0,
		transition: {
			duration: 0.2,
		},
	},
};

export const copySuccessVariants: Variants = {
	initial: {
		scale: 0,
		opacity: 0,
	},
	animate: {
		scale: 1,
		opacity: 1,
		transition: {
			type: "spring",
			damping: 15,
			stiffness: 300,
		},
	},
	exit: {
		scale: 0,
		opacity: 0,
		transition: {
			duration: 0.15,
		},
	},
};

export const skeletonVariants: Variants = {
	initial: {
		opacity: 0.5,
	},
	animate: {
		opacity: 1,
		transition: {
			repeat: Infinity,
			repeatType: "reverse",
			duration: 0.8,
			ease: "easeInOut",
		},
	},
};

export const transition = {
	fast: { duration: 0.15, ease: "easeOut" },
	normal: { duration: 0.25, ease: "easeOut" },
	slow: { duration: 0.4, ease: "easeOut" },
	spring: { type: "spring", damping: 20, stiffness: 300 },
};
