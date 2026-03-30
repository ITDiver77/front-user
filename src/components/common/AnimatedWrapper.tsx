import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { pageVariants } from "../../styles/animations";

interface AnimatedWrapperProps {
	children: ReactNode;
}

export function AnimatedWrapper({ children }: AnimatedWrapperProps) {
	return (
		<AnimatePresence mode="wait">
			<motion.div
				initial="initial"
				animate="animate"
				exit="exit"
				variants={pageVariants}
				style={{ width: "100%", height: "100%" }}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	);
}

export function PageTransition({ children }: { children: ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			transition={{ duration: 0.25, ease: "easeOut" }}
		>
			{children}
		</motion.div>
	);
}
